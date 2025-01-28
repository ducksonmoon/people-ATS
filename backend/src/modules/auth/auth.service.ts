import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { Role, User } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: { email: string; password: string; role: Role }) {
    if (!data.password) {
      throw new Error('Password is required');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    try {
      await this.sendVerificationEmail(user.id, user.email);
    } catch (error) {
      return {
        message: 'User registered successfully, but email verification failed.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          emailSent: false,
        },
      };
    }

    return {
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        emailSent: true,
      },
    };
  }

  async sendVerificationEmail(userId: number, email: string) {
    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationToken: token },
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.emailService.sendEmail(
      email,
      'Verify Your Email',
      `
    <p>Click the link below to verify your email:</p>
    <a href="${verificationLink}">Verify Email</a>
  `,
    );
  }

  async getUserByVerificationToken(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    return user;
  }

  async verifyUser(user: User) {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    return;
  }

  async sendPasswordResetEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendEmail(
      email,
      'Reset Your Password',
      `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `,
    );
  }
}
