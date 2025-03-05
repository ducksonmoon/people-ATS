import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsDate, IsBoolean, IsArray } from 'class-validator';

export enum HiringGoalPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum HiringGoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_TRACK = 'on_track',
  AT_RISK = 'at_risk',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export class HiringGoalDto {
  @IsNotEmpty()
  @IsNumber()
  departmentId: number;

  @IsNotEmpty()
  @IsNumber()
  targetHeadcount: number;

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsEnum(HiringGoalPriority)
  priority?: HiringGoalPriority;

  @IsOptional()
  @IsEnum(HiringGoalStatus)
  status?: HiringGoalStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsArray()
  assignedRecruiterIds?: number[];

  @IsOptional()
  @IsString()
  changeState?: string;

  @IsOptional()
  @IsBoolean()
  deleted?: boolean;
}

export class UpdateHiringGoalsDto {
  @IsNotEmpty()
  @IsArray()
  data: HiringGoalDto[];
} 