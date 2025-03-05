import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  Get,
  Query,
  HttpStatus,
  HttpCode,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './decorators/jwt-auth.guard';
import { RolesGuard } from './decorators/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { PrismaService } from '../../common/prisma.service';
import { Public } from './public.decorator';
import {
  AdminExistsResponse,
  AdminRegistrationDto,
  AuthResponse,
  AuthUser,
  LoginDto,
  MessageResponse,
  RegisterDto,
  RegisterResponse,
  PasswordResetDto,
  PasswordResetRequestDto,
  RefreshTokenDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Check if any admin users exist in the system
   * Used for initial setup flow
   */
  @Public()
  @Get('check-admin-exists')
  @HttpCode(HttpStatus.OK)
  async checkAdminExists(): Promise<AdminExistsResponse> {
    const adminCount = await this.prisma.user.count({
      where: { role: Role.ADMIN },
    });
    return { adminExists: adminCount > 0 };
  }

  /**
   * Register the initial admin user and create company
   * This can only be used if no admin users exist
   */
  @Public()
  @Post('register-admin')
  @HttpCode(HttpStatus.CREATED)
  async registerAdmin(
    @Body() body: AdminRegistrationDto,
  ): Promise<AuthResponse> {
    try {
      // Check if any admin already exists
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminCount > 0) {
        throw new BadRequestException(
          'Initial setup has already been completed. Use the admin login instead.',
        );
      }

      // Ensure the role is ADMIN
      if (body.admin.role !== Role.ADMIN) {
        throw new BadRequestException(
          'The first user must have the ADMIN role.',
        );
      }

      return await this.authService.registerAdminWithCompany(
        body.admin,
        body.company,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Log unexpected errors
      console.error('Error in registerAdmin:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during admin registration. Please try again.',
      );
    }
  }

  /**
   * Register a new user in the system
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto): Promise<RegisterResponse> {
    if (!body.password || !body.email || !body.role || !body.name) {
      throw new BadRequestException(
        'Email, name, password, and role are required',
      );
    }

    if (!Object.values(Role).includes(body.role)) {
      throw new BadRequestException(`Invalid role: ${body.role}`);
    }

    return this.authService.register(body);
  }

  /**
   * Authenticate a user and return JWT token
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto): Promise<AuthResponse> {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  /**
   * Get the authenticated user's profile
   */
  @Post('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Request() req): Promise<AuthUser> {
    return req.user;
  }

  /**
   * Example of role-protected endpoint
   */
  @Post('admin-only')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async adminOnly(@Request() req): Promise<MessageResponse> {
    return { message: `Hello, ${req.user.email}. You are an admin!` };
  }

  /**
   * Verify a user's email using token
   */
  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string): Promise<MessageResponse> {
    const user = await this.authService.getUserByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.authService.verifyUser(user);

    return { message: 'Email successfully verified' };
  }

  /**
   * Request a password reset email
   */
  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() body: PasswordResetRequestDto,
  ): Promise<MessageResponse> {
    await this.authService.sendPasswordResetEmail(body.email);
    return { message: 'Password reset email sent' };
  }

  /**
   * Reset a user's password using token
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: PasswordResetDto,
  ): Promise<MessageResponse> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: body.token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password successfully reset' };
  }

  /**
   * Refresh an access token using a refresh token
   */
  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: RefreshTokenDto): Promise<AuthResponse> {
    try {
      return this.authService.refreshToken(body.refresh_token);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
