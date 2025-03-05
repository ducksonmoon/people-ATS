import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { JobQueryDto } from './dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.job.findMany({
      include: {
        postedBy: true,
        category: true,
        location: true,
        department: true,
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
  }

  async create(data: {
    title: string;
    description: string;
    postedById: number;
    categoryId?: number;
    locationId?: number;
    departmentId?: number;
    priority?: string;
    openPositions?: number;
  }) {
    return this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description,
        postedBy: { connect: { id: data.postedById } },
        category: data.categoryId
          ? { connect: { id: data.categoryId } }
          : undefined,
        location: data.locationId
          ? { connect: { id: data.locationId } }
          : undefined,
        department: data.departmentId
          ? { connect: { id: data.departmentId } }
          : undefined,
        priority: data.priority || 'MEDIUM',
        openPositions: data.openPositions || 1,
      },
      include: {
        postedBy: true,
        category: true,
        location: true,
        department: true,
      },
    });
  }

  /**
   * Get jobs with pagination and filtering
   */
  async getJobs(queryParams: JobQueryDto) {
    const {
      page = 1,
      limit = 10,
      categoryId,
      locationId,
      departmentId,
      search,
      employmentType,
      experienceLevel,
      minSalary,
      maxSalary,
      remote,
      postedAfter,
    } = queryParams;

    this.logger.debug(
      `Processing job query with params: ${JSON.stringify(queryParams)}`,
    );

    // Calculate pagination
    const skip = (page - 1) * Number(limit);

    // Build where clause
    const where: any = {};

    // Add exact match filters
    if (categoryId) {
      where.categoryId = categoryId;
      this.logger.debug(`Filtering by categoryId: ${categoryId}`);
    }

    if (locationId) {
      where.locationId = locationId;
      this.logger.debug(`Filtering by locationId: ${locationId}`);
    }

    if (departmentId) {
      where.departmentId = departmentId;
      this.logger.debug(`Filtering by departmentId: ${departmentId}`);
    }

    if (employmentType) {
      where.employmentType = employmentType;
      this.logger.debug(`Filtering by employmentType: ${employmentType}`);
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
      this.logger.debug(`Filtering by experienceLevel: ${experienceLevel}`);
    }

    // Add range filters
    if (minSalary !== undefined || maxSalary !== undefined) {
      where.salary = {};

      if (minSalary !== undefined) {
        where.salary.gte = minSalary;
        this.logger.debug(`Filtering by minSalary: ${minSalary}`);
      }

      if (maxSalary !== undefined) {
        where.salary.lte = maxSalary;
        this.logger.debug(`Filtering by maxSalary: ${maxSalary}`);
      }
    }

    // Boolean filters
    if (remote !== undefined) {
      where.remote = remote;
      this.logger.debug(`Filtering by remote: ${remote}`);
    }

    // Date filters
    if (postedAfter) {
      where.createdAt = {
        gte: new Date(postedAfter),
      };
      this.logger.debug(`Filtering by postedAfter: ${postedAfter}`);
    }

    // Add search functionality with improved handling
    if (search && typeof search === 'string' && search.trim()) {
      const trimmedSearch = search.trim();
      this.logger.debug(`Searching with term: "${trimmedSearch}"`);

      where.OR = [
        {
          title: {
            contains: trimmedSearch,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: trimmedSearch,
            mode: 'insensitive',
          },
        },
      ];
    }

    this.logger.debug(
      `Final Prisma query where clause: ${JSON.stringify(where)}`,
    );

    try {
      // Execute the query with proper error handling
      const [jobs, total] = await Promise.all([
        this.prisma.job.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            postedBy: {
              select: { id: true, name: true, email: true },
            },
            category: true,
            location: true,
            department: true,
            recruiters: {
              include: {
                recruiter: true,
              },
            },
          },
        }),
        this.prisma.job.count({ where }),
      ]);

      this.logger.log(`Retrieved ${jobs.length} jobs out of ${total} total`);

      return {
        data: jobs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching jobs: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCategories() {
    return this.prisma.jobCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getLocations() {
    return this.prisma.jobLocation.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string) {
    return this.prisma.jobCategory.create({
      data: { name },
    });
  }

  async createLocation(name: string) {
    return this.prisma.jobLocation.create({
      data: { name },
    });
  }

  async getJobById(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        location: true,
        department: true,
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }

  async getJobWithApplicationStats(id: number) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
        location: true,
        department: true,
        recruiters: {
          include: {
            recruiter: true,
          },
        },
        applications: true,
      },
    });

    if (!job) {
      throw new NotFoundException(
        `Job with ID ${id} not found. The job may have been removed or you don't have access to it.`,
      );
    }

    // Count applications by status
    const applicationCounts = {
      total: job.applications.length,
      pending: job.applications.filter((app) => app.status === 'PENDING')
        .length,
      reviewing: job.applications.filter((app) => app.status === 'REVIEWING')
        .length,
      interviewed: job.applications.filter(
        (app) => app.status === 'INTERVIEWED',
      ).length,
      hired: job.applications.filter((app) => app.status === 'HIRED').length,
      rejected: job.applications.filter((app) => app.status === 'REJECTED')
        .length,
    };

    return {
      ...job,
      applications: applicationCounts,
    };
  }
}
