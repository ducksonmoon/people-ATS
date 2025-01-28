import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendedJobs(userId: number) {
    const userApplications = await this.prisma.application.findMany({
      where: { candidateId: userId },
      include: { job: true },
    });

    const appliedCategories = userApplications.map(
      (application) => application.job,
    );

    return this.prisma.job.findMany({
      where: {
        Application: {
          none: { candidateId: userId },
        },
      },
    });
  }
}
