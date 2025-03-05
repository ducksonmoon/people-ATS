import { Injectable } from '@nestjs/common';
import {
  Application,
  Job,
  User,
  JobCategory,
  JobLocation,
  Interview,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';

// Define interfaces for better type safety
interface MonthlyTrend {
  name: string;
  applications: number;
  interviews: number;
  offers: number;
  hires: number;
}

interface FunnelStage {
  name: string;
  value: number;
}

interface DepartmentHiring {
  name: string;
  current: number;
  target: number;
  hired: number;
}

interface RecentHire {
  id: number;
  applicantName: string;
  jobTitle: string;
  hireDate: Date;
}

interface UpcomingInterview {
  id: number;
  applicantName: string;
  jobTitle: string;
  interviewDate: Date;
}

interface OpenPosition {
  id: number;
  title: string;
  applicants: number;
  location: string;
  postedBy: string;
  createdAt: Date;
}

interface DashboardData {
  totalJobs: number;
  totalApplications: number;
  totalRecruiters: number;
  totalCandidates: number;
  hiringTrendsData: MonthlyTrend[];
  recruitmentFunnelData: FunnelStage[];
  departmentHiringData: DepartmentHiring[];
  recentHires: RecentHire[];
  upcomingInterviews: UpcomingInterview[];
  openPositions: OpenPosition[];
  recentApplications: Application[];
}

// Define application status enum for better type safety
enum ApplicationStatus {
  PENDING = 'PENDING',
  INTERVIEWING = 'INTERVIEWING',
  OFFER_SENT = 'OFFER_SENT',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

// Define types for the data we're working with
type JobWithRelations = Job & {
  category?: JobCategory;
  location?: JobLocation;
  applications: Application[];
  postedBy: User;
};

type ApplicationWithRelations = Application & {
  job: Job;
  candidate: User;
  interviews?: Interview[];
};

// Extend the User type to ensure TypeScript recognizes the properties
interface UserWithRole extends User {
  role: Role;
  name: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all data needed for the HR dashboard
   * @param skipCache Whether to skip cache and fetch fresh data
   * @returns Dashboard data with various metrics and analytics
   */
  async getHRDashboardData(skipCache = false): Promise<DashboardData> {
    const [jobs, applications, users] = await Promise.all([
      this.fetchJobs(),
      this.fetchApplications(),
      this.fetchUsers(),
    ]);

    return {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      totalRecruiters: users.filter((u) => u.role === 'RECRUITER').length,
      totalCandidates: users.filter((u) => u.role === 'CANDIDATE').length,
      hiringTrendsData: this.calculateHiringTrends(applications),
      recruitmentFunnelData: this.calculateRecruitmentFunnel(applications),
      departmentHiringData: this.calculateDepartmentHiring(jobs),
      recentHires: this.getRecentHires(applications),
      upcomingInterviews: this.getUpcomingInterviews(applications),
      openPositions: this.calculateOpenPositions(jobs),
      recentApplications: applications.slice(0, 10), // Most recent 10 applications
    };
  }

  /**
   * Fetches all jobs with their related data
   * @returns Array of jobs with related data
   */
  private async fetchJobs(): Promise<JobWithRelations[]> {
    return this.prisma.job.findMany({
      include: {
        category: true,
        location: true,
        applications: true,
        postedBy: true,
      },
    });
  }

  /**
   * Fetches all applications with their related data
   * @returns Array of applications with related data
   */
  private async fetchApplications(): Promise<ApplicationWithRelations[]> {
    return this.prisma.application.findMany({
      include: {
        job: true,
        candidate: true,
        interviews: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetches all users with admin or recruiter roles
   * @returns Array of users
   */
  private async fetchUsers(): Promise<UserWithRole[]> {
    return this.prisma.user.findMany({
      where: { role: { in: ['RECRUITER', 'ADMIN'] } },
    }) as Promise<UserWithRole[]>;
  }

  /**
   * Calculates hiring trends over the last 6 months
   * @param applications Array of applications
   * @returns Monthly trend data
   */
  private calculateHiringTrends(
    applications: ApplicationWithRelations[],
  ): MonthlyTrend[] {
    const months = this.generateLastSixMonths();
    this.populateMonthlyData(months, applications);

    return months.map((m) => ({
      name: m.name,
      applications: m.applications,
      interviews: m.interviews,
      offers: m.offers,
      hires: m.hires,
    }));
  }

  /**
   * Generates data structure for the last six months
   * @returns Array of month data objects
   */
  private generateLastSixMonths(): Array<{
    date: Date;
    name: string;
    applications: number;
    interviews: number;
    offers: number;
    hires: number;
  }> {
    const months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        date: month,
        name: month.toLocaleString('default', { month: 'short' }),
        applications: 0,
        interviews: 0,
        offers: 0,
        hires: 0,
      });
    }

    return months;
  }

  /**
   * Populates monthly data with application statistics
   * @param months Array of month data objects
   * @param applications Array of applications
   */
  private populateMonthlyData(
    months: Array<{
      date: Date;
      name: string;
      applications: number;
      interviews: number;
      offers: number;
      hires: number;
    }>,
    applications: ApplicationWithRelations[],
  ): void {
    applications.forEach((app) => {
      const appDate = new Date(app.createdAt);

      months.forEach((month) => {
        if (
          appDate.getMonth() === month.date.getMonth() &&
          appDate.getFullYear() === month.date.getFullYear()
        ) {
          month.applications++;

          if (
            [
              ApplicationStatus.INTERVIEWING,
              ApplicationStatus.OFFER_SENT,
              ApplicationStatus.HIRED,
              ApplicationStatus.REJECTED,
            ].includes(app.status as ApplicationStatus)
          ) {
            month.interviews++;
          }

          if (
            [
              ApplicationStatus.OFFER_SENT,
              ApplicationStatus.HIRED,
              ApplicationStatus.REJECTED,
            ].includes(app.status as ApplicationStatus)
          ) {
            month.offers++;
          }

          if (app.status === ApplicationStatus.HIRED) {
            month.hires++;
          }
        }
      });
    });
  }

  /**
   * Calculates recruitment funnel data
   * @param applications Array of applications
   * @returns Funnel stage data
   */
  private calculateRecruitmentFunnel(
    applications: ApplicationWithRelations[],
  ): FunnelStage[] {
    const totalApplications = applications.length;
    const screening = applications.filter((app) =>
      [
        ApplicationStatus.INTERVIEWING,
        ApplicationStatus.OFFER_SENT,
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ].includes(app.status as ApplicationStatus),
    ).length;
    const interviews = applications.filter((app) =>
      [
        ApplicationStatus.INTERVIEWING,
        ApplicationStatus.OFFER_SENT,
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ].includes(app.status as ApplicationStatus),
    ).length;
    const offers = applications.filter((app) =>
      [
        ApplicationStatus.OFFER_SENT,
        ApplicationStatus.HIRED,
        ApplicationStatus.REJECTED,
      ].includes(app.status as ApplicationStatus),
    ).length;
    const hires = applications.filter(
      (app) => app.status === ApplicationStatus.HIRED,
    ).length;

    return [
      { name: 'Applications', value: totalApplications },
      { name: 'Screening', value: screening },
      { name: 'Interviews', value: interviews },
      { name: 'Offers', value: offers },
      { name: 'Hires', value: hires },
    ];
  }

  /**
   * Calculates department hiring data
   * @param jobs Array of jobs with relations
   * @returns Department hiring data
   */
  private calculateDepartmentHiring(
    jobs: JobWithRelations[],
  ): DepartmentHiring[] {
    const departmentMap = new Map<
      string,
      { name: string; current: number; target: number; hired: number }
    >();

    jobs.forEach((job) => {
      const category = job.category?.name || 'Uncategorized';

      if (!departmentMap.has(category)) {
        departmentMap.set(category, {
          name: category,
          current: 0,
          target: 5, // Default target per department (can be customized)
          hired: 0,
        });
      }

      const dept = departmentMap.get(category)!;
      dept.current++;

      const hiredCount =
        job.applications?.filter(
          (app) => app.status === ApplicationStatus.HIRED,
        ).length || 0;
      dept.hired += hiredCount;
    });

    return Array.from(departmentMap.values());
  }

  /**
   * Gets recent hires data
   * @param applications Array of applications with relations
   * @returns Recent hires data
   */
  private getRecentHires(
    applications: ApplicationWithRelations[],
  ): RecentHire[] {
    return applications
      .filter((app) => app.status === ApplicationStatus.HIRED)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5)
      .map((app) => ({
        id: app.id,
        applicantName: (app.candidate as UserWithRole).name,
        jobTitle: app.job.title,
        hireDate: app.updatedAt,
      }));
  }

  /**
   * Gets upcoming interviews data
   * @param applications Array of applications with relations
   * @returns Upcoming interviews data
   */
  private getUpcomingInterviews(
    applications: ApplicationWithRelations[],
  ): UpcomingInterview[] {
    const now = new Date();

    return applications
      .filter(
        (app) =>
          app.status === ApplicationStatus.INTERVIEWING &&
          app.interviews &&
          app.interviews.length > 0,
      )
      .map((app) => {
        // Get the next upcoming interview date
        const upcomingInterviews = app.interviews
          ?.filter((interview) => new Date(interview.scheduledAt) > now)
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime(),
          );

        const nextInterview =
          upcomingInterviews && upcomingInterviews.length > 0
            ? upcomingInterviews[0]
            : null;

        return {
          id: app.id,
          applicantName: (app.candidate as UserWithRole).name,
          jobTitle: app.job.title,
          interviewDate: nextInterview
            ? new Date(nextInterview.scheduledAt)
            : new Date(app.updatedAt), // Fallback to updatedAt if no scheduled interviews
        };
      })
      .filter((interview) => interview.interviewDate >= now) // Only future interviews
      .sort((a, b) => a.interviewDate.getTime() - b.interviewDate.getTime())
      .slice(0, 5);
  }

  /**
   * Calculates open positions data
   * @param jobs Array of jobs with relations
   * @returns Open positions data
   */
  private calculateOpenPositions(jobs: JobWithRelations[]): OpenPosition[] {
    return jobs
      .filter(
        (job) =>
          job.applications.filter(
            (app) => app.status === ApplicationStatus.HIRED,
          ).length < 1,
      )
      .slice(0, 5)
      .map((job) => ({
        id: job.id,
        title: job.title,
        applicants: job.applications.length,
        location: job.location?.name || 'Remote',
        postedBy: (job.postedBy as UserWithRole).name,
        createdAt: job.createdAt,
      }));
  }
}
