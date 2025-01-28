import { Controller, Get, Param } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('jobs/:userId')
  async getRecommendedJobs(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendedJobs(parseInt(userId));
  }
}
