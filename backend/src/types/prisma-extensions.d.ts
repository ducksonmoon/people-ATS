import { PrismaClient } from '@prisma/client';

// Define interfaces for our models that extend Prisma's base models
interface HiringGoalExtended {
  id: number;
  departmentId: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Extended properties
  priority?: string;
  status?: string;
  budget?: number;
  notes?: string;
  department?: any;
  assignedRecruiters?: any[];
}

// Define extended properties for CompletedHiringGoal
interface CompletedHiringGoalExtended {
  id: number;
  departmentId: number;
  targetHeadcount: number;
  actualHeadcount: number;
  startDate: Date;
  endDate: Date;
  achieved: boolean;
  completedAt: Date;
  year: string;
  // Extended properties
  priority?: string;
  status?: string;
  budget?: number;
  notes?: string;
  achievementRate?: number;
}

// This declaration merges with the PrismaClient to add our custom models and fields
declare global {
  namespace PrismaClient {
    interface PrismaExtensions {
      // Add custom models that might not be recognized automatically
      $dmmf: {
        modelMap: {
          DepartmentGrowthPlan: any;
          ActivityLog: any;
          HiringGoalRecruiter: any;
        };
      };
    }
  }
}

// Extend PrismaClient to include our custom models
declare module '@prisma/client' {
  interface PrismaClient {
    departmentGrowthPlan: any;
    activityLog: any;
    hiringGoalRecruiter: any;
  }

  // Add strategicPriorities to CompanySettings model
  interface CompanySettings {
    strategicPriorities?: string | null;
  }

  // Extend the HiringGoal model
  interface HiringGoal extends HiringGoalExtended {}

  // Extend the User model to include departmentId and endDate
  interface User {
    departmentId?: number;
    endDate?: Date | null;
    HiringGoalRecruiter?: any[];
  }

  // Extend the CompletedHiringGoal model
  interface CompletedHiringGoal extends CompletedHiringGoalExtended {}

  namespace Prisma {
    // Add properties to HiringGoalInclude
    interface HiringGoalInclude {
      assignedRecruiters?: boolean | any;
      department?: boolean | any;
    }

    // Add properties to HiringGoalWhereInput
    interface HiringGoalWhereInput {
      status?: any;
      priority?: any;
    }

    // Add properties to UserWhereInput
    interface UserWhereInput {
      role?: any;
      status?: any;
    }

    // Add properties to CompletedHiringGoalCreateInput
    interface CompletedHiringGoalCreateInput {
      priority?: string;
      status?: string;
      budget?: number;
      notes?: string;
      achievementRate?: number;
    }

    // Add properties to CompletedHiringGoalUncheckedCreateInput
    interface CompletedHiringGoalUncheckedCreateInput {
      priority?: string;
      status?: string;
      budget?: number;
      notes?: string;
      achievementRate?: number;
    }
  }
}

export {}; // This file is a module
