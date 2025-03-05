import { Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { HRController } from './hr.controller';
import { HRService } from './hr.service';
import {
  JobService,
  ApplicationService,
  InterviewService,
  HiringGoalService,
  AnalyticsService,
  DashboardService,
} from './services';
import {
  JobRepository,
  ApplicationRepository,
  InterviewRepository,
  HiringGoalRepository,
  DepartmentRepository,
  DashboardRepository,
} from './repositories';
import { UsersModule } from '../users/users.module';
import { HRDashboardResolver } from './hr.resolver';

@Module({
  imports: [UsersModule],
  controllers: [HRController],
  providers: [
    PrismaService,
    // Main HR Service
    HRService,
    // Specialized Services
    JobService,
    ApplicationService,
    InterviewService,
    HiringGoalService,
    AnalyticsService,
    DashboardService,
    // Repositories
    JobRepository,
    ApplicationRepository,
    InterviewRepository,
    HiringGoalRepository,
    DepartmentRepository,
    DashboardRepository,
    // Resolvers
    HRDashboardResolver,
  ],
  exports: [
    HRService,
    JobService,
    ApplicationService,
    InterviewService,
    HiringGoalService,
    AnalyticsService,
    DashboardService,
  ],
})
export class HRModule {}
