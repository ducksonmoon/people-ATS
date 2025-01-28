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
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { PrismaService } from '../../common/prisma.service';
import { Public } from './public.decorator';

import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Post('register')
  async register(
    @Body() body: { email: string; password: string; role: Role },
  ) {
    if (!body.password || !body.email || !body.role) {
      throw new BadRequestException('Email, password, and role are required');
    }

    if (!Object.values(Role).includes(body.role)) {
      throw new BadRequestException(`Invalid role: ${body.role}`);
    }

    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req) {
    return req.user;
  }

  @Post('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async adminOnly(@Request() req) {
    return { message: `Hello, ${req.user.email}. You are an admin!` };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.authService.getUserByVerificationToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.authService.verifyUser(user);

    return { message: 'Email successfully verified' };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { email: string }) {
    await this.authService.sendPasswordResetEmail(body.email);
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
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
}
