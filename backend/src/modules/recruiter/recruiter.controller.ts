import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecruiterService } from './recruiter.service';

@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly recruiterService: RecruiterService) {}

  @UseGuards(JwtAuthGuard)
  @Get('job-applications')
  async getApplicationsForJobs(@Request() req) {
    return this.recruiterService.getApplicationsByRecruiter(req.user.id);
  }
}
