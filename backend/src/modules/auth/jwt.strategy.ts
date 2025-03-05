import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtKeysService } from './jwt-keys.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private jwtKeysService: JwtKeysService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        requestedKeyId: string,
        rawJwtToken: string,
        done: Function,
      ) => {
        try {
          const secrets = this.jwtKeysService.getAllSecrets();
          if (!secrets || secrets.length === 0) {
            this.logger.warn('No secrets available for JWT validation');
            const fallbackSecret = this.configService.get<string>('JWT_SECRET');
            if (fallbackSecret) {
              return done(null, fallbackSecret);
            }
            return done(new Error('No valid JWT secrets available'), null);
          }
          done(null, secrets);
        } catch (error) {
          this.logger.error('Error in JWT validation', error);
          done(error, null);
        }
      },
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
