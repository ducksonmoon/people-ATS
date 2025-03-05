import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtKeysService } from './jwt-keys.service';

@Module({
  imports: [ConfigModule],
  providers: [JwtKeysService],
  exports: [JwtKeysService],
})
export class JwtKeysModule {}
