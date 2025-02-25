import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.job.findMany({
      include: {
        postedBy: true,
      },
    });
  }

  async create(data: {
    title: string;
    description: string;
    postedById: number;
  }) {
    return this.prisma.job.create({
      data,
    });
  }

  async getJobs({
    page,
    limit,
    category,
    location,
  }: {
    page: number;
    limit: number;
    category?: string;
    location?: string;
  }) {
    const skip = (page - 1) * Number(limit);

    const where: any = {};

    if (category) where.category = category;
    if (location) where.location = location;

    const jobs = await this.prisma.job.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: { id: true, name: true, email: true }, // Only return necessary fields
        },
      },
    });

    const total = await this.prisma.job.count({ where });

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
