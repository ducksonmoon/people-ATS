import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  JobQueryDto,
  CreateJobDto,
  CreateCategoryDto,
  CreateLocationDto,
} from './dto';

@Controller('jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(private readonly jobService: JobsService) {}

  @Public()
  @Get()
  async getJobs(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    queryDto: JobQueryDto,
  ) {
    this.logger.log(
      `Fetching jobs with query params: ${JSON.stringify(queryDto)}`,
    );

    try {
      const result = await this.jobService.getJobs(queryDto);
      this.logger.debug(
        `Found ${result.data.length} jobs out of ${result.meta.total}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch jobs: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECRUITER')
  async createJob(@Body(ValidationPipe) createJobDto: CreateJobDto) {
    this.logger.log(`Creating new job: ${createJobDto.title}`);

    try {
      const result = await this.jobService.create(createJobDto);
      this.logger.debug(`Job created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create job: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Public()
  @Get('categories')
  async getCategories() {
    this.logger.log('Fetching all job categories');

    try {
      const categories = await this.jobService.getCategories();
      this.logger.debug(`Found ${categories.length} categories`);
      return categories;
    } catch (error) {
      this.logger.error(
        `Failed to fetch categories: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Public()
  @Get('locations')
  async getLocations() {
    this.logger.log('Fetching all job locations');

    try {
      const locations = await this.jobService.getLocations();
      this.logger.debug(`Found ${locations.length} locations`);
      return locations;
    } catch (error) {
      this.logger.error(
        `Failed to fetch locations: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECRUITER')
  async createCategory(@Body(ValidationPipe) categoryDto: CreateCategoryDto) {
    this.logger.log(`Creating new category: ${categoryDto.name}`);

    try {
      const result = await this.jobService.createCategory(categoryDto.name);
      this.logger.debug(`Category created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Post('locations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECRUITER')
  async createLocation(@Body(ValidationPipe) locationDto: CreateLocationDto) {
    this.logger.log(`Creating new location: ${locationDto.name}`);

    try {
      const result = await this.jobService.createLocation(locationDto.name);
      this.logger.debug(`Location created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create location: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @Public()
  @Get(':id')
  async getJobById(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching job details for ID: ${id}`);

    try {
      const job = await this.jobService.getJobById(id);

      if (!job) {
        throw new BadRequestException(`Job with ID ${id} not found`);
      }

      return job;
    } catch (error) {
      this.logger.error(
        `Failed to fetch job ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECRUITER')
  @Get(':id/stats')
  async getJobWithStats(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Fetching job stats for ID: ${id}`);

    try {
      const jobStats = await this.jobService.getJobWithApplicationStats(id);

      if (!jobStats) {
        throw new BadRequestException(`Job with ID ${id} not found`);
      }

      return jobStats;
    } catch (error) {
      this.logger.error(
        `Failed to fetch job stats for ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
