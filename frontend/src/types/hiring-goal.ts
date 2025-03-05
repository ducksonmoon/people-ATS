import { TrackableEntity } from "./state-tracking";
import { HiringGoalPriority, HiringGoalStatus } from "./hiring-enums";

export interface Department {
  id: number;
  name: string;
  description: string | null;
  employeeCount?: number;
}

export interface HiringGoal {
  id: number;
  departmentId: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  department?: Department;
  priority: HiringGoalPriority;
  status: HiringGoalStatus;
  progressMetrics?: {
    currentHeadcount: number;
    openPositions: number;
    activeCandidates: number;
    interviewsScheduled: number;
    offersExtended: number;
  };
  notes?: string;
  budget?: number;
  assignedRecruiterIds?: number[];
}

export interface DepartmentMetrics {
  id: number;
  name: string;
  employeeCount: number;
  openPositions: number;
  turnoverRate: number;
  avgTimeToHire: number;
}

/**
 * Combined department with hiring goal data for displaying in UI
 */
export interface DepartmentGoal {
  id: number;
  name: string;
  description: string | null;
  currentEmployees: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  recentHires: number;
  priority: HiringGoalPriority;
  status: HiringGoalStatus;
  progressMetrics?: {
    openPositions: number;
    activeCandidates: number;
    interviewsScheduled: number;
    offersExtended: number;
  };
  notes?: string;
  budget?: number;
  assignedRecruiters?: { id: number; name: string }[];
  timeRemaining?: string;
  healthScore?: number;
}

/**
 * Trackable version of department goal for state management
 */
export type DepartmentWithGoal = TrackableEntity<DepartmentGoal>;

/**
 * Historical goal with achievement data
 */
export interface HistoricalGoal {
  id: number;
  departmentId: number;
  departmentName: string;
  targetHeadcount: number;
  actualHeadcount: number;
  startDate: Date;
  endDate: Date;
  achieved: boolean;
  status?: string;
  notes?: string;
  year: string;
  completionRate?: number;
  efficiency?: number;
  costPerHire?: number;
  timeToHire?: number;
  qualityOfHire?: number;
}
