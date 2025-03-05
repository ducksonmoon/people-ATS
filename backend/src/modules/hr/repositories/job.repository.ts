import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Job, Prisma } from '@prisma/client';
import { CreateJobDto, UpdateJobDto, JobFilterDto } from '../dtos/job.dto';

@Injectable()
export class JobRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateJobDto, userId: number): Promise<Job> {
    const { categoryId, locationId, departmentId, ...rest } = data;

    return this.prisma.job.create({
      data: {
        ...rest,
        postedBy: { connect: { id: userId } },
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        location: locationId ? { connect: { id: locationId } } : undefined,
        department: departmentId
          ? { connect: { id: departmentId } }
          : undefined,
      },
      include: {
        category: true,
        location: true,
        department: true,
      },
    });
  }

  async update(id: number, data: UpdateJobDto): Promise<Job> {
    return this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        location: true,
        department: true,
      },
    });
  }

  async delete(id: number): Promise<Job> {
    return this.prisma.job.delete({
      where: { id },
    });
  }

  async findById(id: number): Promise<Job> {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        department: true,
        applications: true,
      },
    });
  }

  async findAll(filters?: JobFilterDto): Promise<Job[]> {
    const where: Prisma.JobWhereInput = {};

    if (filters) {
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.departmentId) {
        where.departmentId = filters.departmentId;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.locationId) {
        where.locationId = filters.locationId;
      }
    }

    return this.prisma.job.findMany({
      where,
      include: {
        category: true,
        location: true,
        department: true,
        applications: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteApplicationsByJobId(jobId: number): Promise<number> {
    const result = await this.prisma.application.deleteMany({
      where: { jobId },
    });

    return result.count;
  }

  /**
   * Count the number of applications for a specific job
   * @param jobId The ID of the job
   * @returns Number of applications
   */
  async countApplicationsByJobId(jobId: number): Promise<number> {
    return this.prisma.application.count({
      where: { jobId },
    });
  }
}
