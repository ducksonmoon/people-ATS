import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Application, Job, User } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import {
  StatusCount,
  JobPerformance,
  RecentActivity,
  TimeToHireMetrics,
  RecruiterDashboardData,
  ApplicationStatus,
  ApplicationWithDetails,
} from './recruiter.types';
import { performance } from 'perf_hooks';

// Cache interfaces
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface RecruiterCache {
  // Use recruiterId as key
  recruiterDashboard: Map<number, CacheItem<RecruiterDashboardData>>;
  hrDashboard: Map<number, CacheItem<RecruiterDashboardData>>;
}

@Injectable()
export class RecruiterService {
  private readonly logger = new Logger(RecruiterService.name);

  // Cache settings
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
  private readonly RECRUITER_CACHE: RecruiterCache = {
    recruiterDashboard: new Map(),
    hrDashboard: new Map(),
  };

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a cached item is still valid
   * @param cacheItem The cached item to check
   * @returns Whether the cache is still valid
   */
  private isCacheValid(cacheItem?: CacheItem<any>): boolean {
    if (!cacheItem) return false;
    const now = Date.now();
    return now - cacheItem.timestamp < this.CACHE_TTL_MS;
  }

  /**
   * Clear all caches for a specific recruiter
   * @param recruiterId The ID of the recruiter whose cache to clear
   */
  public clearRecruiterCache(recruiterId: number): void {
    this.logger.log(`Clearing cache for recruiter ${recruiterId}`);
    this.RECRUITER_CACHE.recruiterDashboard.delete(recruiterId);
    this.RECRUITER_CACHE.hrDashboard.delete(recruiterId);
  }

  /**
   * Clear all recruiter caches
   */
  public clearAllCaches(): void {
    this.logger.log('Clearing all recruiter caches');
    this.RECRUITER_CACHE.recruiterDashboard.clear();
    this.RECRUITER_CACHE.hrDashboard.clear();
  }

  /**
   * Get all applications for jobs posted by a specific recruiter
   * @param recruiterId The ID of the recruiter
   * @returns List of applications with job and candidate details
   */
  async getApplicationsByRecruiter(
    recruiterId: number,
  ): Promise<ApplicationWithDetails[]> {
    try {
      // This method is not cached as it's typically used for real-time viewing
      const applications = await this.prisma.application.findMany({
        where: {
          job: {
            postedById: recruiterId,
          },
        },
        include: {
          candidate: true,
          job: true,
        },
      });

      // Return the applications directly - they already match the ApplicationWithDetails type
      // because we included the job and candidate relations
      return applications as ApplicationWithDetails[];
    } catch (error) {
      this.logger.error(
        `Error fetching applications for recruiter ${recruiterId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get dashboard data for a specific recruiter
   * @param recruiterId The ID of the recruiter
   * @param skipCache Whether to skip the cache and fetch fresh data
   * @returns Consolidated dashboard data
   */
  async getRecruiterDashboardData(
    recruiterId: number,
    skipCache = false,
  ): Promise<RecruiterDashboardData> {
    const cacheKey = recruiterId;
    const cachedData = this.RECRUITER_CACHE.recruiterDashboard.get(cacheKey);

    try {
      const startTime = performance.now();

      // Return cached data if valid and not skipping cache
      if (!skipCache && this.isCacheValid(cachedData)) {
        const endTime = performance.now();
        this.logger.log(
          `[CACHE] Retrieved dashboard data for recruiter ${recruiterId} from cache in ${(
            endTime - startTime
          ).toFixed(2)}ms`,
        );
        return cachedData.data;
      }

      this.logger.log(
        `Fetching fresh dashboard data for recruiter ${recruiterId}${
          skipCache ? ' (cache skip requested)' : ''
        }`,
      );

      // Get all jobs created by this recruiter
      const jobs = await this.fetchRecruiterJobs(recruiterId);

      if (jobs.length === 0) {
        return this.getEmptyDashboardData();
      }

      // Get all applications for the recruiter's jobs
      const applications = await this.fetchApplicationsForJobs(jobs);

      // Calculate metrics
      const statusCounts = this.calculateStatusCounts(applications);
      const jobPerformanceData = this.calculateJobPerformanceData(jobs);
      const recentActivity = this.getRecentActivity(applications);
      const timeToHireMetrics = this.calculateTimeToHireMetrics(applications);

      // Prepare the dashboard data
      const dashboardData = {
        totalJobs: jobs.length,
        totalApplications: applications.length,
        pendingReviews: this.countApplicationsByStatus(
          applications,
          ApplicationStatus.PENDING,
        ),
        interviewScheduled: this.countApplicationsByStatus(
          applications,
          ApplicationStatus.INTERVIEWING,
        ),
        offersSent: this.countApplicationsByStatus(
          applications,
          ApplicationStatus.OFFER_SENT,
        ),
        statusCounts,
        jobPerformanceData,
        recentActivity,
        timeToHireMetrics,
        recentApplications: this.getRecentApplications(applications, 10),
        activeJobs: this.getActiveJobs(jobs, 5),
      };

      // Update cache with fresh data
      this.RECRUITER_CACHE.recruiterDashboard.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now(),
      });

      const endTime = performance.now();
      this.logger.log(
        `Fetched and calculated dashboard data for recruiter ${recruiterId} in ${(
          endTime - startTime
        ).toFixed(2)}ms`,
      );

      return dashboardData;
    } catch (error) {
      this.logger.error(
        `Error fetching dashboard data for recruiter ${recruiterId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Adapt HR data format to recruiter dashboard format
   * @param hrData HR format data
   * @param recruiterId The ID of the recruiter
   * @param skipCache Whether to skip the cache and fetch fresh data
   * @returns Data formatted for recruiter dashboard
   */
  async adaptHRDataToRecruiterFormat(
    hrData: any,
    recruiterId: number,
    skipCache = false,
  ): Promise<RecruiterDashboardData> {
    const cacheKey = recruiterId;
    const cachedData = this.RECRUITER_CACHE.hrDashboard.get(cacheKey);

    try {
      const startTime = performance.now();

      // Return cached data if valid and not skipping cache
      if (!skipCache && this.isCacheValid(cachedData)) {
        const endTime = performance.now();
        this.logger.log(
          `[CACHE] Retrieved HR dashboard data for recruiter ${recruiterId} from cache in ${(
            endTime - startTime
          ).toFixed(2)}ms`,
        );
        return cachedData.data;
      }

      this.logger.log(
        `Adapting HR data to recruiter format for recruiter ${recruiterId}${
          skipCache ? ' (cache skip requested)' : ''
        }`,
      );

      // Rest of the method remains unchanged
      if (!hrData) {
        return this.getEmptyDashboardData();
      }

      // Extract the data we need from the HR dashboard
      const {
        activeCandidates,
        jobRequisitions,
        hiringTrendsData,
        timeToHireMetrics,
      } = hrData;

      // Map to recruiter dashboard format
      const statusCounts = this.mapHRDataToStatusCounts(activeCandidates);
      const jobPerformanceData =
        this.mapHRDataToJobPerformance(hiringTrendsData);
      const recentActivity =
        this.mapCandidatesToRecentActivity(activeCandidates);
      const mappedTimeToHireMetrics =
        this.mapHRDataToTimeToHireMetrics(timeToHireMetrics);

      // Format the applications and jobs
      const formattedApplications = this.getFormattedApplications(
        [],
        activeCandidates,
      );
      const activeJobs = this.mapJobRequisitionsToActiveJobs(jobRequisitions);

      // Create the dashboard data
      const dashboardData = {
        totalJobs: jobRequisitions ? jobRequisitions.length : 0,
        totalApplications: activeCandidates ? activeCandidates.length : 0,
        pendingReviews: this.countCandidatesByStatus(
          activeCandidates || [],
          'pending',
        ),
        interviewScheduled: this.countCandidatesByStatus(
          activeCandidates || [],
          'interviewing',
        ),
        offersSent: this.countCandidatesByStatus(
          activeCandidates || [],
          'offer',
        ),
        statusCounts,
        jobPerformanceData,
        recentActivity,
        timeToHireMetrics: mappedTimeToHireMetrics,
        recentApplications: formattedApplications,
        activeJobs,
      };

      // Update cache with fresh data
      this.RECRUITER_CACHE.hrDashboard.set(cacheKey, {
        data: dashboardData,
        timestamp: Date.now(),
      });

      const endTime = performance.now();
      this.logger.log(
        `Adapted HR data to recruiter format for recruiter ${recruiterId} in ${(
          endTime - startTime
        ).toFixed(2)}ms`,
      );

      return dashboardData;
    } catch (error) {
      this.logger.error(
        `Error adapting HR data for recruiter ${recruiterId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Private helper methods

  /**
   * Fetch jobs created by a recruiter
   */
  private async fetchRecruiterJobs(recruiterId: number) {
    return this.prisma.job.findMany({
      where: { postedById: recruiterId },
      include: {
        category: true,
        location: true,
        applications: true,
      },
    });
  }

  /**
   * Fetch applications for a list of jobs
   */
  private async fetchApplicationsForJobs(jobs: Job[]) {
    const jobIds = jobs.map((job) => job.id);
    return this.prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: {
        job: true,
        candidate: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Fetch recent applications
   */
  private async fetchRecentApplications() {
    try {
      return await this.prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          job: true,
          candidate: true,
        },
      });
    } catch (error) {
      this.logger.error('Error fetching recent applications:', error);
      return [];
    }
  }

  /**
   * Get empty dashboard data when no jobs are found
   */
  private getEmptyDashboardData(): RecruiterDashboardData {
    return {
      totalJobs: 0,
      totalApplications: 0,
      pendingReviews: 0,
      interviewScheduled: 0,
      offersSent: 0,
      statusCounts: this.getEmptyStatusCounts(),
      jobPerformanceData: [],
      recentActivity: [],
      timeToHireMetrics: { averageDays: 0, fastestDays: 0, slowestDays: 0 },
      recentApplications: [],
      activeJobs: [],
    };
  }

  /**
   * Get empty status counts object
   */
  private getEmptyStatusCounts(): StatusCount[] {
    return [
      { name: 'Pending Review', value: 0 },
      { name: 'Interviewing', value: 0 },
      { name: 'Offer Sent', value: 0 },
      { name: 'Rejected', value: 0 },
      { name: 'Hired', value: 0 },
    ];
  }

  /**
   * Count applications by status
   */
  private countApplicationsByStatus(
    applications: Application[],
    status: ApplicationStatus,
  ): number {
    return applications.filter((app) => app.status === status).length;
  }

  /**
   * Count candidates by status
   */
  private countCandidatesByStatus(candidates: any[], status: string): number {
    return candidates.filter((c) => c.status === status).length;
  }

  /**
   * Get recent applications
   */
  private getRecentApplications(applications: any[], limit: number) {
    return applications.slice(0, limit);
  }

  /**
   * Get active jobs
   */
  private getActiveJobs(jobs: any[], limit: number) {
    return jobs
      .filter((job) =>
        job.applications.some((app) =>
          [
            ApplicationStatus.PENDING,
            ApplicationStatus.INTERVIEWING,
            ApplicationStatus.OFFER_SENT,
          ].includes(app.status),
        ),
      )
      .slice(0, limit);
  }

  /**
   * Calculate status counts for applications
   */
  private calculateStatusCounts(applications: Application[]): StatusCount[] {
    const statuses = {
      [ApplicationStatus.PENDING]: { name: 'Pending Review', value: 0 },
      [ApplicationStatus.INTERVIEWING]: { name: 'Interviewing', value: 0 },
      [ApplicationStatus.OFFER_SENT]: { name: 'Offer Sent', value: 0 },
      [ApplicationStatus.REJECTED]: { name: 'Rejected', value: 0 },
      [ApplicationStatus.HIRED]: { name: 'Hired', value: 0 },
    };

    applications.forEach((app) => {
      if (app.status in statuses) {
        statuses[app.status].value += 1;
      }
    });

    return Object.values(statuses);
  }

  /**
   * Calculate job performance data
   */
  private calculateJobPerformanceData(
    jobs: (Job & { applications: Application[] })[],
  ): JobPerformance[] {
    return jobs.slice(0, 5).map((job) => ({
      name: job.title,
      applications: job.applications.length,
      interviews: job.applications.filter((app) =>
        [
          ApplicationStatus.INTERVIEWING,
          ApplicationStatus.OFFER_SENT,
          ApplicationStatus.HIRED,
          ApplicationStatus.REJECTED,
        ].includes(app.status as ApplicationStatus),
      ).length,
    }));
  }

  /**
   * Get recent activity from applications
   */
  private getRecentActivity(
    applications: (Application & { candidate: User; job: Job })[],
  ): RecentActivity[] {
    return applications.slice(0, 10).map((app) => ({
      id: app.id,
      type: 'application',
      status: app.status,
      // Fix for the type error - Use string type assertion to handle potential missing name property
      // The schema confirms User has a name property, but TypeScript may not recognize it
      applicantName: (app.candidate as any).name || 'Unknown',
      jobTitle: app.job.title,
      timestamp: app.updatedAt,
    }));
  }

  /**
   * Calculate time to hire metrics
   */
  private calculateTimeToHireMetrics(
    applications: Application[],
  ): TimeToHireMetrics {
    const hiredApplications = applications.filter(
      (app) => app.status === ApplicationStatus.HIRED,
    );

    if (hiredApplications.length === 0) {
      return {
        averageDays: 0,
        fastestDays: 0,
        slowestDays: 0,
      };
    }

    const timeToHireDays = hiredApplications.map((app) => {
      const created = new Date(app.createdAt);
      const updated = new Date(app.updatedAt);
      const diffTime = Math.abs(updated.getTime() - created.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    });

    return {
      averageDays: Math.round(
        timeToHireDays.reduce((sum, days) => sum + days, 0) /
          timeToHireDays.length,
      ),
      fastestDays: Math.min(...timeToHireDays),
      slowestDays: Math.max(...timeToHireDays),
    };
  }

  /**
   * Map HR data to status counts
   */
  private mapHRDataToStatusCounts(activeCandidates: any[]): StatusCount[] {
    return [
      {
        name: 'Pending Review',
        value: this.countCandidatesByStatus(
          activeCandidates,
          ApplicationStatus.PENDING,
        ),
      },
      {
        name: 'Interviewing',
        value: this.countCandidatesByStatus(
          activeCandidates,
          ApplicationStatus.INTERVIEWING,
        ),
      },
      {
        name: 'Offer Sent',
        value: this.countCandidatesByStatus(
          activeCandidates,
          ApplicationStatus.OFFER_SENT,
        ),
      },
      { name: 'Rejected', value: 0 }, // Not available in HR data
      { name: 'Hired', value: 0 }, // Not available in HR data
    ];
  }

  /**
   * Map HR data to job performance
   */
  private mapHRDataToJobPerformance(hiringTrendsData: any[]): JobPerformance[] {
    if (!hiringTrendsData || !Array.isArray(hiringTrendsData)) {
      return [];
    }

    return hiringTrendsData.map((item) => ({
      name: item.name || 'Unknown',
      applications: item.applications || 0,
      interviews: item.interviews || 0,
    }));
  }

  /**
   * Map candidates to recent activity
   */
  private mapCandidatesToRecentActivity(candidates: any[]): RecentActivity[] {
    if (!candidates || !Array.isArray(candidates)) {
      return [];
    }

    return candidates.map((c) => ({
      id: c.id,
      type: 'application',
      status: c.status,
      applicantName: c.name || 'Unknown',
      jobTitle: c.role || 'Unknown',
      timestamp: new Date(), // Not available in HR data, use current date
    }));
  }

  /**
   * Map HR data to time to hire metrics
   */
  private mapHRDataToTimeToHireMetrics(
    timeToHireMetrics: any,
  ): TimeToHireMetrics {
    if (!timeToHireMetrics) {
      return { averageDays: 0, fastestDays: 0, slowestDays: 0 };
    }

    return {
      averageDays: timeToHireMetrics.avgDaysToHire || 0,
      fastestDays: timeToHireMetrics.fastestHire || 0,
      slowestDays: timeToHireMetrics.slowestHire || 0,
    };
  }

  /**
   * Get formatted applications
   */
  private getFormattedApplications(
    applications: any[],
    activeCandidates: any[],
  ): any[] {
    if (applications.length > 0) {
      return applications.map((app) => ({
        id: app.id,
        applicantName: (app.candidate as any).name || 'Unknown',
        applicantEmail: app.candidate.email,
        jobTitle: app.job.title,
        status: app.status,
        createdAt: app.createdAt,
      }));
    }

    return activeCandidates.map((c) => ({
      id: c.id,
      applicantName: c.name || 'Unknown',
      applicantEmail: 'email@example.com',
      jobTitle: c.role || 'Unknown',
      status: c.status,
      createdAt: new Date().toISOString(),
    }));
  }

  /**
   * Map job requisitions to active jobs
   */
  private mapJobRequisitionsToActiveJobs(jobRequisitions: any[]): any[] {
    if (!jobRequisitions || !Array.isArray(jobRequisitions)) {
      return [];
    }

    return jobRequisitions.map((job) => ({
      id: job.id,
      title: job.title || 'Unknown',
      department: job.department || 'Unknown',
      applications: job.applicationsCount || 0,
      openPositions: job.openPositions || 0,
      status: job.status || 'Unknown',
    }));
  }
}
