import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Resolver(() => Application)
export class ApplicationsResolver {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Query(() => [Application])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECRUITER')
  async getApplications() {
    return this.applicationsService.findAll();
  }

  @Mutation(() => Application)
  @UseGuards(JwtAuthGuard)
  async createApplication(
    @Args('candidateId', { type: () => Int }) candidateId: number,
    @Args('jobId', { type: () => Int }) jobId: number,
    @Args('status', { nullable: true }) status?: string,
  ) {
    return this.applicationsService.create({ candidateId, jobId, status });
  }

  @Mutation(() => Application)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE')
  async updateApplicationStatus(
    @Args('applicationId', { type: () => Int }) applicationId: number,
    @Args('status') status: string,
  ) {
    return this.applicationsService.updateStatus(applicationId, status);
  }
}
