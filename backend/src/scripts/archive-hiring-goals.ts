import { PrismaClient } from '@prisma/client';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { HRService } from '../modules/hr/hr.service';
import { Logger } from '@nestjs/common';

/**
 * This script manages the lifecycle of hiring goals:
 * 1. Archives expired hiring goals
 * 2. Fetches department growth plans
 * 3. Creates new hiring goals based on department needs and growth plans
 */

// Constants
const CONFIG = {
  DEFAULT_GROWTH_RATE: 0.1, // 10% growth by default
  MIN_HEADCOUNT_INCREASE: 1, // At least 1 new position per department
  HIGH_PRIORITY_THRESHOLD: 0.15, // 15% growth rate indicates high priority
  RECRUITING_COST_PER_POSITION: 5000, // Budget calculation base amount
};

// Create a logger for better output formatting
const logger = new Logger('HiringGoalsManager');

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Types for better code structure
 */
interface GoalDateRange {
  startDate: Date;
  endDate: Date;
}

interface DepartmentGrowthPlanData {
  departmentId: number;
  targetHeadcount: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface DepartmentEfficiencyData {
  [departmentId: number]: number;
}

interface NewGoalData {
  departmentId: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  priority: string;
  status: string;
  notes: string;
  budget: number;
}

/**
 * Helper function to get the date range for new goals
 * Allows for quarterly or annual goals
 */
function getGoalDateRange(
  goalPeriod: 'quarterly' | 'annual' = 'annual',
): GoalDateRange {
  const today = new Date();
  const startDate = new Date(today);
  let endDate: Date;

  if (goalPeriod === 'quarterly') {
    // Set end date to end of current quarter
    const currentMonth = today.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);
    endDate = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
  } else {
    // Set end date to December 31st of the current year
    endDate = new Date(today.getFullYear(), 11, 31);
  }

  return { startDate, endDate };
}

/**
 * Fetch department-specific growth plans
 */
async function fetchDepartmentGrowthPlans(): Promise<
  DepartmentGrowthPlanData[]
> {
  try {
    logger.log('Fetching department growth plans...');

    try {
      // Use $queryRaw instead of direct model access since TypeScript doesn't recognize the new model yet
      const growthPlans = await prisma.$queryRaw`
        SELECT dgp.*, d.name as department_name 
        FROM "DepartmentGrowthPlan" dgp
        JOIN "Department" d ON dgp."departmentId" = d.id
      `;

      if (Array.isArray(growthPlans) && growthPlans.length > 0) {
        logger.log(`Found ${growthPlans.length} department growth plans`);
        return growthPlans.map((plan) => ({
          departmentId: plan.departmentId,
          targetHeadcount: plan.targetHeadcount,
          startDate: plan.startDate,
          endDate: plan.endDate,
          notes: plan.notes,
          priority: plan.priority,
        }));
      }
    } catch (err) {
      // Model might not exist yet, continue with fallback
      logger.warn('Could not query DepartmentGrowthPlan directly');
    }

    // Fallback to company settings if no dedicated growth plans exist
    const companySettings = await prisma.companySettings.findFirst();

    if (companySettings?.description) {
      try {
        // Try to parse the description as JSON to see if it contains growth plans
        const settingsData = JSON.parse(companySettings.description);
        if (Array.isArray(settingsData?.departmentGrowthPlans)) {
          logger.log(
            `Found ${settingsData.departmentGrowthPlans.length} department growth plans in company settings`,
          );

          // Create actual growth plan records for future use
          await migrateGrowthPlansFromSettings(
            settingsData.departmentGrowthPlans,
          );

          return settingsData.departmentGrowthPlans;
        }
      } catch (e) {
        logger.warn('Could not parse company settings description as JSON');
      }
    }

    logger.log('No department growth plans found');
    return [];
  } catch (error) {
    logger.error(
      `Error fetching department growth plans: ${error.message}`,
      error.stack,
    );
    return [];
  }
}

/**
 * Migrate growth plans from settings to dedicated table
 */
async function migrateGrowthPlansFromSettings(
  plans: DepartmentGrowthPlanData[],
): Promise<void> {
  try {
    logger.log('Migrating growth plans from settings to dedicated table...');

    // Validate departments exist before creating growth plans
    const departmentIds = plans.map((plan) => plan.departmentId);
    const existingDepartments = await prisma.department.findMany({
      where: {
        id: {
          in: departmentIds,
        },
      },
      select: {
        id: true,
      },
    });

    const validDepartmentIds = existingDepartments.map((dept) => dept.id);
    const validPlans = plans.filter((plan) =>
      validDepartmentIds.includes(plan.departmentId),
    );

    // Only create if not already exist
    for (const plan of validPlans) {
      try {
        // Use $queryRaw to check if plan exists
        const existingPlans = await prisma.$queryRaw`
          SELECT * FROM "DepartmentGrowthPlan" 
          WHERE "departmentId" = ${plan.departmentId}
        `;

        if (
          !existingPlans ||
          (Array.isArray(existingPlans) && existingPlans.length === 0)
        ) {
          const { startDate, endDate } = getGoalDateRange();

          // Use $executeRaw to insert record
          await prisma.$executeRaw`
            INSERT INTO "DepartmentGrowthPlan" 
            ("departmentId", "targetHeadcount", "startDate", "endDate", "notes", "priority", "createdAt", "updatedAt")
            VALUES (
              ${plan.departmentId}, 
              ${plan.targetHeadcount}, 
              ${plan.startDate || startDate}, 
              ${plan.endDate || endDate}, 
              ${plan.notes || ''}, 
              ${plan.priority || 'medium'},
              NOW(),
              NOW()
            )
          `;
        }
      } catch (e) {
        logger.warn(
          `Could not create growth plan for department ${plan.departmentId}: ${e.message}`,
        );
      }
    }

    logger.log(
      `Attempted to migrate ${validPlans.length} growth plans to dedicated table`,
    );
  } catch (error) {
    logger.error(`Error migrating growth plans: ${error.message}`, error.stack);
  }
}

/**
 * Archive expired hiring goals
 */
async function archiveHiringGoals(): Promise<{
  archived: number;
  message: string;
}> {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const hrService = app.get(HRService);

    logger.log('Archiving expired hiring goals...');
    const result = await hrService.archiveExpiredHiringGoals();
    logger.log(`Archived ${result.count} expired hiring goals`);

    // Log the activity in the new ActivityLog table
    if (result.count > 0) {
      await createActivityLog({
        action: 'ARCHIVE_HIRING_GOALS',
        details: `Archived ${result.count} expired hiring goals`,
        entityType: 'HIRING_GOAL',
        entityIds: 'batch_operation',
      });
    }

    await app.close();
    return {
      archived: result.count,
      message:
        result.message || `Archived ${result.count} expired hiring goals`,
    };
  } catch (error) {
    logger.error(`Error archiving hiring goals: ${error.message}`, error.stack);
    return { archived: 0, message: 'Error occurred during archiving' };
  }
}

/**
 * Create a new activity log entry
 */
async function createActivityLog({
  action,
  details,
  entityType,
  entityIds,
  userId = null,
}: {
  action: string;
  details: string;
  entityType: string;
  entityIds: string;
  userId?: number | null;
}): Promise<void> {
  try {
    // Use $executeRaw since TypeScript doesn't recognize the ActivityLog model yet
    await prisma.$executeRaw`
      INSERT INTO "ActivityLog" ("action", "details", "entityType", "entityIds", "userId", "timestamp")
      VALUES (${action}, ${details}, ${entityType}, ${entityIds}, ${userId}, NOW())
    `;
  } catch (error) {
    logger.error(`Error creating activity log: ${error.message}`, error.stack);
  }
}

/**
 * Create new hiring goals based on company objectives and department needs
 */
async function createNewAnnualGoals(
  departmentGrowthPlans: DepartmentGrowthPlanData[] = [],
  goalPeriod: 'quarterly' | 'annual' = 'annual',
): Promise<void> {
  try {
    logger.log('Creating new hiring goals...');

    // Get all departments with relevant data
    const departments = await prisma.department.findMany({
      include: {
        employees: true,
        hiringGoals: true,
        jobs: {
          where: {
            status: 'OPEN',
          },
        },
      },
    });

    // Get company settings to extract growth rate and other parameters
    const companySettings = await prisma.companySettings.findFirst();

    // Use the growthRate field directly, or fallback to the default if not set
    const companyGrowthRate =
      companySettings?.growthRate || CONFIG.DEFAULT_GROWTH_RATE;

    // Get strategic priorities from the settings
    let strategicPriorities: number[] = [];
    if (companySettings) {
      try {
        // Try to get from the new field first
        if (companySettings['strategicPriorities']) {
          strategicPriorities = JSON.parse(
            companySettings['strategicPriorities'] as string,
          );
        }
        // Fallback to description field
        else if (companySettings.description) {
          const settingsData = JSON.parse(companySettings.description);
          if (Array.isArray(settingsData?.strategicPriorities)) {
            strategicPriorities = settingsData.strategicPriorities;
          }
        }
      } catch (e) {
        logger.warn('Could not parse strategic priorities as JSON');
      }
    }

    logger.log(
      `Using company growth rate of ${companyGrowthRate} from settings`,
    );

    // Only create goals for departments without current goals
    const departmentsWithoutGoals = departments.filter(
      (dept) => dept.hiringGoals.length === 0,
    );

    if (departmentsWithoutGoals.length === 0) {
      logger.log(
        'All departments have current goals. Skipping creation of new goals.',
      );
      return;
    }

    logger.log(
      `Creating new goals for ${departmentsWithoutGoals.length} departments`,
    );

    const { startDate, endDate } = getGoalDateRange(goalPeriod);

    // Get historical hiring data for better goal setting
    const applicationData = await prisma.application.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
      include: {
        job: {
          include: {
            department: true,
          },
        },
      },
    });

    // Calculate historical hiring efficiency by department
    const departmentEfficiency: DepartmentEfficiencyData = {};
    departments.forEach((dept) => {
      const deptApplications = applicationData.filter(
        (app) => app.job.department && app.job.department.id === dept.id,
      );

      const totalApps = deptApplications.length;
      const hiredApps = deptApplications.filter(
        (app) => app.status === 'HIRED',
      ).length;

      departmentEfficiency[dept.id] =
        totalApps > 0 ? hiredApps / totalApps : companyGrowthRate; // Default to company growth rate if no data
    });

    // Bulk create new goals
    const newGoals: NewGoalData[] = departmentsWithoutGoals.map((dept) => {
      // Look for department-specific growth plan
      const growthPlan = Array.isArray(departmentGrowthPlans)
        ? departmentGrowthPlans.find((plan) => plan.departmentId === dept.id)
        : null;

      let targetHeadcount: number;
      let priority = 'medium';
      let notes = '';

      // Check if this department is in strategic priorities
      const isStrategic =
        Array.isArray(strategicPriorities) &&
        strategicPriorities.includes(dept.id);

      if (isStrategic) {
        priority = 'high';
        notes = 'Strategic priority department for company growth';
      }

      if (growthPlan && growthPlan.targetHeadcount) {
        // Use the planned target if available
        targetHeadcount = growthPlan.targetHeadcount;
        notes = growthPlan.notes || notes;
        priority = growthPlan.priority || priority;

        logger.log(
          `Using planned target of ${targetHeadcount} for ${dept.name} from growth plan`,
        );
      } else {
        // Calculate a growth target based on multiple factors

        // Start with base company growth rate
        let departmentGrowthRate = companyGrowthRate;

        // Adjust growth rate based on historical hiring efficiency
        if (departmentEfficiency[dept.id]) {
          // Lower targets for departments that struggle to hire
          const efficiencyFactor =
            departmentEfficiency[dept.id] < 0.1 ? 0.8 : 1.0;
          departmentGrowthRate *= efficiencyFactor;
        }

        // Strategic departments get higher growth targets
        if (isStrategic) {
          departmentGrowthRate *= 1.5;
        }

        // Calculate target with min headcount increase
        const growthTarget = Math.max(
          CONFIG.MIN_HEADCOUNT_INCREASE,
          Math.ceil(dept.employees.length * departmentGrowthRate),
        );

        targetHeadcount = dept.employees.length + growthTarget;

        // Set priority based on growth rate
        if (departmentGrowthRate >= CONFIG.HIGH_PRIORITY_THRESHOLD) {
          priority = 'high';
        }

        logger.log(
          `Calculated target of ${targetHeadcount} for ${dept.name} using growth rate ${departmentGrowthRate}`,
        );
      }

      // Consider existing open jobs in the goal
      const openJobs = dept.jobs.length;
      const openJobsNote =
        openJobs > 0
          ? `Department already has ${openJobs} open positions.`
          : '';

      if (openJobsNote) {
        notes = notes ? `${notes} ${openJobsNote}` : openJobsNote;
      }

      return {
        departmentId: dept.id,
        targetHeadcount,
        startDate,
        endDate,
        priority,
        status: openJobs > 0 ? 'in_progress' : 'not_started',
        notes,
        budget: calculateDepartmentBudget(dept, targetHeadcount),
      };
    });

    if (newGoals.length > 0) {
      // Create the hiring goals
      const createdGoals = await prisma.hiringGoal.createMany({
        data: newGoals,
      });

      // Create activity log entries using the new ActivityLog model
      for (const goal of newGoals) {
        await createActivityLog({
          action: 'CREATE_HIRING_GOAL',
          details: `Created new ${goalPeriod} hiring goal for department ${goal.departmentId}`,
          entityType: 'HIRING_GOAL',
          entityIds: goal.departmentId.toString(),
          userId: 1, // System user
        });
      }

      logger.log(`Successfully created ${newGoals.length} new hiring goals`);
    } else {
      logger.log('No new goals to create');
    }
  } catch (error) {
    logger.error(
      `Error creating new annual goals: ${error.message}`,
      error.stack,
    );
  }
}

/**
 * Helper function to calculate a hiring budget for a department based on target
 */
function calculateDepartmentBudget(
  department: any,
  targetHeadcount: number,
): number {
  // This logic could be made much more sophisticated based on:
  // - average salaries in department
  // - recruiting costs
  // - onboarding costs
  // - etc.

  const currentHeadcount = department.employees.length;
  const newPositions = Math.max(0, targetHeadcount - currentHeadcount);

  // Simple budget calculation: $5000 per new position for recruiting costs
  return newPositions * CONFIG.RECRUITING_COST_PER_POSITION;
}

/**
 * Main function to run the script
 */
async function run(): Promise<void> {
  try {
    logger.log('Starting hiring goals management process...');

    // Archive expired goals first
    const archiveResult = await archiveHiringGoals();

    // Get department growth plans
    const growthPlans = await fetchDepartmentGrowthPlans();

    // Create new goals
    await createNewAnnualGoals(growthPlans);

    logger.log('Hiring goals management completed successfully');

    // Close Prisma connection
    await prisma.$disconnect();
  } catch (error) {
    logger.error(
      `Error in hiring goals management: ${error.message}`,
      error.stack,
    );

    // Ensure Prisma connection is closed even on error
    await prisma.$disconnect();
    process.exit(1);
  }
}

// If called directly (e.g., as a cron job)
if (require.main === module) {
  run()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Unhandled error: ${error.message}`, error.stack);
      process.exit(1);
    });
}

export { run, archiveHiringGoals };
