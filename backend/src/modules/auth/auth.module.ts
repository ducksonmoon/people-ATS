import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../common/prisma.service';
import { EmailService } from '../../common/email/email.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './decorators/jwt-auth.guard';
import { JwtKeysService } from './jwt-keys.service';
import { JwtKeysModule } from './jwt-keys.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtKeysModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, JwtKeysModule],
      inject: [ConfigService, JwtKeysService],
      useFactory: async (
        configService: ConfigService,
        jwtKeysService: JwtKeysService,
      ) => {
        // Get JWT configuration from environment or use defaults
        return {
          secret: jwtKeysService.getActiveSecret(),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
            keyid: jwtKeysService.getActiveKeyId(),
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    EmailService,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
