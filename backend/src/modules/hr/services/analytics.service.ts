import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { JobRepository } from '../repositories/job.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import { DepartmentRepository } from '../repositories/department.repository';
import { Application, Department, Job, User } from '@prisma/client';

// Define clear interfaces for data structures
interface HiringTrend {
  name: string;
  applications: number;
  interviews: number;
  offers: number;
  hires: number;
}

interface RecruitmentFunnelItem {
  name: string;
  value: number;
  color: string;
}

interface DepartmentHiring {
  name: string;
  current: number;
  target: number;
  hired: number;
}

interface ActiveCandidate {
  id: number;
  name: string;
  role: string;
  department: string;
  status: string;
  progress: number;
  nextInterview: Date | null;
  recruiters: string[];
}

interface JobRequisition {
  id: number;
  title: string;
  department: string;
  openPositions: number;
  applicationsCount: number;
  status: string;
  priority: string;
  createdAt: Date;
}

interface DepartmentMetric {
  id: number;
  name: string;
  employeeCount: number;
  openPositions: number;
  turnoverRate: number;
  avgTimeToHire: number;
}

interface TimeToHireMetrics {
  avgDaysToHire: number;
  fastestHire: number;
  slowestHire: number;
}

interface DashboardData {
  hiringTrendsData: HiringTrend[];
  recruitmentFunnelData: RecruitmentFunnelItem[];
  departmentHiringData: DepartmentHiring[];
  activeCandidates: ActiveCandidate[];
  jobRequisitions: JobRequisition[];
  departmentMetrics: DepartmentMetric[];
  timeToHireMetrics: TimeToHireMetrics;
}

interface HiringStatistic {
  departmentId: number;
  departmentName: string;
  monthlyData: MonthlyData[];
  goal: {
    targetHeadcount: number;
    startDate: Date;
    endDate: Date;
  } | null;
}

interface MonthlyData {
  month: string;
  label: string;
  applications: number;
  interviews: number;
  offers: number;
  hires: number;
}

// Extended types for Prisma query results with relations
interface JobWithRelations extends Job {
  department?: Department;
  applications?: Application[];
}

interface CandidateInfo {
  id: number;
  name: string;
}

interface RecruiterInfo {
  recruiter: {
    name: string;
  };
}

interface ApplicationWithRelations extends Application {
  job?: JobWithRelations;
  candidate?: CandidateInfo;
  interviews?: any[];
  recruiters?: RecruiterInfo[];
}

interface DepartmentWithRelations extends Department {
  jobs?: JobWithRelations[];
  employees?: UserWithRelations[];
}

interface UserWithRelations extends User {
  department?: Department | null;
  hireDate?: Date | null;
  endDate?: Date | null;
}

interface DepartmentStats {
  name: string;
  months: Record<
    string,
    {
      applications: number;
      interviews: number;
      offers: number;
      hires: number;
    }
  >;
}

interface HiringGoal {
  departmentId: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  department: Department;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private jobRepository: JobRepository,
    private applicationRepository: ApplicationRepository,
    private departmentRepository: DepartmentRepository,
  ) {}

  /**
   * Get comprehensive HR dashboard data
   * @param skipCache Whether to skip cache and fetch fresh data
   * @returns All dashboard components combined
   */
  async getHRDashboardData(skipCache = false): Promise<DashboardData> {
    console.log('[DEBUG BACKEND] Starting to fetch HR dashboard data');
    console.log(`[DEBUG BACKEND] Skip cache: ${skipCache}`);

    try {
      // Fetch data with all necessary relations included
      const [jobs, applications, departments, employees, hiringGoals] =
        await Promise.all([
          this.fetchJobsWithRelations(),
          this.fetchApplicationsWithRelations(),
          this.fetchDepartmentsWithRelations(),
          this.fetchEmployeesWithRelations(),
          this.fetchHiringGoals(),
        ]);

      console.log('[DEBUG BACKEND] Successfully fetched all required data:', {
        jobsCount: jobs.length,
        applicationsCount: applications.length,
        departmentsCount: departments.length,
        employeesCount: employees.length,
        hiringGoalsCount: hiringGoals.length,
      });

      const dashboardData = {
        hiringTrendsData: this.calculateHiringTrends(applications),
        recruitmentFunnelData: this.calculateRecruitmentFunnel(applications),
        departmentHiringData: this.calculateDepartmentHiring(
          departments,
          employees,
          hiringGoals,
        ),
        activeCandidates: this.getActiveCandidates(applications),
        jobRequisitions: this.getJobRequisitions(jobs),
        departmentMetrics: this.calculateDepartmentMetrics(
          departments,
          jobs,
          employees,
        ),
        timeToHireMetrics: this.calculateTimeToHireMetrics(applications),
      };

      console.log('[DEBUG BACKEND] Generated dashboard data:', {
        hiringTrendsDataCount: dashboardData.hiringTrendsData?.length || 0,
        recruitmentFunnelDataCount:
          dashboardData.recruitmentFunnelData?.length || 0,
        departmentHiringDataCount:
          dashboardData.departmentHiringData?.length || 0,
        activeCandidatesCount: dashboardData.activeCandidates?.length || 0,
        jobRequisitionsCount: dashboardData.jobRequisitions?.length || 0,
      });

      return dashboardData;
    } catch (error) {
      console.error(
        '[DEBUG BACKEND] Error generating HR dashboard data:',
        error,
      );
      throw error;
    }
  }

  /**
   * Get metrics for all departments
   * @param skipCache Whether to skip cache and fetch fresh data
   */
  async getDepartmentMetrics(skipCache = false): Promise<DepartmentMetric[]> {
    console.log(
      `[DEBUG ANALYTICS] Fetching department metrics, skipCache: ${skipCache}`,
    );
    const [departments, employees, jobs] = await Promise.all([
      this.fetchDepartmentsWithRelations(),
      this.fetchEmployeesWithRelations(),
      this.fetchJobsWithRelations(),
    ]);

    return this.calculateDepartmentMetrics(departments, jobs, employees);
  }

  /**
   * Get hiring statistics by department
   * @param skipCache Whether to skip cache and fetch fresh data
   */
  async getHiringStatistics(skipCache = false): Promise<HiringStatistic[]> {
    console.log(
      `[DEBUG ANALYTICS] Fetching hiring statistics, skipCache: ${skipCache}`,
    );
    // Get a date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [departments, hiringGoals, applications, employees] =
      await Promise.all([
        this.fetchDepartmentsWithRelations(),
        this.fetchHiringGoals(),
        this.fetchApplicationsWithRelations({
          createdAt: {
            gte: sixMonthsAgo,
          },
        }),
        this.fetchEmployeesWithRelations({
          hireDate: {
            gte: sixMonthsAgo,
          },
        }),
      ]);

    return this.calculateMonthlyHiringStatistics(
      departments,
      hiringGoals,
      applications,
      employees,
    );
  }

  /**
   * Fetch jobs with related data
   */
  private async fetchJobsWithRelations(): Promise<JobWithRelations[]> {
    return this.prisma.job.findMany({
      include: {
        department: true,
        applications: true,
      },
    });
  }

  /**
   * Fetch applications with related data
   */
  private async fetchApplicationsWithRelations(
    where = {},
  ): Promise<ApplicationWithRelations[]> {
    return this.prisma.application.findMany({
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
          },
        },
        interviews: true,
        recruiters: {
          include: {
            recruiter: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where,
    });
  }

  /**
   * Fetch departments with related data
   */
  private async fetchDepartmentsWithRelations(): Promise<
    DepartmentWithRelations[]
  > {
    return this.prisma.department.findMany({
      include: {
        jobs: {
          include: {
            applications: true,
          },
        },
        employees: true,
      },
    });
  }

  /**
   * Fetch employees with related data
   */
  private async fetchEmployeesWithRelations(
    filter = {},
  ): Promise<UserWithRelations[]> {
    return this.prisma.user.findMany({
      where: {
        role: 'EMPLOYEE',
        ...filter,
      },
      include: {
        department: true,
      },
    });
  }

  /**
   * Fetch hiring goals with department info
   */
  private async fetchHiringGoals(): Promise<HiringGoal[]> {
    return this.prisma.hiringGoal.findMany({
      include: {
        department: true,
      },
    });
  }

  /**
   * Calculate hiring trends over the last 6 months
   */
  private calculateHiringTrends(
    applications: ApplicationWithRelations[],
  ): HiringTrend[] {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toLocaleString('default', { month: 'short' });
    }).reverse();

    return last6Months.map((month) => {
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
  }

  /**
   * Calculate recruitment funnel metrics
   */
  private calculateRecruitmentFunnel(
    applications: ApplicationWithRelations[],
  ): RecruitmentFunnelItem[] {
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

  /**
   * Calculate departmental hiring metrics
   */
  private calculateDepartmentHiring(
    departments: DepartmentWithRelations[],
    employees: UserWithRelations[],
    hiringGoals: HiringGoal[],
  ): DepartmentHiring[] {
    return departments.map((dept) => {
      const departmentGoal = hiringGoals.find(
        (goal) => goal.departmentId === dept.id,
      );

      // Find employees in this department
      const departmentEmployees = employees.filter(
        (emp) => emp.departmentId === dept.id,
      );
      const currentEmployees = departmentEmployees.length;
      const targetEmployees =
        departmentGoal?.targetHeadcount || currentEmployees;

      // Find recent hires (last 3 months)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Count employees hired in the last 3 months as recent hires
      const hired = departmentEmployees.filter(
        (emp) => emp.hireDate && new Date(emp.hireDate) >= threeMonthsAgo,
      ).length;

      return {
        name: dept.name,
        current: currentEmployees,
        target: targetEmployees,
        hired,
      };
    });
  }

  /**
   * Get list of active candidates
   */
  private getActiveCandidates(
    applications: ApplicationWithRelations[],
  ): ActiveCandidate[] {
    return applications
      .filter((app) =>
        ['SCREENING', 'INTERVIEWING', 'OFFER_SENT'].includes(app.status),
      )
      .map((app) => {
        // Extract recruiter names from the recruiter assignments
        const recruiters =
          app.recruiters?.map((rec) => rec.recruiter.name) || [];

        return {
          id: app.id,
          name: app.candidate?.name || 'Unknown',
          role: app.job?.title || 'Unknown',
          department: app.job?.department?.name || 'Unassigned',
          status: app.status,
          progress: this.calculateApplicationProgress(app.status),
          nextInterview: app.nextInterviewDate,
          recruiters,
        };
      })
      .slice(0, 5);
  }

  /**
   * Calculate progress percentage for an application status
   */
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

  /**
   * Get list of open job requisitions
   */
  private getJobRequisitions(jobs: JobWithRelations[]): JobRequisition[] {
    return jobs
      .filter((job) => job.status === 'OPEN')
      .map((job) => ({
        id: job.id,
        title: job.title,
        department: job.department?.name || 'No Department',
        openPositions: job.openPositions,
        applicationsCount: job.applications?.length || 0,
        status: job.status,
        priority: job.priority,
        createdAt: job.createdAt,
      }))
      .slice(0, 5);
  }

  /**
   * Calculate metrics for each department
   */
  private calculateDepartmentMetrics(
    departments: DepartmentWithRelations[],
    jobs: JobWithRelations[],
    employees: UserWithRelations[],
  ): DepartmentMetric[] {
    return departments.map((dept) => {
      const departmentEmployees = employees.filter(
        (emp) => emp.departmentId === dept.id,
      );

      const departmentJobs = jobs.filter((job) => job.departmentId === dept.id);

      return {
        id: dept.id,
        name: dept.name,
        employeeCount: departmentEmployees.length,
        openPositions: departmentJobs.filter((job) => job.status === 'OPEN')
          .length,
        turnoverRate: this.calculateTurnoverRate(departmentEmployees),
        avgTimeToHire: this.calculateAvgTimeToHire(departmentJobs),
      };
    });
  }

  /**
   * Calculate employee turnover rate
   */
  private calculateTurnoverRate(employees: UserWithRelations[]): number {
    const totalEmployees = employees.length;
    if (totalEmployees === 0) return 0;

    const leftEmployees = employees.filter(
      (emp) => emp.endDate !== null,
    ).length;
    return (leftEmployees / totalEmployees) * 100;
  }

  /**
   * Calculate average time to hire for jobs
   */
  private calculateAvgTimeToHire(jobs: JobWithRelations[]): number {
    const completedJobs = jobs.filter((job) =>
      job.applications?.some((app) => app.status === 'HIRED'),
    );

    if (completedJobs.length === 0) return 0;

    const totalDays = completedJobs.reduce((sum, job) => {
      const hiredApp = job.applications?.find((app) => app.status === 'HIRED');
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

  /**
   * Calculate time to hire metrics from applications
   */
  private calculateTimeToHireMetrics(
    applications: ApplicationWithRelations[],
  ): TimeToHireMetrics {
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

  /**
   * Calculate monthly hiring statistics by department
   */
  private calculateMonthlyHiringStatistics(
    departments: DepartmentWithRelations[],
    hiringGoals: HiringGoal[],
    applications: ApplicationWithRelations[],
    employees: UserWithRelations[],
  ): HiringStatistic[] {
    // Calculate monthly hiring stats by department
    const monthlyStats: Record<number, DepartmentStats> = {};
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

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
      if (app.job?.departmentId) {
        const deptId = app.job.departmentId;
        const appDate = new Date(app.createdAt);
        const monthKey = `${appDate.getFullYear()}-${appDate.getMonth() + 1}`;

        if (monthlyStats[deptId]?.months[monthKey]) {
          // Count applications
          monthlyStats[deptId].months[monthKey].applications++;

          // Count interviews
          if (app.interviews && app.interviews.length > 0) {
            monthlyStats[deptId].months[monthKey].interviews++;
          }

          // Count offers
          if (app.status === 'OFFER_SENT' || app.status === 'OFFER_ACCEPTED') {
            monthlyStats[deptId].months[monthKey].offers++;
          }
        }
      }
    });

    // Process hires - using hireDate field
    employees.forEach((emp) => {
      if (emp.departmentId && emp.hireDate) {
        const hireDate = new Date(emp.hireDate);
        const monthKey = `${hireDate.getFullYear()}-${hireDate.getMonth() + 1}`;

        if (monthlyStats[emp.departmentId]?.months[monthKey]) {
          monthlyStats[emp.departmentId].months[monthKey].hires++;
        }
      }
    });

    // Map hiring goals by department
    const departmentGoals: Record<
      number,
      {
        targetHeadcount: number;
        startDate: Date;
        endDate: Date;
      }
    > = {};

    hiringGoals.forEach((goal) => {
      departmentGoals[goal.departmentId] = {
        targetHeadcount: goal.targetHeadcount,
        startDate: goal.startDate,
        endDate: goal.endDate,
      };
    });

    // Format the results for the frontend
    return Object.entries(monthlyStats).map(([deptId, dept]) => {
      const monthsArray: MonthlyData[] = Object.entries(dept.months).map(
        ([monthKey, stats]) => {
          const [year, month] = monthKey.split('-').map(Number);
          return {
            month: monthKey,
            label: new Date(year, month - 1).toLocaleString('default', {
              month: 'short',
              year: '2-digit',
            }),
            applications: stats.applications,
            interviews: stats.interviews,
            offers: stats.offers,
            hires: stats.hires,
          };
        },
      );

      return {
        departmentId: Number(deptId),
        departmentName: dept.name,
        monthlyData: monthsArray.sort((a, b) => {
          const [aYear, aMonth] = a.month.split('-').map(Number);
          const [bYear, bMonth] = b.month.split('-').map(Number);
          return (
            new Date(aYear, aMonth - 1).getTime() -
            new Date(bYear, bMonth - 1).getTime()
          );
        }),
        goal: departmentGoals[Number(deptId)] || null,
      };
    });
  }

  /**
   * Find departments by their names
   */
  async getDepartmentsByNames(names: string[]): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  }
}
