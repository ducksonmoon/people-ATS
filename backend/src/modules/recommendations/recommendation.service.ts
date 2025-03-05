import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendedJobs(userId: number) {
    // Get user's applications to exclude jobs they've already applied to
    const userApplications = await this.prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: {
          include: {
            category: true,
          },
        },
      },
    });

    // Gather categories the user has shown interest in
    const appliedCategoryIds = [
      ...new Set(
        userApplications
          .filter((app) => app.job.category)
          .map((app) => app.job.categoryId)
          .filter(Boolean), // Filter out null/undefined values
      ),
    ];

    // Find jobs matching user's interests that they haven't applied to
    const recommendations = await this.prisma.job.findMany({
      where: {
        AND: [
          // Only active jobs
          { status: 'OPEN' },
          // Jobs in categories the user has applied to before or any category if user has no preferences
          appliedCategoryIds.length > 0
            ? { categoryId: { in: appliedCategoryIds } }
            : {},
          // Jobs the user hasn't applied to yet
          {
            applications: {
              none: { candidateId: userId },
            },
          },
        ],
      },
      include: {
        category: true,
        location: true,
        department: true,
        applications: {
          take: 1, // Just to check if there are applications
          select: { id: true },
        },
      },
      take: 5, // Limit to 5 recommendations
    });

    // If we didn't find any recommendations based on categories, return most recent jobs
    if (recommendations.length === 0) {
      return this.prisma.job.findMany({
        where: {
          status: 'OPEN',
          applications: {
            none: { candidateId: userId },
          },
        },
        include: {
          category: true,
          location: true,
          department: true,
          applications: {
            take: 1,
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }

    return recommendations;
  }
}
