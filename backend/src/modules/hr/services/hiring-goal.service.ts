import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { HiringGoalRepository } from '../repositories/hiring-goal.repository';
import { DepartmentRepository } from '../repositories/department.repository';
import {
  HiringGoalDto,
  HiringGoalStatus,
  HiringGoalPriority,
} from '../dtos/hiring-goal.dto';
import {
  HiringGoal,
  CompletedHiringGoal,
  Prisma,
  Department,
  Job,
  Application,
} from '@prisma/client';

// Define interfaces for the repository return types with proper includes
interface DepartmentWithIncludes extends Department {
  employees: any[];
  jobs: (Job & {
    applications: Application[];
  })[];
}

interface HiringGoalWithIncludes extends HiringGoal {
  department: Department;
  assignedRecruiters?: {
    recruiterId: number;
    recruiter: {
      name: string;
      id: number;
    };
  }[];
}

interface CompletedHiringGoalWithIncludes extends CompletedHiringGoal {
  department: Department;
}

// Define interface for department metrics
interface DepartmentMetrics {
  departmentId: number;
  departmentName: string;
  timeToHire: number | null;
  efficiency: number;
  costPerHire: number | null;
  qualityScore: number;
  totalApplications: number;
  totalHires: number;
}

// Define enhanced goal interface
interface EnhancedHiringGoal {
  id: number;
  departmentId: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  priority?: string;
  status: string;
  notes?: string;
  budget?: number;
  progressMetrics: {
    currentHeadcount: number;
    openPositions: number;
    activeCandidates: number;
    interviewsScheduled: number;
    offersExtended: number;
  };
  healthScore: number;
  assignedRecruiters: {
    id: number;
    name: string;
  }[];
  // Additional fields from HiringGoal
  [key: string]: any;
}

// Define historical goal interface
interface HistoricalHiringGoal {
  id: number;
  departmentId: number;
  departmentName: string;
  targetHeadcount: number;
  actualHeadcount: number;
  startDate: Date;
  endDate: Date;
  achieved: boolean;
  status: string;
  notes?: string;
  year: string;
  completionRate?: number;
  efficiency?: number | null;
  costPerHire?: number | null;
  timeToHire?: number | null;
  qualityOfHire?: number | null;
}

@Injectable()
export class HiringGoalService {
  private readonly logger = new Logger(HiringGoalService.name);

  constructor(
    private hiringGoalRepository: HiringGoalRepository,
    private departmentRepository: DepartmentRepository,
  ) {}

  /**
   * Retrieves all hiring goals with enhanced metrics and context
   */
  async getHiringGoals(): Promise<EnhancedHiringGoal[]> {
    const goals =
      (await this.hiringGoalRepository.findAll()) as HiringGoalWithIncludes[];

    // Enhanced goals with additional context
    const enhancedGoals = await Promise.all(
      goals.map(async (goal) => {
        // Get department details
        const department = (await this.departmentRepository.findById(
          goal.departmentId,
        )) as DepartmentWithIncludes;

        // Calculate department metrics
        const metrics = this.calculateDepartmentMetrics(department);

        // Calculate goal status and health
        const { status, healthScore } = this.calculateGoalHealth(
          goal,
          department,
          metrics,
        );

        // Format assigned recruiters
        const assignedRecruiters = goal.assignedRecruiters
          ? goal.assignedRecruiters.map((ar) => ({
              id: ar.recruiterId,
              name: ar.recruiter.name,
            }))
          : [];

        return {
          ...goal,
          progressMetrics: metrics,
          status,
          healthScore,
          assignedRecruiters,
        };
      }),
    );

    return enhancedGoals;
  }

  /**
   * Updates multiple hiring goals in a batch operation
   */
  async updateHiringGoals(
    goals: HiringGoalDto[],
    userId: number,
  ): Promise<{ count: number; deleted: number }> {
    // Validate input
    this.validateHiringGoals(goals);

    // Filter out any items with undefined departmentIds
    const validGoals = goals.filter((goal) => goal.departmentId !== undefined);

    // Process items marked for deletion vs. items to create/update
    const itemsToDelete = validGoals.filter((goal) => goal.deleted === true);
    const itemsToCreate = validGoals.filter((goal) => !goal.deleted);

    // Track results for both operations
    let deleteCount = 0;
    let createCount = 0;

    // Process deletions
    deleteCount = await this.processGoalDeletions(itemsToDelete);

    // Process creations/updates
    createCount = await this.processGoalCreations(itemsToCreate);

    return {
      count: createCount,
      deleted: deleteCount,
    };
  }

  /**
   * Retrieves historical and current hiring goals with performance metrics
   */
  async getHistoricalHiringGoals(): Promise<HistoricalHiringGoal[]> {
    // Get current active hiring goals
    const currentGoals =
      (await this.hiringGoalRepository.findAll()) as HiringGoalWithIncludes[];

    // Get completed/historical goals
    const completedGoals =
      (await this.hiringGoalRepository.findAllCompleted()) as CompletedHiringGoalWithIncludes[];

    // Get current department data
    const departments =
      (await this.departmentRepository.findAll()) as DepartmentWithIncludes[];

    // Calculate department metrics
    const hiringMetrics = await this.getHiringMetricsByDepartment();

    const currentYear = new Date().getFullYear();

    // Prepare results array
    const historicalGoals: HistoricalHiringGoal[] = [];

    // Add current in-progress goals
    for (const goal of currentGoals) {
      const dept = departments.find(
        (d) => d.id === goal.departmentId,
      ) as DepartmentWithIncludes;
      if (dept) {
        // Get department metrics
        const deptMetrics = hiringMetrics.find(
          (m) => m.departmentId === goal.departmentId,
        ) || {
          efficiency: null,
          costPerHire: null,
          timeToHire: null,
          qualityScore: null,
        };

        const employeeCount = dept.employees.length;
        const status =
          employeeCount >= goal.targetHeadcount
            ? 'completed'
            : (goal.status as string) || 'in_progress';

        historicalGoals.push({
          id: goal.id,
          departmentId: goal.departmentId,
          departmentName: goal.department.name,
          targetHeadcount: goal.targetHeadcount,
          actualHeadcount: employeeCount,
          startDate: goal.startDate,
          endDate: goal.endDate,
          achieved: employeeCount >= goal.targetHeadcount,
          status,
          notes:
            goal.notes ||
            (employeeCount >= goal.targetHeadcount
              ? 'Target achieved'
              : 'Working towards target'),
          year: currentYear.toString(),
          completionRate: (employeeCount / goal.targetHeadcount) * 100,
          efficiency: deptMetrics.efficiency || null,
          costPerHire: deptMetrics.costPerHire || null,
          timeToHire: deptMetrics.timeToHire || null,
          qualityOfHire: deptMetrics.qualityScore || null,
        });
      }
    }

    // Add completed goals from database
    for (const goal of completedGoals) {
      historicalGoals.push({
        id: goal.id,
        departmentId: goal.departmentId,
        departmentName: goal.department.name,
        targetHeadcount: goal.targetHeadcount,
        actualHeadcount: goal.actualHeadcount,
        startDate: goal.startDate,
        endDate: goal.endDate,
        achieved: goal.achieved,
        status: goal.achieved ? 'Achieved' : 'Not Achieved',
        notes: goal.notes || '',
        year: goal.year,
      });
    }

    return historicalGoals;
  }

  /**
   * Archives hiring goals that have passed their end date
   */
  async archiveExpiredHiringGoals(): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    try {
      // Find expired goals that haven't been archived
      const expiredGoals =
        (await this.hiringGoalRepository.findExpired()) as HiringGoalWithIncludes[];

      if (expiredGoals.length === 0) {
        return {
          success: true,
          count: 0,
          message: 'No expired hiring goals found to archive',
        };
      }

      // Process each goal
      let archivedCount = 0;

      for (const goal of expiredGoals) {
        // Get department details
        const department = (await this.departmentRepository.findById(
          goal.departmentId,
        )) as DepartmentWithIncludes;

        if (!department) {
          continue; // Skip if department not found
        }

        // Calculate current headcount
        const headcount = department.employees.length;

        // Create a completed hiring goal record - fixing the schema issue here
        const completedGoalData: Prisma.CompletedHiringGoalCreateInput = {
          department: { connect: { id: goal.departmentId } },
          targetHeadcount: goal.targetHeadcount,
          actualHeadcount: headcount,
          startDate: goal.startDate,
          endDate: goal.endDate,
          achieved: headcount >= goal.targetHeadcount,
          notes: goal.notes || '',
          year: goal.endDate.getFullYear().toString(),
        };

        const completedGoal =
          await this.hiringGoalRepository.createCompletedGoal(
            completedGoalData,
          );

        // Delete the original goal
        await this.hiringGoalRepository.delete(goal.id);

        // Create an activity log entry
        await this.hiringGoalRepository.logActivity(
          'ARCHIVE_HIRING_GOAL',
          `Archived hiring goal for ${department.name}`,
          'HIRING_GOAL',
          `${goal.id},${completedGoal.id}`,
        );

        archivedCount++;
      }

      // Return success response
      const message = `Successfully archived ${archivedCount} expired hiring goals`;
      this.logger.log(message);
      return { success: true, count: archivedCount, message };
    } catch (error) {
      this.logger.error('Error archiving expired hiring goals:', error.message);
      return {
        success: false,
        count: 0,
        message: `Failed to archive expired hiring goals: ${error.message}`,
      };
    }
  }

  /**
   * Calculate metrics for a department
   */
  private calculateDepartmentMetrics(department: DepartmentWithIncludes): {
    currentHeadcount: number;
    openPositions: number;
    activeCandidates: number;
    interviewsScheduled: number;
    offersExtended: number;
  } {
    const employees = department.employees;

    // Get open positions count
    const openPositions = department.jobs.filter(
      (job) => job.status === 'OPEN',
    ).length;

    // Get active candidates count
    const activeCandidatesCount = department.jobs
      .flatMap((job) => job.applications)
      .filter((app) =>
        ['PENDING', 'SCREENING', 'INTERVIEWING', 'OFFER_SENT'].includes(
          app.status,
        ),
      ).length;

    // Get interviews scheduled count
    const interviewsScheduled = department.jobs
      .flatMap((job) => job.applications)
      .filter((app) => app.status === 'INTERVIEWING').length;

    // Get offers extended count
    const offersExtended = department.jobs
      .flatMap((job) => job.applications)
      .filter((app) => app.status === 'OFFER_SENT').length;

    // Get current headcount
    const currentHeadcount = employees.filter(
      (emp) => emp.role === 'EMPLOYEE',
    ).length;

    return {
      currentHeadcount,
      openPositions,
      activeCandidates: activeCandidatesCount,
      interviewsScheduled,
      offersExtended,
    };
  }

  /**
   * Calculate goal health and status
   */
  private calculateGoalHealth(
    goal: HiringGoalWithIncludes,
    department: DepartmentWithIncludes,
    metrics: {
      currentHeadcount: number;
      openPositions: number;
      offersExtended: number;
    },
  ): { status: string; healthScore: number } {
    const currentDate = new Date();

    // Calculate time progress percentage
    const totalDuration = goal.endDate.getTime() - goal.startDate.getTime();
    const elapsedDuration = currentDate.getTime() - goal.startDate.getTime();
    const timeProgressPercentage =
      Math.min(Math.max(elapsedDuration / totalDuration, 0), 1) * 100;

    // Calculate hiring progress percentage
    const hiringGoal = Math.max(
      0,
      goal.targetHeadcount - metrics.currentHeadcount,
    );
    const hiringProgress =
      hiringGoal <= 0
        ? 100
        : ((metrics.openPositions + metrics.offersExtended) / hiringGoal) * 100;

    // Determine status based on progress
    let status = goal.status || 'in_progress';
    if (metrics.currentHeadcount >= goal.targetHeadcount) {
      status = 'completed';
    } else if (timeProgressPercentage > 75 && hiringProgress < 50) {
      status = 'at_risk';
    } else if (hiringProgress > timeProgressPercentage) {
      status = 'on_track';
    } else if (hiringProgress > 0) {
      status = 'in_progress';
    } else {
      status = 'not_started';
    }

    // Calculate health score
    let healthScore = 0;
    if (status === 'completed') {
      healthScore = 100;
    } else if (status === 'on_track') {
      healthScore = 80;
    } else if (status === 'in_progress') {
      healthScore = 60;
    } else if (status === 'at_risk') {
      healthScore = 30;
    } else {
      healthScore = 10;
    }

    return { status, healthScore };
  }

  /**
   * Validates hiring goals input
   */
  private validateHiringGoals(goals: HiringGoalDto[]): void {
    // Check if the entire request is missing departmentIds
    if (
      goals.length > 0 &&
      goals.every((goal) => goal.departmentId === undefined)
    ) {
      throw new BadRequestException(
        'Missing required field: departmentId must be provided for all hiring goals',
      );
    }
  }

  /**
   * Process goals marked for deletion
   */
  private async processGoalDeletions(
    itemsToDelete: HiringGoalDto[],
  ): Promise<number> {
    if (itemsToDelete.length === 0) {
      return 0;
    }

    // Get the departmentIds for deletion
    const departmentsToDelete = itemsToDelete.map((goal) => goal.departmentId);

    this.logger.log(
      `Deleting goals for departments: ${departmentsToDelete.join(', ')}`,
    );

    // Delete goals for departments marked for deletion
    const result =
      await this.hiringGoalRepository.deleteByDepartmentIds(
        departmentsToDelete,
      );

    // Add log entry for deletion
    await this.hiringGoalRepository.logActivity(
      'DELETE_HIRING_GOALS',
      `Deleted hiring goals for ${departmentsToDelete.length} departments`,
      'HIRING_GOAL',
      departmentsToDelete.join(','),
    );

    this.logger.log(`Deleted ${result.count} hiring goals`);
    return result.count;
  }

  /**
   * Process goals for creation/update
   */
  private async processGoalCreations(
    itemsToCreate: HiringGoalDto[],
  ): Promise<number> {
    if (itemsToCreate.length === 0) {
      return 0;
    }

    // Get the departmentIds for update/create
    const departmentsToUpdate = itemsToCreate.map((goal) => goal.departmentId);

    this.logger.log(
      `Updating goals for departments: ${departmentsToUpdate.join(', ')}`,
    );

    // Delete existing goals for these departments
    await this.hiringGoalRepository.deleteByDepartmentIds(departmentsToUpdate);

    // Create new goals with enhanced fields
    const goalsToCreate = itemsToCreate.map((goal) => ({
      departmentId: goal.departmentId,
      targetHeadcount: goal.targetHeadcount,
      startDate: goal.startDate,
      endDate: goal.endDate,
      priority: goal.priority || HiringGoalPriority.MEDIUM,
      status: goal.status || HiringGoalStatus.NOT_STARTED,
      notes: goal.notes,
      budget: goal.budget,
    }));

    const result = await this.hiringGoalRepository.createMany(goalsToCreate);

    // Create recruiter assignments if provided
    await this.assignRecruitersToGoals(itemsToCreate);

    // Log the activity
    await this.hiringGoalRepository.logActivity(
      'UPDATE_HIRING_GOALS',
      `Updated hiring goals for ${departmentsToUpdate.length} departments`,
      'HIRING_GOAL',
      departmentsToUpdate.join(','),
    );

    this.logger.log(`Created ${result.count} hiring goals`);
    return result.count;
  }

  /**
   * Assign recruiters to created goals
   */
  private async assignRecruitersToGoals(
    itemsToCreate: HiringGoalDto[],
  ): Promise<void> {
    for (const goal of itemsToCreate) {
      if (goal.assignedRecruiterIds && goal.assignedRecruiterIds.length > 0) {
        // First get the newly created goal
        const newGoal = await this.hiringGoalRepository.findByDepartmentId(
          goal.departmentId,
        );

        if (newGoal) {
          // Create recruiter assignments
          await this.hiringGoalRepository.assignRecruiters(
            newGoal.id,
            goal.assignedRecruiterIds,
          );
        }
      }
    }
  }

  /**
   * Get hiring metrics by department for performance analytics
   */
  private async getHiringMetricsByDepartment(): Promise<DepartmentMetrics[]> {
    const departments =
      (await this.departmentRepository.findAll()) as DepartmentWithIncludes[];
    const metrics: DepartmentMetrics[] = [];

    for (const dept of departments) {
      // Calculate efficiency (ratio of hires to total applications)
      const applications = dept.jobs.flatMap((job) => job.applications);
      const totalApplications = applications.length;
      const totalHires = applications.filter(
        (app) => app.status === 'HIRED',
      ).length;
      const efficiency =
        totalApplications > 0 ? (totalHires / totalApplications) * 100 : 0;

      // Calculate time to hire in days
      const hiresTotalDays = applications
        .filter((app) => app.status === 'HIRED')
        .map((app) => {
          const createdAt = new Date(app.createdAt);
          const hiredAt = new Date(app.updatedAt);
          return Math.round(
            (hiredAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
          );
        });

      const avgTimeToHire =
        hiresTotalDays.length > 0
          ? hiresTotalDays.reduce((sum, days) => sum + days, 0) /
            hiresTotalDays.length
          : null;

      // Estimate cost per hire
      const avgJobCost = 1000; // This would ideally come from company settings
      const costPerHire =
        totalHires > 0 ? (dept.jobs.length * avgJobCost) / totalHires : null;

      // Quality score (placeholder)
      const qualityScore = Math.round(Math.random() * 20 + 80); // 80-100 random score

      metrics.push({
        departmentId: dept.id,
        departmentName: dept.name,
        timeToHire: avgTimeToHire,
        efficiency,
        costPerHire,
        qualityScore,
        totalApplications,
        totalHires,
      });
    }

    return metrics;
  }

  /**
   * Fetch department-specific growth plans for the upcoming period
   * This is used by the archive process to determine new hiring targets
   */
  async getDepartmentGrowthPlans(): Promise<any[]> {
    // This would typically query a departmentGrowthPlans table
    // For now, we'll extract any data we can find from company settings
    try {
      const companySettings =
        await this.hiringGoalRepository.getCompanySettings();

      // Check if we should try to find growth plans in settings
      if (!companySettings?.description) {
        return [];
      }

      // See if we can parse the description as JSON with department growth plans
      try {
        const settingsData = JSON.parse(companySettings.description);

        // Look for departmentGrowthPlans array in the settings
        if (Array.isArray(settingsData.departmentGrowthPlans)) {
          return settingsData.departmentGrowthPlans;
        }
      } catch (e) {
        // Not valid JSON, try a different approach or return empty
        this.logger.log('Could not parse company settings description as JSON');
      }
    } catch (error) {
      this.logger.error(
        'Error retrieving department growth plans',
        error.message,
      );
    }

    // If no growth plans found, return empty array
    return [];
  }
}
