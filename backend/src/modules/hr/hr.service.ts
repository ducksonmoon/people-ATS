import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import {
  Job,
  Application,
  Department,
  User,
  HiringGoal,
  JobCategory,
  JobLocation,
  ApplicationRecruiter,
  Prisma,
  Role,
} from '@prisma/client';

// Extended type for User to include properties used in the service
interface UserWithDetails extends User {
  name: string;
  hireDate?: Date;
  endDate?: Date;
  departmentId?: number;
  status?: string;
  firstName?: string;
  lastName?: string;
}

// Extend the Job type to include its relationships
type JobWithRelations = Job & {
  applications: Application[];
  department: Department;
  category: JobCategory;
  location: JobLocation;
};

// Extend the Application type to include its relationships
type ApplicationWithRelations = Application & {
  job: Job & { department: Department };
  candidate: UserWithDetails;
  recruiters: { recruiter: UserWithDetails }[];
};

// Extend the Department type to include its relationships
type DepartmentWithRelations = Department & {
  employees: UserWithDetails[];
  jobs: (Job & { applications: Application[] })[];
};

// Extend the HiringGoal type to include assigned recruiters
type HiringGoalWithRelations = HiringGoal & {
  department: Department;
  assignedRecruiters?: {
    recruiterId: number;
    recruiter: UserWithDetails;
  }[];
};

// NOTE: This service is deprecated and is being replaced by specialized services
// in the services/ directory. Please use the specialized services directly.
// This service is kept for backward compatibility but will be removed in future versions.

@Injectable()
export class HRService {
  constructor(private prisma: PrismaService) {}

  async createJobRequisition(data: any, userId: number) {
    // Extract relation fields
    const { categoryId, locationId, departmentId, ...rest } = data;

    return this.prisma.job.create({
      data: {
        ...rest,
        postedBy: { connect: { id: userId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        location: locationId ? { connect: { id: locationId } } : undefined,
        department: departmentId
          ? { connect: { id: departmentId } }
          : undefined,
      },
      include: {
        category: true,
        location: true,
        department: true,
      },
    });
  }

  async updateJobRequisition(id: number, data: any, userId: number) {
    return this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        location: true,
        department: true,
      },
    });
  }

  async deleteJobRequisition(id: number) {
    // First check if the job exists
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { applications: true },
    });

    if (!job) {
      throw new Error(`Job with ID ${id} not found`);
    }

    // Delete related records first if any exist
    if (job.applications.length > 0) {
      // Delete all applications associated with this job
      await this.prisma.application.deleteMany({
        where: { jobId: id },
      });
    }

    // Now delete the job
    return this.prisma.job.delete({
      where: { id },
    });
  }

  async getJobRequisition(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        department: true,
        applications: true,
      },
    });
  }

  /**
   * Get consolidated dashboard data for HR
   * @param skipCache Whether to skip cache and fetch fresh data
   * @returns All HR dashboard components combined
   */
  async getHRDashboardData(skipCache = false) {
    // Fetch all required data separately to avoid type issues
    const jobs = await this.prisma.job.findMany({
      include: {
        category: true,
        location: true,
        applications: true,
        department: true,
      },
    });

    const applications = await this.prisma.application.findMany({
      include: {
        job: {
          include: {
            department: true,
          },
        },
        candidate: true,
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const departments = await this.prisma.department.findMany({
      include: {
        employees: true,
        jobs: {
          include: {
            applications: true,
          },
        },
      },
    });

    const employees = await this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
      },
      include: {
        department: true,
      },
    });

    const hiringGoals = await this.prisma.hiringGoal.findMany({
      include: {
        department: true,
      },
    });

    return {
      hiringTrendsData: this.calculateHiringTrends(applications),
      recruitmentFunnelData: this.calculateRecruitmentFunnel(applications),
      departmentHiringData: this.calculateDepartmentHiring(
        departments,
        hiringGoals,
      ),
      activeCandidates: this.getActiveCandidates(applications),
      jobRequisitions: this.getJobRequisitions(jobs),
      departmentMetrics: this.calculateDepartmentMetrics(
        departments,
        employees,
      ),
      timeToHireMetrics: this.calculateTimeToHireMetrics(applications),
    };
  }

  async getDepartmentMetrics() {
    const [departments, employees] = await Promise.all([
      this.prisma.department.findMany({
        include: {
          employees: true,
          jobs: {
            include: {
              applications: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        include: { department: true },
      }),
    ]);

    return this.calculateDepartmentMetrics(departments, employees);
  }

  async getHiringGoals() {
    const goals = await this.prisma.hiringGoal.findMany({
      include: {
        department: true,
        assignedRecruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
    // Enhanced goals with additional context
    const enhancedGoals = await Promise.all(
      goals.map(async (goal) => {
        // Get open positions for this department
        const openPositions = await this.prisma.job.count({
          where: {
            departmentId: goal.departmentId,
            status: 'OPEN',
          },
        });

        // Get active candidates count
        const activeCandidates = await this.prisma.user.count({
          where: {
            departmentId: goal.departmentId,
            role: 'CANDIDATE',
          },
        });

        // Get interviews scheduled count
        const interviewsScheduled = await this.prisma.interview.count({
          where: {
            application: {
              job: {
                departmentId: goal.departmentId,
              },
            },
            status: 'SCHEDULED',
          },
        });

        // Get offers extended count
        const offersExtended = await this.prisma.application.count({
          where: {
            job: {
              departmentId: goal.departmentId,
            },
            status: 'OFFER_EXTENDED',
          },
        });

        const currentDate = new Date();

        // Calculate time progress percentage
        const totalDuration = goal.endDate.getTime() - goal.startDate.getTime();
        const elapsedDuration =
          currentDate.getTime() - goal.startDate.getTime();
        const timeProgressPercentage =
          Math.min(Math.max(elapsedDuration / totalDuration, 0), 1) * 100;

        // Get current headcount
        const currentHeadcount = await this.prisma.user.count({
          where: {
            departmentId: goal.departmentId,
            role: 'EMPLOYEE',
          },
        });

        // Calculate hiring progress percentage
        const hiringGoal = goal.targetHeadcount - currentHeadcount;
        const hiringProgress =
          hiringGoal <= 0
            ? 100
            : ((openPositions + offersExtended) / hiringGoal) * 100;

        // Determine status based on progress
        let status = goal.status || 'in_progress';
        if (currentHeadcount >= goal.targetHeadcount) {
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

        // Format assigned recruiters
        const assignedRecruiters = goal.assignedRecruiters
          ? goal.assignedRecruiters.map((ar) => ({
              id: ar.recruiterId,
              name: ar.recruiter.name,
            }))
          : [];

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

        return {
          ...goal,
          progressMetrics: {
            currentHeadcount,
            openPositions,
            activeCandidates,
            interviewsScheduled,
            offersExtended,
          },
          status,
          healthScore,
          assignedRecruiters,
        };
      }),
    );

    return enhancedGoals;
  }

  async updateHiringGoals(
    data: {
      departmentId: number;
      targetHeadcount: number;
      startDate: Date;
      endDate: Date;
      priority?: 'high' | 'medium' | 'low';
      status?:
        | 'not_started'
        | 'in_progress'
        | 'on_track'
        | 'at_risk'
        | 'completed'
        | 'cancelled';
      notes?: string;
      budget?: number;
      assignedRecruiterIds?: number[];
      changeState?: string;
      deleted?: boolean;
    }[],
    userId: number,
  ) {
    // Check if the entire request is missing departmentIds
    if (
      data.length > 0 &&
      data.every((goal) => goal.departmentId === undefined)
    ) {
      throw new Error(
        'Missing required field: departmentId must be provided for all hiring goals',
      );
    }

    // Filter out any items with undefined departmentIds
    const validData = data.filter((goal) => goal.departmentId !== undefined);

    // Process items marked for deletion vs. items to create/update
    const itemsToDelete = validData.filter((goal) => goal.deleted === true);
    const itemsToCreate = validData.filter((goal) => !goal.deleted);

    // Track results for both operations
    let deleteResult = { count: 0 };
    let createResult = { count: 0 };

    // Get the departmentIds for deletion
    const departmentsToDelete = itemsToDelete.map((goal) => goal.departmentId);

    // Get the departmentIds for update/create
    const departmentsToUpdate = itemsToCreate.map((goal) => goal.departmentId);

    if (departmentsToDelete.length > 0) {
      console.log(
        `Deleting goals for departments: ${departmentsToDelete.join(', ')}`,
      );

      // Delete goals for departments marked for deletion
      deleteResult = await this.prisma.hiringGoal.deleteMany({
        where: {
          departmentId: { in: departmentsToDelete },
        },
      });

      // Add log entry for deletion
      await this.prisma.activityLog.create({
        data: {
          action: 'DELETE_HIRING_GOALS',
          userId,
          details: `Deleted hiring goals for ${departmentsToDelete.length} departments`,
          entityType: 'HIRING_GOAL',
          entityIds: departmentsToDelete.join(','),
        },
      });

      console.log(`Deleted ${deleteResult.count} hiring goals`);
    }

    if (departmentsToUpdate.length > 0) {
      console.log(
        `Updating goals for departments: ${departmentsToUpdate.join(', ')}`,
      );

      // Delete existing goals for these departments
      await this.prisma.hiringGoal.deleteMany({
        where: {
          departmentId: { in: departmentsToUpdate },
        },
      });

      // Create new goals with enhanced fields
      const goalsToCreate = itemsToCreate.map((goal) => ({
        departmentId: goal.departmentId,
        targetHeadcount: goal.targetHeadcount,
        startDate: goal.startDate,
        endDate: goal.endDate,
        priority: goal.priority || 'medium',
        status: goal.status || 'not_started',
        notes: goal.notes,
        budget: goal.budget,
      }));

      createResult = await this.prisma.hiringGoal.createMany({
        data: goalsToCreate,
      });

      // Create recruiter assignments if provided
      for (const goal of itemsToCreate) {
        if (goal.assignedRecruiterIds && goal.assignedRecruiterIds.length > 0) {
          // First get the newly created goal
          const newGoal = await this.prisma.hiringGoal.findFirst({
            where: { departmentId: goal.departmentId },
          });

          if (newGoal) {
            // Create recruiter assignments
            await this.prisma.hiringGoalRecruiter.createMany({
              data: goal.assignedRecruiterIds.map((recruiterId) => ({
                hiringGoalId: newGoal.id,
                recruiterId,
              })),
            });
          }
        }
      }

      // Log the activity
      await this.prisma.activityLog.create({
        data: {
          action: 'UPDATE_HIRING_GOALS',
          userId,
          details: `Updated hiring goals for ${departmentsToUpdate.length} departments`,
          entityType: 'HIRING_GOAL',
          entityIds: departmentsToUpdate.join(','),
        },
      });

      console.log(`Created ${createResult.count} hiring goals`);
    }

    return {
      count: createResult.count,
      deleted: deleteResult.count,
    };
  }

  async getHistoricalHiringGoals() {
    // Get current active hiring goals
    const currentGoals = await this.prisma.hiringGoal.findMany({
      include: {
        department: true,
      },
    });

    // Get completed/historical goals from the CompletedHiringGoal table
    const completedGoals = await this.prisma.completedHiringGoal.findMany({
      include: {
        department: true,
      },
    });

    // Get current employee counts for departments
    const departments = await this.prisma.department.findMany({
      include: {
        employees: true,
      },
    });

    // Get hiring metrics by department
    const hiringMetrics = await this.getHiringMetricsByDepartment();

    const currentYear = new Date().getFullYear();

    // Prepare results array
    const historicalGoals = [];

    // Add current in-progress goals
    for (const goal of currentGoals) {
      const dept = departments.find((d) => d.id === goal.departmentId);
      if (dept) {
        // Get department metrics
        const deptMetrics =
          hiringMetrics.find((m) => m.departmentId === goal.departmentId) || {};

        historicalGoals.push({
          id: goal.id,
          departmentId: goal.departmentId,
          departmentName: goal.department.name,
          targetHeadcount: goal.targetHeadcount,
          actualHeadcount: dept.employees.length,
          startDate: goal.startDate,
          endDate: goal.endDate,
          achieved: dept.employees.length >= goal.targetHeadcount,
          status:
            goal.status ||
            (dept.employees.length >= goal.targetHeadcount
              ? 'completed'
              : 'in_progress'),
          notes:
            goal.notes ||
            (dept.employees.length >= goal.targetHeadcount
              ? 'Target achieved'
              : 'Working towards target'),
          year: currentYear.toString(),
          completionRate: (dept.employees.length / goal.targetHeadcount) * 100,
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
   * Get hiring metrics by department for performance analytics
   */
  async getHiringMetricsByDepartment() {
    const departments = await this.prisma.department.findMany();
    const metrics = [];

    for (const dept of departments) {
      // Get applications for this department
      const applications = await this.prisma.application.findMany({
        where: {
          job: {
            departmentId: dept.id,
          },
        },
        include: {
          job: true,
          interviews: true,
        },
      });

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

      // Calculate efficiency (ratio of hires to total applications)
      const totalApplications = applications.length;
      const totalHires = applications.filter(
        (app) => app.status === 'HIRED',
      ).length;
      const efficiency =
        totalApplications > 0 ? (totalHires / totalApplications) * 100 : 0;

      // Estimate cost per hire based on company settings and job postings
      const jobs = await this.prisma.job.findMany({
        where: {
          departmentId: dept.id,
        },
      });

      const avgJobCost = 1000; // This would ideally come from company settings
      const costPerHire =
        totalHires > 0 ? (jobs.length * avgJobCost) / totalHires : null;

      // Quality score (placeholder - would be based on performance reviews)
      const qualityScore = Math.round(Math.random() * 20 + 80); // 80-100 random score as placeholder

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

  async getHiringStatistics() {
    const [departments, hiringGoals, applications, employees] =
      await Promise.all([
        this.prisma.department.findMany(),
        this.prisma.hiringGoal.findMany({
          include: { department: true },
        }),
        this.prisma.application.findMany({
          include: {
            job: {
              include: { department: true },
            },
            interviews: true,
          },
          where: {
            createdAt: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Last 6 months
            },
          },
        }),
        this.prisma.user.findMany({
          where: {
            role: 'EMPLOYEE',
            hireDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Last 6 months
            },
          },
          include: { department: true },
        }),
      ]);

    // Calculate monthly hiring stats by department
    const monthlyStats = {};
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));

    // Initialize monthlyStats with all departments and months
    departments.forEach((dept) => {
      monthlyStats[dept.id] = {
        name: dept.name,
        months: {},
      };

      // Create entries for each month
      for (let i = 0; i <= 6; i++) {
        const monthDate = new Date(sixMonthsAgo);
        monthDate.setMonth(sixMonthsAgo.getMonth() + i);
        const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;

        monthlyStats[dept.id].months[monthKey] = {
          applications: 0,
          interviews: 0,
          offers: 0,
          hires: 0,
        };
      }
    });

    // Process applications
    applications.forEach((app) => {
      if (app.job.departmentId) {
        const deptId = app.job.departmentId;
        const appDate = new Date(app.createdAt);
        const monthKey = `${appDate.getFullYear()}-${appDate.getMonth() + 1}`;

        if (monthlyStats[deptId]?.months[monthKey]) {
          // Count applications
          monthlyStats[deptId].months[monthKey].applications++;

          // Count interviews
          if (app.interviews.length > 0) {
            monthlyStats[deptId].months[monthKey].interviews++;
          }

          // Count offers
          if (app.status === 'OFFER_SENT' || app.status === 'OFFER_ACCEPTED') {
            monthlyStats[deptId].months[monthKey].offers++;
          }
        }
      }
    });

    // Process hires
    employees.forEach((emp) => {
      if (emp.departmentId) {
        const hireDate = new Date(emp.hireDate);
        const monthKey = `${hireDate.getFullYear()}-${hireDate.getMonth() + 1}`;

        if (monthlyStats[emp.departmentId]?.months[monthKey]) {
          monthlyStats[emp.departmentId].months[monthKey].hires++;
        }
      }
    });

    // Process hiring goals to provide context
    const departmentGoals = {};
    hiringGoals.forEach((goal) => {
      departmentGoals[goal.departmentId] = {
        targetHeadcount: goal.targetHeadcount,
        startDate: goal.startDate,
        endDate: goal.endDate,
      };
    });

    // Define the structure of dept objects for type safety
    interface DeptStats {
      name: string;
      months: {
        [key: string]: {
          applications: number;
          interviews: number;
          offers: number;
          hires: number;
        };
      };
    }

    // Format the results for the frontend
    const results = Object.values(
      monthlyStats as Record<string, DeptStats>,
    ).map((dept) => {
      const monthsArray = Object.entries(dept.months).map(
        ([monthKey, stats]) => {
          const [year, month] = monthKey.split('-').map(Number);
          return {
            month: monthKey,
            label: new Date(year, month - 1).toLocaleString('default', {
              month: 'short',
              year: '2-digit',
            }),
            ...stats,
          };
        },
      );

      return {
        departmentId: departments.find((d) => d.name === dept.name).id,
        departmentName: dept.name,
        monthlyData: monthsArray.sort((a, b) => {
          const [aYear, aMonth] = a.month.split('-').map(Number);
          const [bYear, bMonth] = b.month.split('-').map(Number);
          return (
            new Date(aYear, aMonth - 1).getTime() -
            new Date(bYear, bMonth - 1).getTime()
          );
        }),
        goal:
          departmentGoals[departments.find((d) => d.name === dept.name).id] ||
          null,
      };
    });

    return results;
  }

  // New Application Management Methods
  async getAllApplications() {
    return this.prisma.application.findMany({
      include: {
        job: {
          include: {
            department: true,
          },
        },
        candidate: true,
        interviews: {
          include: {
            interviewer: true,
          },
        },
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getApplicationById(id: number) {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            department: true,
            category: true,
            location: true,
          },
        },
        candidate: true,
        interviews: {
          include: {
            interviewer: true,
          },
          orderBy: { scheduledAt: 'asc' },
        },
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
  }

  async updateApplicationStatus(id: number, status: string) {
    return this.prisma.application.update({
      where: { id },
      data: {
        status: status,
        updatedAt: new Date(),
      },
      include: {
        job: true,
        candidate: true,
      },
    });
  }

  async addApplicationComment(id: number, comment: string, userId: number) {
    // Since there's no comment model in the schema, we'll add it to the note field
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const currentNotes = application.note || '';
    const timestamp = new Date().toISOString();
    const newComment = `[${timestamp}] ${user.name}: ${comment}\n\n`;

    return this.prisma.application.update({
      where: { id },
      data: {
        note: newComment + currentNotes,
        updatedAt: new Date(),
      },
    });
  }

  async scheduleInterview(id: number, data: any, userId: number) {
    const { scheduledAt, duration, type, location, meetingLink, notes } = data;

    // Get the application to update its status
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        candidate: true,
      },
    });

    if (!application) {
      throw new Error(`Application with ID ${id} not found`);
    }

    // Create a transaction to update both the interview and application status
    const [interview, updatedApplication] = await this.prisma.$transaction([
      // Create the interview
      this.prisma.interview.create({
        data: {
          scheduledAt: new Date(scheduledAt),
          duration: duration || 60,
          type: type || 'INITIAL',
          status: 'SCHEDULED',
          feedback: notes || null,
          location: location || null,
          meetingLink: meetingLink || null,
          application: {
            connect: { id: id },
          },
          interviewer: {
            connect: { id: userId },
          },
        },
        include: {
          application: {
            include: {
              job: true,
              candidate: true,
            },
          },
          interviewer: true,
        },
      }),

      // Update the application status to INTERVIEWING if it's not already
      this.prisma.application.update({
        where: { id },
        data: {
          status:
            application.status === 'PENDING'
              ? 'INTERVIEWING'
              : application.status,
          nextInterviewDate: new Date(scheduledAt),
        },
      }),
    ]);

    // Additional logic for notifications would go here
    // This would be implemented in a notification service

    return interview;
  }

  async getAllInterviews(userId: number, userRole: string) {
    // For admin and HR, return all interviews
    // For recruiters, return only their assigned interviews
    const isAdminOrHR = userRole === 'ADMIN' || userRole === 'HR';

    const interviews = await this.prisma.interview.findMany({
      where: isAdminOrHR ? {} : { interviewerId: userId },
      include: {
        application: {
          include: {
            job: {
              include: {
                department: true,
              },
            },
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        interviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    return interviews;
  }

  async updateInterview(id: number, data: any, userId: number) {
    const { feedback, status, location, meetingLink } = data;

    // Find the interview first to check if user has permission
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!interview) {
      throw new Error(`Interview with ID ${id} not found`);
    }

    // Update the interview
    const updatedInterview = await this.prisma.interview.update({
      where: { id },
      data: {
        feedback: feedback !== undefined ? feedback : interview.feedback,
        status: status || interview.status,
        location: location !== undefined ? location : interview.location,
        meetingLink:
          meetingLink !== undefined ? meetingLink : interview.meetingLink,
        updatedAt: new Date(),
      },
      include: {
        application: {
          include: {
            job: true,
            candidate: true,
          },
        },
        interviewer: true,
      },
    });

    // If the interview is completed, we might want to update the application status
    if (
      status === 'COMPLETED' &&
      interview.application.status === 'INTERVIEWING'
    ) {
      // Check if there are any other scheduled interviews
      const otherInterviews = await this.prisma.interview.findMany({
        where: {
          applicationId: interview.application.id,
          id: { not: id },
          status: 'SCHEDULED',
        },
      });

      // If no other scheduled interviews, update application status to indicate interview phase complete
      if (otherInterviews.length === 0) {
        await this.prisma.application.update({
          where: { id: interview.application.id },
          data: {
            // Optional: change the status based on your workflow
            // status: 'INTERVIEW_COMPLETED',
            nextInterviewDate: null,
          },
        });
      }
    }

    return updatedInterview;
  }

  private calculateHiringTrends(applications: Application[]) {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    const monthlyData = last6Months.map((month) => {
      const monthApplications = applications.filter((app) => {
        const appMonth = new Date(app.createdAt).toLocaleString('default', {
          month: 'short',
        });
        return appMonth === month;
      });

      return {
        name: month,
        applications: monthApplications.length,
        interviews: monthApplications.filter(
          (app) => app.status === 'INTERVIEWING',
        ).length,
        offers: monthApplications.filter((app) => app.status === 'OFFER_SENT')
          .length,
        hires: monthApplications.filter((app) => app.status === 'HIRED').length,
      };
    });

    return monthlyData;
  }

  private calculateRecruitmentFunnel(applications: Application[]) {
    return [
      {
        name: 'Applications',
        value: applications.length,
        color: '#1976d2', // primary
      },
      {
        name: 'Screening',
        value: applications.filter((app) =>
          ['SCREENING', 'INTERVIEWING', 'OFFER_SENT', 'HIRED'].includes(
            app.status,
          ),
        ).length,
        color: '#2196f3', // info
      },
      {
        name: 'Interviews',
        value: applications.filter((app) =>
          ['INTERVIEWING', 'OFFER_SENT', 'HIRED'].includes(app.status),
        ).length,
        color: '#ff9800', // warning
      },
      {
        name: 'Offers',
        value: applications.filter((app) =>
          ['OFFER_SENT', 'HIRED'].includes(app.status),
        ).length,
        color: '#4caf50', // success
      },
      {
        name: 'Hires',
        value: applications.filter((app) => app.status === 'HIRED').length,
        color: '#f44336', // error
      },
    ];
  }

  private calculateDepartmentHiring(
    departments: DepartmentWithRelations[],
    hiringGoals: (HiringGoal & { department: Department })[],
  ) {
    return departments.map((dept) => {
      const departmentGoal = hiringGoals.find(
        (goal) => goal.departmentId === dept.id,
      );
      const currentEmployees = dept.employees.length;
      const targetEmployees =
        departmentGoal?.targetHeadcount || currentEmployees;
      const hired = dept.employees.filter((emp) => {
        const hireDate = new Date(emp.hireDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return hireDate >= threeMonthsAgo;
      }).length;

      return {
        name: dept.name,
        current: currentEmployees,
        target: targetEmployees,
        hired: hired,
      };
    });
  }

  private getActiveCandidates(applications: ApplicationWithRelations[]) {
    return applications
      .filter((app) =>
        ['SCREENING', 'INTERVIEWING', 'OFFER_SENT'].includes(app.status),
      )
      .map((app) => ({
        id: app.id,
        name: app.candidate.name,
        role: app.job.title,
        department: app.job.department?.name || 'Unassigned',
        status: app.status,
        progress: this.calculateApplicationProgress(app.status),
        nextInterview: app.nextInterviewDate,
        recruiters: app.recruiters.map((recruiter) => recruiter.recruiter.name),
      }))
      .slice(0, 5);
  }

  private calculateApplicationProgress(status: string): number {
    const statusProgressMap = {
      PENDING: 20,
      SCREENING: 40,
      INTERVIEWING: 60,
      OFFER_SENT: 80,
      HIRED: 100,
      REJECTED: 100,
    };
    return statusProgressMap[status] || 0;
  }

  private getJobRequisitions(jobs: JobWithRelations[]) {
    return jobs
      .filter((job) => job.status === 'OPEN')
      .map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department?.name || 'No Department',
        openPositions: job.openPositions,
        applicationsCount: job.applications.length,
        status: job.status,
        priority: job.priority,
        createdAt: job.createdAt,
      }))
      .slice(0, 5);
  }

  private calculateDepartmentMetrics(
    departments: DepartmentWithRelations[],
    employees: (User & { department: Department | null })[],
  ) {
    return departments.map((dept) => {
      const departmentEmployees = employees.filter(
        (emp) => emp.departmentId === dept.id,
      );

      return {
        id: dept.id,
        name: dept.name,
        employeeCount: departmentEmployees.length,
        openPositions: dept.jobs.filter((job) => job.status === 'OPEN').length,
        turnoverRate: this.calculateTurnoverRate(departmentEmployees),
        avgTimeToHire: this.calculateAvgTimeToHire(dept.jobs),
      };
    });
  }

  private calculateTurnoverRate(
    employees: (User & { department: Department | null })[],
  ): number {
    const totalEmployees = employees.length;
    if (totalEmployees === 0) return 0;

    const leftEmployees = employees.filter(
      (emp) => emp.endDate !== null,
    ).length;
    return (leftEmployees / totalEmployees) * 100;
  }

  private calculateAvgTimeToHire(
    jobs: (Job & { applications: Application[] })[],
  ): number {
    const completedJobs = jobs.filter((job) =>
      job.applications.some((app) => app.status === 'HIRED'),
    );

    if (completedJobs.length === 0) return 0;

    const totalDays = completedJobs.reduce((sum, job) => {
      const hiredApp = job.applications.find((app) => app.status === 'HIRED');
      const timeToHire = hiredApp
        ? Math.floor(
            (new Date(hiredApp.updatedAt).getTime() -
              new Date(job.createdAt).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;
      return sum + timeToHire;
    }, 0);

    return Math.round(totalDays / completedJobs.length);
  }

  private calculateTimeToHireMetrics(applications: ApplicationWithRelations[]) {
    const hiredApplications = applications.filter(
      (app) => app.status === 'HIRED',
    );

    if (hiredApplications.length === 0) {
      return {
        avgDaysToHire: 0,
        fastestHire: 0,
        slowestHire: 0,
      };
    }

    const hireTimes = hiredApplications.map((app) => {
      const timeToHire = Math.floor(
        (new Date(app.updatedAt).getTime() -
          new Date(app.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return timeToHire;
    });

    return {
      avgDaysToHire: Math.round(
        hireTimes.reduce((a, b) => a + b) / hireTimes.length,
      ),
      fastestHire: Math.min(...hireTimes),
      slowestHire: Math.max(...hireTimes),
    };
  }

  async getDepartmentsByNames(names: string[]) {
    return this.prisma.department.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  }

  /**
   * Fetch department-specific growth plans for the upcoming period
   * This is used by the archive process to determine new hiring targets
   */
  async getDepartmentGrowthPlans() {
    // This would typically query a departmentGrowthPlans table
    // For now, we'll extract any data we can find from company settings

    const companySettings = await this.prisma.companySettings.findFirst();

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
      console.log('Could not parse company settings description as JSON');
    }

    // If no growth plans found, return empty array
    return [];
  }

  // NOTE: Method has been moved to HiringGoalService.archiveExpiredHiringGoals()
  // This implementation is deprecated and contains bugs
  async archiveExpiredHiringGoals(): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    throw new Error(
      'This method has been moved to HiringGoalService. Please use that service instead.',
    );
  }

  /**
   * Helper function to calculate the achievement rate
   */
  private calculateAchievementRate(
    actualHeadcount: number,
    targetHeadcount: number,
  ): number {
    if (targetHeadcount === 0) return 100; // Avoid division by zero
    return Math.min(100, Math.round((actualHeadcount / targetHeadcount) * 100));
  }
}
