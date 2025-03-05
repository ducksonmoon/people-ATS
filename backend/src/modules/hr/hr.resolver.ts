import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from './services/dashboard.service';
import {
  DashboardDataDto,
  DepartmentMetricDto,
  HiringTrendDto,
  TimeToHireMetricDto,
  RecruitmentFunnelItemDto,
  DepartmentHiringDto,
  ActiveCandidateDto,
  JobRequisitionDto,
} from './dtos/dashboard.dto';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
export class HRDashboardResolver {
  constructor(private dashboardService: DashboardService) {}

  /**
   * Get complete dashboard data
   */
  @Query(() => DashboardDataDto)
  @Roles(Role.HR, Role.ADMIN)
  async hrDashboardData(
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<DashboardDataDto> {
    return this.dashboardService.getDashboardData(skipCache || false);
  }

  /**
   * Get hiring trends data
   */
  @Query(() => [HiringTrendDto])
  @Roles(Role.HR, Role.ADMIN)
  async hiringTrends(
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<HiringTrendDto[]> {
    return this.dashboardService.getHiringTrends(skipCache || false);
  }

  /**
   * Get time-to-hire metrics
   */
  @Query(() => TimeToHireMetricDto)
  @Roles(Role.HR, Role.ADMIN)
  async timeToHireMetrics(
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<TimeToHireMetricDto> {
    return this.dashboardService.getTimeToHireMetrics(skipCache || false);
  }

  /**
   * Get recruitment funnel data
   */
  @Query(() => [RecruitmentFunnelItemDto])
  @Roles(Role.HR, Role.ADMIN)
  async recruitmentFunnel(
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<RecruitmentFunnelItemDto[]> {
    return this.dashboardService.getRecruitmentFunnel(skipCache || false);
  }

  /**
   * Get department hiring data
   */
  @Query(() => [DepartmentHiringDto])
  @Roles(Role.HR, Role.ADMIN)
  async departmentHiring(
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<DepartmentHiringDto[]> {
    return this.dashboardService.getDepartmentHiring(skipCache || false);
  }

  /**
   * Get active candidates
   */
  @Query(() => [ActiveCandidateDto])
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  async activeCandidates(
    @Args('departmentId', { type: () => Int, nullable: true })
    departmentId?: number,
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<ActiveCandidateDto[]> {
    return this.dashboardService.getActiveCandidates(
      departmentId,
      skipCache || false,
    );
  }

  /**
   * Get job requisitions
   */
  @Query(() => [JobRequisitionDto])
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  async jobRequisitions(
    @Args('departmentId', { type: () => Int, nullable: true })
    departmentId?: number,
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<JobRequisitionDto[]> {
    return this.dashboardService.getJobRequisitions(
      departmentId,
      skipCache || false,
    );
  }

  /**
   * Get department metrics
   */
  @Query(() => [DepartmentMetricDto])
  @Roles(Role.HR, Role.ADMIN)
  async departmentMetrics(
    @Args('skipCache', { type: () => Boolean, nullable: true })
    skipCache?: boolean,
  ): Promise<DepartmentMetricDto[]> {
    return this.dashboardService.getDepartmentMetrics(skipCache || false);
  }
}
