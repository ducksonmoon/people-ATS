import { Module } from '@nestjs/common';
import { GrowthPlanService } from './growth-plan.service';
import { GrowthPlanController } from './growth-plan.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [GrowthPlanController],
  providers: [GrowthPlanService, PrismaService],
  exports: [GrowthPlanService],
})
export class GrowthPlanModule {}
