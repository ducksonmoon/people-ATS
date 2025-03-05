import { Module } from '@nestjs/common';
import { RecruiterController } from './recruiter.controller';
import { RecruiterService } from './recruiter.service';
import { PrismaService } from '../../common/prisma.service';
import { HRModule } from '../hr/hr.module';

@Module({
  imports: [HRModule],
  controllers: [RecruiterController],
  providers: [RecruiterService, PrismaService],
  exports: [RecruiterService],
})
export class RecruiterModule {}
