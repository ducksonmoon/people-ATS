import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Public } from '../auth/public.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobService: JobsService) {}

  @Public()
  @Get()
  async getJobs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.jobService.getJobs({ page, limit, category, location });
  }

  @Post()
  async createJob(
    @Body() body: { title: string; description: string; postedById: number },
  ) {
    return this.jobService.create(body);
  }
}
