import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from './dtos/job.dto';
import { HiringGoalDto, UpdateHiringGoalsDto } from './dtos/hiring-goal.dto';
import {
  UpdateApplicationDto,
  ApplicationCommentDto,
} from './dtos/application.dto';
import { ScheduleInterviewDto, UpdateInterviewDto } from './dtos/interview.dto';
import { DashboardService } from './services/dashboard.service';
import { DashboardDataDto } from './dtos/dashboard.dto';

// Import specialized services
import {
  JobService,
  ApplicationService,
  InterviewService,
  HiringGoalService,
  AnalyticsService,
} from './services';

// Import types for controller return values
import { Department } from '@prisma/client';

/**
 * Controller handling all HR-related operations including job management,
 * hiring goals, applications, and interviews
 */
@ApiTags('HR')
@ApiBearerAuth()
@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.HR, Role.ADMIN)
export class HRController {
  constructor(
    private readonly jobService: JobService,
    private readonly applicationService: ApplicationService,
    private readonly interviewService: InterviewService,
    private readonly hiringGoalService: HiringGoalService,
    private readonly analyticsService: AnalyticsService,
    private readonly dashboardService: DashboardService,
  ) {}

  /**
   * Retrieves HR dashboard data
   */
  @Get('dashboard')
  @ApiOperation({ summary: 'Get HR dashboard data' })
  @ApiResponse({ status: 200, description: 'Returns HR dashboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires HR or ADMIN role',
  })
  async getDashboardData(
    @Query('skipCache') skipCache?: string,
  ): Promise<DashboardDataDto> {
    const shouldSkipCache = skipCache === 'true';
    console.log(
      `[DEBUG CONTROLLER] Dashboard data requested, skipCache: ${shouldSkipCache}`,
    );
    return this.dashboardService.getDashboardData(shouldSkipCache);
  }

  /**
   * Get active candidates with optional department filtering
   */
  @Get('dashboard/candidates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  async getActiveCandidates(
    @Query('departmentId') departmentId?: number,
    @Query('skipCache') skipCache?: string,
  ) {
    const shouldSkipCache = skipCache === 'true';
    console.log(
      `[DEBUG CONTROLLER] Active candidates requested, skipCache: ${shouldSkipCache}`,
    );
    return this.dashboardService.getActiveCandidates(
      departmentId ? +departmentId : undefined,
      shouldSkipCache,
    );
  }

  /**
   * Get job requisitions with optional department filtering
   */
  @Get('dashboard/jobs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  async getJobRequisitions(
    @Query('departmentId') departmentId?: number,
    @Query('skipCache') skipCache?: string,
  ) {
    const shouldSkipCache = skipCache === 'true';
    console.log(
      `[DEBUG CONTROLLER] Job requisitions requested, skipCache: ${shouldSkipCache}`,
    );
    return this.dashboardService.getJobRequisitions(
      departmentId ? +departmentId : undefined,
      shouldSkipCache,
    );
  }

  /**
   * Get department metrics
   */
  @Get('dashboard/department-metrics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HR, Role.ADMIN)
  async getDepartmentMetricsData(
    @Query('skipCache') skipCache?: string,
  ): Promise<any> {
    try {
      console.log('[DEBUG CONTROLLER] HR dashboard endpoint called');
      const shouldSkipCache = skipCache === 'true';
      console.log(`[DEBUG CONTROLLER] Skip cache: ${shouldSkipCache}`);
      const dashboardData =
        await this.analyticsService.getHRDashboardData(shouldSkipCache);

      console.log(
        '[DEBUG CONTROLLER] HR dashboard data retrieved successfully',
        {
          dataPresent: !!dashboardData,
          dataType: typeof dashboardData,
          dataKeys: dashboardData ? Object.keys(dashboardData) : [],
          hiringTrendsDataCount: dashboardData?.hiringTrendsData?.length || 0,
          recruitmentFunnelDataCount:
            dashboardData?.recruitmentFunnelData?.length || 0,
          departmentHiringDataCount:
            dashboardData?.departmentHiringData?.length || 0,
          activeCandidatesCount: dashboardData?.activeCandidates?.length || 0,
          jobRequisitionsCount: dashboardData?.jobRequisitions?.length || 0,
        },
      );

      return dashboardData;
    } catch (error) {
      console.error(
        '[DEBUG CONTROLLER] Error retrieving dashboard data:',
        error,
      );
      throw new HttpException(
        error.message || 'Failed to retrieve dashboard data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // JOB MANAGEMENT ENDPOINTS

  /**
   * Creates a new job requisition
   */
  @Post('jobs')
  @ApiOperation({ summary: 'Create job requisition' })
  @ApiResponse({
    status: 201,
    description: 'Job requisition created successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createJobRequisition(@Body() data: CreateJobDto, @Request() req) {
    try {
      return await this.jobService.createJobRequisition(data, req.user.userId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create job requisition',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Updates an existing job requisition
   */
  @Put('jobs/:id')
  @ApiOperation({ summary: 'Update job requisition' })
  @ApiResponse({
    status: 200,
    description: 'Job requisition updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async updateJobRequisition(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateJobDto,
    @Request() req,
  ) {
    try {
      return await this.jobService.updateJobRequisition(
        id,
        data,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update job requisition',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Deletes a job requisition
   */
  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Delete job requisition' })
  @ApiResponse({
    status: 200,
    description: 'Job requisition deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async deleteJobRequisition(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.jobService.deleteJobRequisition(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete job requisition',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves a job requisition by ID
   */
  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get job requisition by ID' })
  @ApiResponse({ status: 200, description: 'Returns the job requisition' })
  @ApiResponse({ status: 404, description: 'Job requisition not found' })
  async getJobRequisition(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.jobService.getJobRequisition(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve job requisition',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // DEPARTMENT METRICS AND ANALYTICS

  /**
   * Retrieves department metrics
   */
  @Get('departments/metrics')
  @ApiOperation({ summary: 'Get department metrics' })
  @ApiResponse({ status: 200, description: 'Returns department metrics' })
  async getDepartmentMetrics(
    @Query('skipCache') skipCache?: string,
  ): Promise<any> {
    try {
      const shouldSkipCache = skipCache === 'true';
      console.log(
        `[DEBUG CONTROLLER] Department metrics requested, skipCache: ${shouldSkipCache}`,
      );
      return await this.analyticsService.getDepartmentMetrics(shouldSkipCache);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve department metrics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // HIRING GOALS ENDPOINTS

  /**
   * Retrieves current hiring goals
   */
  @Get('hiring-goals')
  @ApiOperation({ summary: 'Get current hiring goals' })
  @ApiResponse({ status: 200, description: 'Returns current hiring goals' })
  async getHiringGoals(): Promise<any> {
    try {
      return await this.hiringGoalService.getHiringGoals();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve hiring goals',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Updates hiring goals
   */
  @Put('hiring-goals')
  @ApiOperation({ summary: 'Update hiring goals' })
  @ApiResponse({
    status: 200,
    description: 'Hiring goals updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateHiringGoals(
    @Body() data: UpdateHiringGoalsDto | HiringGoalDto[],
    @Request() req,
  ) {
    try {
      // Check if this is department data rather than hiring goal data
      if (
        Array.isArray(data) &&
        data.length > 0 &&
        'name' in data[0] &&
        !('departmentId' in data[0])
      ) {
        // Get departments to map names to IDs
        const departments = await this.analyticsService.getDepartmentsByNames(
          data.map((item: any) => item.name),
        );

        // Map to proper hiring goals format
        const hiringGoals = data
          .map((dept: any) => {
            const matchedDept = departments.find((d) => d.name === dept.name);
            if (!matchedDept) return null;

            return {
              departmentId: matchedDept.id,
              targetHeadcount: dept.targetHeadcount || 0,
              startDate: new Date(),
              endDate: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              ),
            };
          })
          .filter(Boolean);

        if (hiringGoals.length === 0) {
          return {
            success: false,
            message: 'Could not match department names to IDs',
            data: null,
          };
        }

        return await this.hiringGoalService.updateHiringGoals(
          hiringGoals,
          req.user.userId,
        );
      }

      // Handle data as regular hiring goals
      const hiringGoals = Array.isArray(data) ? data : data.data;
      return await this.hiringGoalService.updateHiringGoals(
        hiringGoals,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update hiring goals',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves hiring statistics
   */
  @Get('hiring-statistics')
  @ApiOperation({ summary: 'Get hiring statistics' })
  @ApiResponse({ status: 200, description: 'Returns hiring statistics' })
  async getHiringStatistics(
    @Query('skipCache') skipCache?: string,
  ): Promise<any> {
    try {
      const shouldSkipCache = skipCache === 'true';
      console.log(
        `[DEBUG CONTROLLER] Hiring statistics requested, skipCache: ${shouldSkipCache}`,
      );
      return await this.analyticsService.getHiringStatistics(shouldSkipCache);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve hiring statistics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves historical hiring goals
   */
  @Get('historical-hiring-goals')
  @ApiOperation({ summary: 'Get historical hiring goals' })
  @ApiResponse({ status: 200, description: 'Returns historical hiring goals' })
  async getHistoricalHiringGoals(): Promise<any> {
    try {
      return await this.hiringGoalService.getHistoricalHiringGoals();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve historical hiring goals',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Archives expired hiring goals
   */
  @Post('archive-expired-hiring-goals')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Archive expired hiring goals' })
  @ApiResponse({
    status: 200,
    description: 'Expired hiring goals archived successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        count: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADMIN or HR role',
  })
  async archiveExpiredHiringGoals() {
    try {
      const result = await this.hiringGoalService.archiveExpiredHiringGoals();
      return {
        success: result.success,
        count: result.count,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to archive expired hiring goals: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves department growth plans
   */
  @Get('department-growth-plans')
  @ApiOperation({ summary: 'Get department growth plans' })
  @ApiResponse({ status: 200, description: 'Returns department growth plans' })
  async getDepartmentGrowthPlans(): Promise<any> {
    try {
      return await this.hiringGoalService.getDepartmentGrowthPlans();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve department growth plans',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // APPLICATION MANAGEMENT ENDPOINTS

  /**
   * Retrieves all applications
   */
  @Get('applications')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({ status: 200, description: 'Returns all applications' })
  async getAllApplications() {
    try {
      return await this.applicationService.getAllApplications();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve applications',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves an application by ID
   */
  @Get('applications/:id')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiResponse({ status: 200, description: 'Returns the application' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async getApplicationById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.applicationService.getApplicationById(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve application',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Updates an application status
   */
  @Put('applications/:id/status')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Update application status' })
  @ApiResponse({
    status: 200,
    description: 'Application status updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async updateApplicationStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateApplicationDto,
  ) {
    try {
      return await this.applicationService.updateApplicationStatus(
        id,
        data.status,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update application status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Adds a comment to an application
   */
  @Post('applications/:id/comments')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Add comment to application' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async addApplicationComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ApplicationCommentDto,
    @Request() req,
  ) {
    try {
      return await this.applicationService.addApplicationComment(
        id,
        data.comment,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to add application comment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // INTERVIEW MANAGEMENT ENDPOINTS

  /**
   * Schedules an interview
   */
  @Post('applications/:id/interviews')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Schedule interview' })
  @ApiResponse({ status: 201, description: 'Interview scheduled successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async scheduleInterview(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ScheduleInterviewDto,
    @Request() req,
  ) {
    try {
      return await this.interviewService.scheduleInterview(
        id,
        data,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to schedule interview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all interviews
   */
  @Get('interviews')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Get all interviews' })
  @ApiResponse({ status: 200, description: 'Returns all interviews' })
  async getAllInterviews(@Request() req) {
    try {
      return await this.interviewService.getAllInterviews(
        req.user.userId,
        req.user.role,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve interviews',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Updates an interview
   */
  @Patch('interviews/:id')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Update interview' })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  async updateInterview(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateInterviewDto,
    @Request() req,
  ) {
    try {
      return await this.interviewService.updateInterview(
        id,
        data,
        req.user.userId,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update interview',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all available interviewers (users who can conduct interviews)
   */
  @Get('interviewers')
  @Roles(Role.HR, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'Get all interviewers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all available interviewers',
  })
  async getAllInterviewers() {
    try {
      return await this.interviewService.getAllInterviewers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve interviewers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
