import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApplicationsService } from '../applications/applications.service';

@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('job-applications')
  async getApplicationsForJobs(@Request() req) {
    return this.applicationsService.getApplicationsByRecruiter(req.user.id);
  }
}
