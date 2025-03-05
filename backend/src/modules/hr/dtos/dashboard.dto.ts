import { Field, ObjectType, Int, Float, ID } from '@nestjs/graphql';

/**
 * DTO for Hiring Trend data
 */
@ObjectType()
export class HiringTrendDto {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  applications: number;

  @Field(() => Int)
  interviews: number;

  @Field(() => Int)
  offers: number;

  @Field(() => Int)
  hires: number;
}

/**
 * DTO for Recruitment Funnel Item
 */
@ObjectType()
export class RecruitmentFunnelItemDto {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  value: number;

  @Field(() => String)
  color: string;
}

/**
 * DTO for Department Hiring Progress
 */
@ObjectType()
export class DepartmentHiringDto {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  current: number;

  @Field(() => Int)
  target: number;

  @Field(() => Int)
  hired: number;
}

/**
 * DTO for Active Candidate
 */
@ObjectType()
export class ActiveCandidateDto {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => String)
  role: string;

  @Field(() => String)
  department: string;

  @Field(() => String)
  status: string;

  @Field(() => Int)
  progress: number;

  @Field(() => Date, { nullable: true })
  nextInterview: Date | null;

  @Field(() => [String])
  recruiters: string[];
}

/**
 * DTO for Job Requisition
 */
@ObjectType()
export class JobRequisitionDto {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  title: string;

  @Field(() => String)
  department: string;

  @Field(() => Int)
  openPositions: number;

  @Field(() => Int)
  applicationsCount: number;

  @Field(() => String)
  status: string;

  @Field(() => String)
  priority: string;

  @Field(() => Date)
  createdAt: Date;
}

/**
 * DTO for Department Metrics
 */
@ObjectType()
export class DepartmentMetricDto {
  @Field(() => ID)
  id: number;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  employeeCount: number;

  @Field(() => Int)
  openPositions: number;

  @Field(() => Float)
  turnoverRate: number;

  @Field(() => Int)
  avgTimeToHire: number;
}

/**
 * DTO for Time to Hire Metrics
 */
@ObjectType()
export class TimeToHireMetricDto {
  @Field(() => Int)
  avgDaysToHire: number;

  @Field(() => Int)
  fastestHire: number;

  @Field(() => Int)
  slowestHire: number;
}

/**
 * Complete Dashboard Data DTO
 */
@ObjectType()
export class DashboardDataDto {
  @Field(() => [HiringTrendDto])
  hiringTrendsData: HiringTrendDto[];

  @Field(() => [RecruitmentFunnelItemDto])
  recruitmentFunnelData: RecruitmentFunnelItemDto[];

  @Field(() => [DepartmentHiringDto])
  departmentHiringData: DepartmentHiringDto[];

  @Field(() => [ActiveCandidateDto])
  activeCandidates: ActiveCandidateDto[];

  @Field(() => [JobRequisitionDto])
  jobRequisitions: JobRequisitionDto[];

  @Field(() => [DepartmentMetricDto])
  departmentMetrics: DepartmentMetricDto[];

  @Field(() => TimeToHireMetricDto)
  timeToHireMetrics: TimeToHireMetricDto;
}
