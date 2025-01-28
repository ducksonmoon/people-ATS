import { Module } from '@nestjs/common';
import { RecruiterController } from './recruiter.controller';
import { RecruiterService } from './recruiter.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [RecruiterController],
  providers: [RecruiterService, PrismaService],
})
export class RecruiterModule {}
