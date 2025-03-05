import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { Role } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  AuthUser,
  AuthResponse,
  RegisterDto,
  CompanyDto,
  RegisterResponse,
} from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
import {
  InvalidCredentialsException,
  TokenExpiredException,
  InvalidTokenException,
  AccountNotActivatedException,
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '../../common/exceptions/auth-exceptions';

// Define JWT payload interface
interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  tokenType?: string;
}

interface PrismaUser {
  id: number;
  email: string;
  name: string;
  password: string;
  role: Role;
  departmentId?: number | null;
  hireDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  verificationToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly EMAIL_VERIFICATION_REQUIRED: boolean;
  private readonly FRONTEND_URL: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_IN: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.EMAIL_VERIFICATION_REQUIRED =
      this.configService.get<string>('REQUIRE_EMAIL_VERIFICATION', 'false') ===
      'true';
    this.FRONTEND_URL = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    this.JWT_EXPIRES_IN = this.configService.get<string>(
      'JWT_EXPIRES_IN',
      '1d',
    );
    this.REFRESH_TOKEN_EXPIRES_IN = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRES_IN',
      '7d',
    );
  }

  /**
   * Validates user credentials
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.getUserByEmail(email);

    // Check if user exists
    if (!user) {
      throw new InvalidCredentialsException();
    }

    // Check if email is verified (if required)
    if (!user.emailVerified && this.EMAIL_VERIFICATION_REQUIRED) {
      throw new AccountNotActivatedException();
    }

    // Validate password
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    // Return user without password
    return this.sanitizeUser(user);
  }

  /**
   * Generates JWT tokens after successful login
   */
  async login(user: AuthUser): Promise<AuthResponse> {
    const payload = this.createJwtPayload(user);
    const expiresInSeconds = this.getExpiresInSeconds(this.JWT_EXPIRES_IN);
    const refreshToken = this.generateRefreshToken(user.id);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
      user,
    };
  }

  /**
   * Generates auth tokens within a transaction
   * Used for admin registration to ensure transaction integrity
   */
  private generateAuthTokensInTransaction(
    prisma: any,
    user: AuthUser,
  ): {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  } {
    const payload = this.createJwtPayload(user);
    const expiresInSeconds = this.getExpiresInSeconds(this.JWT_EXPIRES_IN);
    const refreshToken = this.generateRefreshToken(user.id);

    // Store refresh token within the transaction
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresInSeconds * 1000);

    // Create refresh token within the transaction
    prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        revoked: false,
      },
    });

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: expiresInSeconds,
    };
  }

  /**
   * Refreshes an access token using a valid refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const tokenRecord = await this.findRefreshToken(refreshToken);

      // Validate the token
      if (!tokenRecord) {
        throw new InvalidTokenException('Refresh token not found');
      }

      this.validateRefreshTokenStatus(tokenRecord);

      // Extract user from the token record
      const user = this.sanitizeUser(tokenRecord.user);

      // Generate tokens
      const payload = this.createJwtPayload(user);
      const expiresInSeconds = this.getExpiresInSeconds(this.JWT_EXPIRES_IN);
      const newRefreshToken = this.generateRefreshToken(user.id);

      // Revoke the old token and store the new one
      await this.revokeRefreshToken(refreshToken);
      await this.storeRefreshToken(user.id, newRefreshToken);

      return {
        access_token: this.jwtService.sign(payload),
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: expiresInSeconds,
        user,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InvalidTokenException('Failed to refresh token');
    }
  }

  /**
   * Registers a new user in the system
   */
  async register(data: RegisterDto): Promise<RegisterResponse> {
    this.validateRegistrationData(data);

    const hashedPassword = await this.hashPassword(data.password);

    const user = await this.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    try {
      await this.sendVerificationEmail(user.id, user.email);
      return this.createRegisterResponse(user, data.name, true);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email: ${error.message}`,
        error.stack,
      );
      return this.createRegisterResponse(user, data.name, false);
    }
  }

  /**
   * Sends password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);

    if (!user) {
      throw new UserNotFoundException();
    }

    const token = this.generateRandomToken();
    const expiry = this.generateTokenExpiry(1); // 1 hour expiry

    await this.updateUserResetToken(user.id, token, expiry);

    const resetLink = `${this.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendEmail(
      email,
      'Reset Your Password',
      this.createResetPasswordEmailContent(resetLink),
    );
  }

  /**
   * Registers an admin user and creates a company in a single transaction
   */
  async registerAdminWithCompany(
    adminData: RegisterDto,
    companyData: CompanyDto,
  ): Promise<AuthResponse> {
    this.validateRegistrationData(adminData);

    try {
      // Check if email already exists
      await this.ensureEmailNotTaken(adminData.email);

      this.logger.log(`Starting admin registration for ${adminData.email}`);
      const hashedPassword = await this.hashPassword(adminData.password);

      // Use a transaction to ensure both admin and company are created together
      return await this.prisma.$transaction(async (prisma) => {
        try {
          this.logger.log(`Creating admin user in transaction`);

          // Create the admin user
          const user = await this.createAdminUserInTransaction(
            prisma,
            adminData,
            hashedPassword,
          );

          // Manage company settings
          await this.manageCompanySettingsInTransaction(prisma, companyData);

          // Generate auth tokens within the transaction to ensure database consistency
          const sanitizedUser = this.sanitizeUser(user);
          const tokens = this.generateAuthTokensInTransaction(
            prisma,
            sanitizedUser,
          );

          // Return complete auth response
          return {
            ...tokens,
            user: sanitizedUser,
          };
        } catch (txError) {
          this.logTransactionError(
            txError,
            'registerAdminWithCompany:transaction',
          );
          throw txError;
        }
      });
    } catch (error) {
      this.handleRegistrationError(error);
    }
  }

  /**
   * Gets a user by verification token
   */
  async getUserByVerificationToken(token: string): Promise<PrismaUser | null> {
    return this.prisma.user.findFirst({
      where: { verificationToken: token },
    }) as Promise<PrismaUser | null>;
  }

  /**
   * Verifies a user's email address
   */
  async verifyUser(user: PrismaUser): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Creates a JWT payload from user data
   */
  private createJwtPayload(user: AuthUser): JwtPayload {
    return {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
  }

  /**
   * Sanitizes a user object by removing sensitive data
   */
  private sanitizeUser(user: PrismaUser): AuthUser {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as AuthUser;
  }

  /**
   * Validates refresh token expiration and revocation status
   */
  private validateRefreshTokenStatus(tokenRecord: any): void {
    if (tokenRecord.expiresAt < new Date()) {
      throw new TokenExpiredException('Refresh token has expired');
    }

    if (tokenRecord.revoked) {
      // Potential token reuse - revoke all tokens for this user as a security measure
      this.revokeAllUserTokens(tokenRecord.userId);
      throw new InvalidTokenException(
        'Token has been revoked. Please login again.',
      );
    }
  }

  /**
   * Finds a refresh token including its associated user
   */
  private async findRefreshToken(token: string): Promise<any> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Revokes a specific refresh token
   */
  private async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  /**
   * Revokes all refresh tokens for a specific user
   */
  private async revokeAllUserTokens(userId: number): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  /**
   * Generates a new refresh token
   */
  private generateRefreshToken(userId: number): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Stores a refresh token in the database
   */
  private async storeRefreshToken(
    userId: number,
    token: string,
  ): Promise<void> {
    const expiresInSeconds = this.getExpiresInSeconds(
      this.REFRESH_TOKEN_EXPIRES_IN,
    );
    const expiresAt = new Date();
    expiresAt.setTime(expiresAt.getTime() + expiresInSeconds * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        revoked: false,
      },
    });
  }

  /**
   * Converts expiration string (like "1d", "7d", "60m") to seconds
   */
  private getExpiresInSeconds(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 86400; // Default to 1 day
    }
  }

  /**
   * Creates a registration response object
   */
  private createRegisterResponse(
    user: PrismaUser,
    name: string,
    emailSent: boolean,
  ): RegisterResponse {
    const message = emailSent
      ? 'User registered successfully. Please verify your email.'
      : 'User registered successfully, but email verification failed.';

    return {
      message,
      data: {
        user: {
          id: user.id,
          name,
          email: user.email,
          role: user.role,
        },
        emailSent,
      },
    };
  }

  /**
   * Hashes a password with bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verifies a password against a hash
   */
  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Sends verification email to a newly registered user
   */
  private async sendVerificationEmail(
    userId: number,
    email: string,
  ): Promise<void> {
    const token = this.generateRandomToken();
    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationToken: token },
    });

    const verificationLink = `${this.FRONTEND_URL}/verify-email?token=${token}`;
    await this.emailService.sendEmail(
      email,
      'Verify Your Email',
      this.createVerificationEmailContent(verificationLink),
    );
  }

  /**
   * Creates verification email content
   */
  private createVerificationEmailContent(verificationLink: string): string {
    return `
      <p>Click the link below to verify your email:</p>
      <a href="${verificationLink}">Verify Email</a>
    `;
  }

  /**
   * Creates reset password email content
   */
  private createResetPasswordEmailContent(resetLink: string): string {
    return `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `;
  }

  /**
   * Generates a random token for verification or password reset
   */
  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Creates a token expiry date
   */
  private generateTokenExpiry(hours: number): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry;
  }

  /**
   * Updates a user's reset token
   */
  private async updateUserResetToken(
    userId: number,
    token: string,
    expiry: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
  }

  /**
   * Gets a user by email
   */
  private async getUserByEmail(email: string): Promise<PrismaUser | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    }) as Promise<PrismaUser | null>;
  }

  /**
   * Creates a new user
   */
  private async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }): Promise<PrismaUser> {
    return this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        role: userData.role,
      },
    }) as Promise<PrismaUser>;
  }

  /**
   * Validates registration data
   */
  private validateRegistrationData(data: RegisterDto): void {
    if (!data.password) {
      throw new BadRequestException('Password is required');
    }

    // Email validation could be added here
    if (!data.email) {
      throw new BadRequestException('Email is required');
    }
  }

  /**
   * Ensures an email is not already taken
   */
  private async ensureEmailNotTaken(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.getUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new EmailAlreadyInUseException();
    }
  }

  /**
   * Creates an admin user within a transaction
   */
  private async createAdminUserInTransaction(
    prisma: any,
    adminData: RegisterDto,
    hashedPassword: string,
  ): Promise<PrismaUser> {
    return prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email.toLowerCase().trim(),
        password: hashedPassword,
        role: Role.ADMIN,
        emailVerified: true, // Auto-verify the first admin
      },
    }) as Promise<PrismaUser>;
  }

  /**
   * Manages company settings within a transaction
   */
  private async manageCompanySettingsInTransaction(
    prisma: any,
    companyData: CompanyDto,
  ): Promise<void> {
    this.logger.log(`Checking for existing company settings`);
    let companySettings = await prisma.companySettings.findFirst();

    if (!companySettings) {
      this.logger.log(`No company settings found, creating new ones`);
      await prisma.companySettings.create({
        data: {
          companyName: companyData.name.trim(),
          website: companyData.website ? companyData.website.trim() : '',
          showNameInNav: true,
          primaryColor: '#1E3A5F', // Default primary color
        },
      });
      this.logger.log(`Company settings created successfully`);
    } else {
      this.logger.log(`Existing company settings found: ${companySettings.id}`);
    }
  }

  /**
   * Logs transaction errors
   */
  private logTransactionError(error: any, context: string): void {
    this.logger.error(
      `Transaction error: ${error.message}`,
      error.stack,
      context,
    );
  }

  /**
   * Handles registration errors
   */
  private handleRegistrationError(error: any): never {
    this.logger.error(
      `Failed to register: ${error.message}`,
      error.stack,
      'registration',
    );

    if (error.code === 'P2002') {
      // This is a Prisma unique constraint violation (likely email)
      throw new EmailAlreadyInUseException();
    }

    if (error instanceof HttpException) {
      // Re-throw HTTP exceptions directly
      throw error;
    }

    if (error.message) {
      // Provide a more specific error message if available
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }

    throw new BadRequestException(
      'Failed to complete registration. Please try again.',
    );
  }
}
