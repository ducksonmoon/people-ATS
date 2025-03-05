import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateApplicationInput,
  UpdateApplicationStatusInput,
  ApplicationFiltersInput,
} from './dto/application.dto';

/**
 * Resolver for Application entities
 */
@Resolver(() => Application)
export class ApplicationsResolver {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * Get all applications - restricted to admin and recruiter roles
   */
  @Query(() => [Application], { description: 'Get all applications' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECRUITER')
  async getApplications(
    @Args('filters', { nullable: true }) filters?: ApplicationFiltersInput,
  ) {
    return this.applicationsService.findAll(filters);
  }

  /**
   * Get application by ID
   */
  @Query(() => Application, { description: 'Get application by ID' })
  @UseGuards(JwtAuthGuard)
  async getApplication(@Args('id', { type: () => Int }) id: number) {
    return this.applicationsService.findOne(id);
  }

  /**
   * Create a new application
   */
  @Mutation(() => Application, { description: 'Create a new application' })
  @UseGuards(JwtAuthGuard)
  async createApplication(@Args('input') input: CreateApplicationInput) {
    return this.applicationsService.create({
      candidateId: input.candidateId,
      jobId: input.jobId,
      status: input.status,
      resumePath: input.resumePath,
    });
  }

  /**
   * Update application status
   */
  @Mutation(() => Application, { description: 'Update application status' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  async updateApplicationStatus(
    @Args('applicationId', { type: () => Int }) applicationId: number,
    @Args('input') input: UpdateApplicationStatusInput,
  ) {
    return this.applicationsService.updateStatus(applicationId, {
      status: input.status,
      note: input.note,
    });
  }
}
