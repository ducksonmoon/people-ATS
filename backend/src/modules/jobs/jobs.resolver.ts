import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';

@Resolver(() => Job)
export class JobsResolver {
  constructor(private readonly jobsService: JobsService) {}

  @Query(() => [Job])
  async getJobs() {
    return this.jobsService.findAll();
  }

  @Mutation(() => Job)
  async createJob(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('postedById') postedById: number,
  ) {
    return this.jobsService.create({ title, description, postedById });
  }
}
