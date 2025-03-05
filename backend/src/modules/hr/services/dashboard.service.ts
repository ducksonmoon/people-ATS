import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DashboardRepository } from '../repositories/dashboard.repository';
import { DepartmentRepository } from '../repositories/department.repository';
import { ApplicationRepository } from '../repositories/application.repository';
import { JobRepository } from '../repositories/job.repository';
import {
  DashboardDataDto,
  DepartmentMetricDto,
  TimeToHireMetricDto,
  HiringTrendDto,
  RecruitmentFunnelItemDto,
  DepartmentHiringDto,
  ActiveCandidateDto,
  JobRequisitionDto,
} from '../dtos/dashboard.dto';
import { performance } from 'perf_hooks';

// Cache interfaces
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface DashboardCache {
  dashboardData?: CacheItem<DashboardDataDto>;
  departmentMetrics?: CacheItem<DepartmentMetricDto[]>;
  timeToHireMetrics?: CacheItem<TimeToHireMetricDto>;
  hiringTrends?: CacheItem<HiringTrendDto[]>;
  recruitmentFunnel?: CacheItem<RecruitmentFunnelItemDto[]>;
  departmentHiring?: CacheItem<DepartmentHiringDto[]>;
  // Department-specific caches use departmentId as key
  activeCandidates: Map<string, CacheItem<ActiveCandidateDto[]>>;
  jobRequisitions: Map<string, CacheItem<JobRequisitionDto[]>>;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  // Cache settings
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
  private readonly DASHBOARD_CACHE: DashboardCache = {
    activeCandidates: new Map(),
    jobRequisitions: new Map(),
  };

  constructor(
    private dashboardRepository: DashboardRepository,
    private departmentRepository: DepartmentRepository,
    private applicationRepository: ApplicationRepository,
    private jobRepository: JobRepository,
  ) {}

  /**
   * Check if a cached item is still valid
   */
  private isCacheValid<T>(cacheItem?: CacheItem<T>): boolean {
    if (!cacheItem) return false;

    const now = Date.now();
    const cacheAge = now - cacheItem.timestamp;
    return cacheAge < this.CACHE_TTL_MS;
  }

  /**
   * Get complete dashboard data for HR dashboard
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Complete dashboard data DTO with all metrics
   */
  async getDashboardData(skipCache = false): Promise<DashboardDataDto> {
    const startTime = performance.now();
    this.logger.log(
      `Fetching complete dashboard data, skipCache: ${skipCache}`,
    );

    // Check cache first if not skipping
    if (!skipCache && this.isCacheValid(this.DASHBOARD_CACHE.dashboardData)) {
      const cachedData = this.DASHBOARD_CACHE.dashboardData!.data;
      this.logger.log('Using cached dashboard data');
      return cachedData;
    }

    try {
      // Fetch all required data in parallel for performance
      const [
        jobRequisitions,
        activeApplications,
        departmentMetrics,
        hiringData,
        timeToHireData,
        hiringGoals,
      ] = await Promise.all([
        this.dashboardRepository.getJobRequisitions(),
        this.dashboardRepository.getActiveApplications(),
        this.dashboardRepository.getDepartmentMetrics(),
        this.dashboardRepository.getHistoricalHiringData(),
        this.dashboardRepository.getTimeToHireData(),
        this.dashboardRepository.getDepartmentHiringGoals(),
      ]);

      // Process the data into the required format
      const hiringTrends = this.processHiringTrends(hiringData);
      const recruitmentFunnel =
        this.processRecruitmentFunnel(activeApplications);
      const departmentHiring = this.processDepartmentHiring(
        departmentMetrics,
        hiringGoals,
      );
      const activeCandidates = this.processActiveCandidates(activeApplications);
      const processedJobRequisitions =
        this.processJobRequisitions(jobRequisitions);
      const processedDepartmentMetrics =
        this.processDepartmentMetrics(departmentMetrics);
      const timeToHireMetrics = this.processTimeToHireMetrics(timeToHireData);

      const dashboardData = {
        hiringTrendsData: hiringTrends,
        recruitmentFunnelData: recruitmentFunnel,
        departmentHiringData: departmentHiring,
        activeCandidates: activeCandidates,
        jobRequisitions: processedJobRequisitions,
        departmentMetrics: processedDepartmentMetrics,
        timeToHireMetrics: timeToHireMetrics,
      };

      // Update cache
      this.DASHBOARD_CACHE.dashboardData = {
        data: dashboardData,
        timestamp: Date.now(),
      };

      const endTime = performance.now();
      this.logger.log(
        `Dashboard data fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return dashboardData;
    } catch (error) {
      const endTime = performance.now();
      this.logger.error(
        `Error fetching dashboard data [${Math.round(endTime - startTime)}ms]: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch dashboard data');
    }
  }

  /**
   * Get time-to-hire metrics
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Time to hire metrics
   */
  async getTimeToHireMetrics(skipCache = false): Promise<TimeToHireMetricDto> {
    try {
      this.logger.log(`Fetching time-to-hire metrics, skipCache: ${skipCache}`);
      const startTime = performance.now();

      // Check cache first if not skipping
      if (
        !skipCache &&
        this.isCacheValid(this.DASHBOARD_CACHE.timeToHireMetrics)
      ) {
        const cachedData = this.DASHBOARD_CACHE.timeToHireMetrics!.data;
        this.logger.log('Using cached time-to-hire metrics');
        return cachedData;
      }

      const timeToHireData = await this.dashboardRepository.getTimeToHireData();
      const result = this.processTimeToHireMetrics(timeToHireData);

      // Update cache
      this.DASHBOARD_CACHE.timeToHireMetrics = {
        data: result,
        timestamp: Date.now(),
      };

      const endTime = performance.now();
      this.logger.log(
        `Time-to-hire metrics fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching time-to-hire metrics: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch time-to-hire metrics',
      );
    }
  }

  /**
   * Get only department metrics
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Array of department metrics
   */
  async getDepartmentMetrics(skipCache = false): Promise<DepartmentMetricDto[]> {
    try {
      this.logger.log(`Fetching department metrics, skipCache: ${skipCache}`);
      const startTime = performance.now();
      
      // Check cache first if not skipping
      if (!skipCache && this.isCacheValid(this.DASHBOARD_CACHE.departmentMetrics)) {
        const cachedData = this.DASHBOARD_CACHE.departmentMetrics!.data;
        this.logger.log('Using cached department metrics');
        return cachedData;
      }
      
      const departmentMetrics =
        await this.dashboardRepository.getDepartmentMetrics();
      const result = this.processDepartmentMetrics(departmentMetrics);
      
      // Update cache
      this.DASHBOARD_CACHE.departmentMetrics = {
        data: result,
        timestamp: Date.now(),
      };
      
      const endTime = performance.now();
      this.logger.log(
        `Department metrics fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching department metrics: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch department metrics',
      );
    }
  }

  /**
   * Get hiring trends data
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Array of hiring trends by month
   */
  async getHiringTrends(skipCache = false): Promise<HiringTrendDto[]> {
    try {
      this.logger.log(`Fetching hiring trends data, skipCache: ${skipCache}`);
      const startTime = performance.now();
      
      // Check cache first if not skipping
      if (!skipCache && this.isCacheValid(this.DASHBOARD_CACHE.hiringTrends)) {
        const cachedData = this.DASHBOARD_CACHE.hiringTrends!.data;
        this.logger.log('Using cached hiring trends data');
        return cachedData;
      }

      const hiringData =
        await this.dashboardRepository.getHistoricalHiringData();
      const result = this.processHiringTrends(hiringData);
      
      // Update cache
      this.DASHBOARD_CACHE.hiringTrends = {
        data: result,
        timestamp: Date.now(),
      };

      const endTime = performance.now();
      this.logger.log(
        `Hiring trends data fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching hiring trends: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch hiring trends data',
      );
    }
  }

  /**
   * Get recruitment funnel data
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Array of recruitment funnel stages
   */
  async getRecruitmentFunnel(skipCache = false): Promise<RecruitmentFunnelItemDto[]> {
    try {
      this.logger.log(`Fetching recruitment funnel data, skipCache: ${skipCache}`);
      const startTime = performance.now();
      
      // Check cache first if not skipping
      if (!skipCache && this.isCacheValid(this.DASHBOARD_CACHE.recruitmentFunnel)) {
        const cachedData = this.DASHBOARD_CACHE.recruitmentFunnel!.data;
        this.logger.log('Using cached recruitment funnel data');
        return cachedData;
      }

      const activeApplications =
        await this.dashboardRepository.getActiveApplications();
      const result = this.processRecruitmentFunnel(activeApplications);
      
      // Update cache
      this.DASHBOARD_CACHE.recruitmentFunnel = {
        data: result,
        timestamp: Date.now(),
      };

      const endTime = performance.now();
      this.logger.log(
        `Recruitment funnel data fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching recruitment funnel: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch recruitment funnel data',
      );
    }
  }

  /**
   * Get department hiring progress data
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Array of department hiring progress
   */
  async getDepartmentHiring(skipCache = false): Promise<DepartmentHiringDto[]> {
    try {
      this.logger.log(`Fetching department hiring data, skipCache: ${skipCache}`);
      const startTime = performance.now();
      
      // Check cache first if not skipping
      if (!skipCache && this.isCacheValid(this.DASHBOARD_CACHE.departmentHiring)) {
        const cachedData = this.DASHBOARD_CACHE.departmentHiring!.data;
        this.logger.log('Using cached department hiring data');
        return cachedData;
      }

      const [departmentMetrics, hiringGoals] = await Promise.all([
        this.dashboardRepository.getDepartmentMetrics(),
        this.dashboardRepository.getDepartmentHiringGoals(),
      ]);
      const result = this.processDepartmentHiring(
        departmentMetrics,
        hiringGoals,
      );
      
      // Update cache
      this.DASHBOARD_CACHE.departmentHiring = {
        data: result,
        timestamp: Date.now(),
      };

      const endTime = performance.now();
      this.logger.log(
        `Department hiring data fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching department hiring: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch department hiring data',
      );
    }
  }

  /**
   * Process time-to-hire metrics from raw data
   */
  private processTimeToHireMetrics(timeToHireData: any[]): TimeToHireMetricDto {
    if (!timeToHireData.length) {
      return {
        avgDaysToHire: 0,
        fastestHire: 0,
        slowestHire: 0,
      };
    }

    // Calculate days to hire for each application
    const daysToHire = timeToHireData.map((app) => {
      const createdAt = new Date(app.createdAt);
      const hireDate = new Date(app.hireDate);
      return Math.floor(
        (hireDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
    });

    // Calculate metrics
    const avgDaysToHire = Math.round(
      daysToHire.reduce((sum, days) => sum + days, 0) / daysToHire.length,
    );
    const fastestHire = Math.min(...daysToHire);
    const slowestHire = Math.max(...daysToHire);

    return {
      avgDaysToHire,
      fastestHire,
      slowestHire,
    };
  }

  /**
   * Process department metrics from raw data
   */
  private processDepartmentMetrics(departments: any[]): DepartmentMetricDto[] {
    return departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept._count.employees,
      openPositions: dept._count.jobs,
      turnoverRate: this.calculateTurnoverRate(dept.id), // This would need more data
      avgTimeToHire: this.calculateAvgTimeToHire(dept.id), // This would need more data
    }));
  }

  /**
   * Process hiring trends from raw application data
   */
  private processHiringTrends(applications: any[]): HiringTrendDto[] {
    // Group by month and count different statuses
    const monthlyData = {};

    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push({ key: monthKey, name: monthName });

      // Initialize data for this month
      monthlyData[monthKey] = {
        name: monthName,
        applications: 0,
        interviews: 0,
        offers: 0,
        hires: 0,
      };
    }

    // Count applications by status for each month
    applications.forEach((app) => {
      const date = new Date(app.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].applications++;

        if (app.status === 'INTERVIEWING') {
          monthlyData[monthKey].interviews++;
        } else if (app.status === 'OFFER') {
          monthlyData[monthKey].offers++;
        } else if (app.status === 'HIRED') {
          monthlyData[monthKey].hires++;
        }
      }
    });

    // Convert to array sorted by month
    return months.map((month) => monthlyData[month.key]);
  }

  /**
   * Process recruitment funnel data from applications
   */
  private processRecruitmentFunnel(
    applications: any[],
  ): RecruitmentFunnelItemDto[] {
    // Count applications in each stage
    const statusCounts = {
      Applied: 0,
      Screening: 0,
      Interviewing: 0,
      Offer: 0,
      Hired: 0,
    };

    applications.forEach((app) => {
      const status =
        app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase();
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });

    // Define colors for each stage
    const colors = {
      Applied: '#8884d8',
      Screening: '#83a6ed',
      Interviewing: '#8dd1e1',
      Offer: '#82ca9d',
      Hired: '#a4de6c',
    };

    // Convert to required format
    return Object.keys(statusCounts).map((status) => ({
      name: status,
      value: statusCounts[status],
      color: colors[status],
    }));
  }

  /**
   * Process department hiring progress data
   */
  private processDepartmentHiring(
    departments: any[],
    hiringGoals: any[],
  ): DepartmentHiringDto[] {
    return departments.map((dept) => {
      // Find hiring goal for this department
      const goal = hiringGoals.find((g) => g.departmentId === dept.id);

      return {
        name: dept.name,
        current: dept._count.employees,
        target: goal ? goal.targetHeadcount : dept._count.employees,
        hired: dept._count.employees - (goal ? goal.startingHeadcount || 0 : 0),
      };
    });
  }

  /**
   * Process active candidates data
   */
  private processActiveCandidates(applications: any[]): ActiveCandidateDto[] {
    return applications.map((app) => {
      const nextInterview =
        app.interviews && app.interviews.length > 0
          ? app.interviews[0].scheduledDate
          : null;

      const recruiters = app.recruiters?.map((r) => r.recruiter.name) || [];

      return {
        id: app.id,
        name: app.candidate?.name || 'Unknown',
        role: app.job?.title || 'Unknown Position',
        department: app.job?.department?.name || 'Unassigned',
        status: app.status,
        progress: this.calculateApplicationProgress(app.status),
        nextInterview,
        recruiters,
      };
    });
  }

  /**
   * Process job requisitions data
   */
  private processJobRequisitions(jobs: any[]): JobRequisitionDto[] {
    return jobs.map((job) => ({
      id: job.id,
      title: job.title,
      department: job.department?.name || 'Unassigned',
      openPositions: job.openPositions || 1,
      applicationsCount: job.applications?.length || 0,
      status: job.status,
      priority: job.priority || 'MEDIUM',
      createdAt: job.createdAt,
    }));
  }

  /**
   * Calculate application progress percentage based on status
   */
  private calculateApplicationProgress(status: string): number {
    const progressMap = {
      APPLIED: 20,
      SCREENING: 40,
      INTERVIEWING: 60,
      OFFER: 80,
      HIRED: 100,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    return progressMap[status] || 0;
  }

  /**
   * Calculate turnover rate for a department
   * This is a placeholder that would need actual employee history data
   */
  private calculateTurnoverRate(departmentId: number): number {
    // Placeholder implementation
    // In a real implementation, we would calculate:
    // (employees who left during period) / (average # of employees during period) * 100
    return Math.random() * 10; // Random value between 0-10%
  }

  /**
   * Calculate average time to hire for a department
   * This is a placeholder that would need actual hiring data
   */
  private calculateAvgTimeToHire(departmentId: number): number {
    // Placeholder implementation
    // In a real implementation, we would calculate average days from job posting to hire
    return Math.floor(Math.random() * 30) + 15; // Random value between 15-45 days
  }

  /**
   * Get active candidates with optional department filtering
   * @param departmentId Optional department ID to filter by
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Array of active candidates
   */
  async getActiveCandidates(
    departmentId?: number,
    skipCache = false,
  ): Promise<ActiveCandidateDto[]> {
    try {
      const cacheKey = departmentId?.toString() || 'all';
      this.logger.log(
        `Fetching active candidates ${departmentId ? `for department ${departmentId}` : ''}, skipCache: ${skipCache}`,
      );
      const startTime = performance.now();

      // Check cache first if not skipping
      if (!skipCache && this.DASHBOARD_CACHE.activeCandidates.has(cacheKey)) {
        const cacheItem = this.DASHBOARD_CACHE.activeCandidates.get(cacheKey)!;

        if (this.isCacheValid(cacheItem)) {
          this.logger.log(`Using cached active candidates for ${cacheKey}`);
          return cacheItem.data;
        }
      }

      const filter = departmentId ? { job: { departmentId } } : {};

      const activeApplications =
        await this.dashboardRepository.getActiveApplications(filter);
      const result = this.processActiveCandidates(activeApplications);

      // Update cache
      this.DASHBOARD_CACHE.activeCandidates.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      const endTime = performance.now();
      this.logger.log(
        `Active candidates fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching active candidates: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch active candidates',
      );
    }
  }

  /**
   * Get job requisitions with optional department filtering
   * @param departmentId Optional department ID to filter by
   * @param skipCache Whether to skip the cache and force fresh data
   * @returns Array of job requisitions
   */
  async getJobRequisitions(
    departmentId?: number,
    skipCache = false,
  ): Promise<JobRequisitionDto[]> {
    try {
      const cacheKey = departmentId?.toString() || 'all';
      this.logger.log(
        `Fetching job requisitions ${departmentId ? `for department ${departmentId}` : ''}, skipCache: ${skipCache}`,
      );
      const startTime = performance.now();

      // Check cache first if not skipping
      if (!skipCache && this.DASHBOARD_CACHE.jobRequisitions.has(cacheKey)) {
        const cacheItem = this.DASHBOARD_CACHE.jobRequisitions.get(cacheKey)!;

        if (this.isCacheValid(cacheItem)) {
          this.logger.log(`Using cached job requisitions for ${cacheKey}`);
          return cacheItem.data;
        }
      }

      const filter = departmentId ? { departmentId } : {};

      const jobRequisitions =
        await this.dashboardRepository.getJobRequisitions(filter);
      const result = this.processJobRequisitions(jobRequisitions);

      // Update cache
      this.DASHBOARD_CACHE.jobRequisitions.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      const endTime = performance.now();
      this.logger.log(
        `Job requisitions fetched in ${Math.round(endTime - startTime)}ms`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching job requisitions: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch job requisitions',
      );
    }
  }

  /**
   * Clear all dashboard caches
   * Use this when data is updated that would affect dashboard data
   */
  clearAllCaches(): void {
    this.logger.log('Clearing all dashboard caches');

    // Clear all caches
    this.DASHBOARD_CACHE.dashboardData = undefined;
    this.DASHBOARD_CACHE.departmentMetrics = undefined;
    this.DASHBOARD_CACHE.timeToHireMetrics = undefined;
    this.DASHBOARD_CACHE.hiringTrends = undefined;
    this.DASHBOARD_CACHE.recruitmentFunnel = undefined;
    this.DASHBOARD_CACHE.departmentHiring = undefined;
    this.DASHBOARD_CACHE.activeCandidates.clear();
    this.DASHBOARD_CACHE.jobRequisitions.clear();

    this.logger.log('All dashboard caches cleared');
  }
}
