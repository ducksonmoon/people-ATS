import {
  Controller,
  Get,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  Logger,
  Query,
  Optional,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { RecruiterService } from './recruiter.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { HRService } from '../hr/hr.service';

// Import types from the service - these will be exported from the service file
import type {
  RecruiterDashboardData,
  ApplicationWithDetails,
} from './recruiter.types';

/**
 * Controller handling recruiter-related operations
 */
@Controller('recruiter')
export class RecruiterController {
  private readonly logger = new Logger(RecruiterController.name);

  constructor(
    private readonly recruiterService: RecruiterService,
    private readonly hrService: HRService,
  ) {}

  /**
   * Get job applications for the authenticated recruiter
   * @param req The request object containing the authenticated user
   * @returns List of applications assigned to the recruiter
   */
  @Get('job-applications')
  @UseGuards(JwtAuthGuard)
  async getApplicationsForJobs(
    @Request() req,
  ): Promise<ApplicationWithDetails[]> {
    try {
      return await this.recruiterService.getApplicationsByRecruiter(
        req.user.userId,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get job applications: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to retrieve job applications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get dashboard data for the authenticated recruiter
   * @param req The request object containing the authenticated user
   * @param skipCache Whether to skip cache and fetch fresh data
   * @returns Dashboard data specific to the recruiter
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER, Role.ADMIN)
  async getDashboardData(
    @Request() req,
    @Query('skipCache') @Optional() skipCache?: string,
  ): Promise<RecruiterDashboardData> {
    try {
      const shouldSkipCache = skipCache === 'true';
      this.logger.log(
        `Dashboard data requested, skipCache: ${shouldSkipCache}`,
      );
      return await this.recruiterService.getRecruiterDashboardData(
        req.user.userId,
        shouldSkipCache,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get dashboard data: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to retrieve dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get HR dashboard data adapted for the recruiter view
   * @param req The request object containing the authenticated user
   * @param skipCache Whether to skip cache and fetch fresh data
   * @returns HR data adapted to the recruiter dashboard format
   */
  @Get('hr-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RECRUITER, Role.ADMIN, Role.HR)
  async getHRDashboardData(
    @Request() req,
    @Query('skipCache') @Optional() skipCache?: string,
  ): Promise<RecruiterDashboardData> {
    try {
      const shouldSkipCache = skipCache === 'true';
      this.logger.log(
        `HR dashboard data requested, skipCache: ${shouldSkipCache}`,
      );
      const hrData = await this.hrService.getHRDashboardData(shouldSkipCache);
      return await this.recruiterService.adaptHRDataToRecruiterFormat(
        hrData,
        req.user.userId,
        shouldSkipCache,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get HR dashboard data: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Failed to retrieve HR dashboard data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
