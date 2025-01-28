import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsResolver } from './jobs.resolver';
import { PrismaService } from '../../common/prisma.service';
import { JobsController } from './jobs.controller';

@Module({
  providers: [JobsService, JobsResolver, PrismaService],
  controllers: [JobsController],
})
export class JobsModule {}
