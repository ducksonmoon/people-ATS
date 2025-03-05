import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Application, Job, User } from '@prisma/client';

/**
 * Interface for application filters
 */
interface ApplicationFilters {
  status?: string;
  jobId?: number;
  minDate?: Date;
  maxDate?: Date;
}

/**
 * Interface for creating an application
 */
interface CreateApplicationDto {
  jobId: number;
  applicantId?: number;
  resumePath?: string;
  coverLetter?: string;
  note?: string;
  status?: string;
  name?: string;
  email?: string;
  phone?: string;
  source?: string;
}

/**
 * Interface for application status update
 */
interface UpdateApplicationStatusDto {
  status: string;
  note?: string;
}

/**
 * Service for managing job applications
 */
@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Find all applications with optional filters
   */
  async findAll(filters?: ApplicationFilters): Promise<Application[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters?.minDate || filters?.maxDate) {
      where.createdAt = {};

      if (filters.minDate) {
        where.createdAt.gte = filters.minDate;
      }

      if (filters.maxDate) {
        where.createdAt.lte = filters.maxDate;
      }
    }

    return this.prisma.application.findMany({
      where,
      include: this.getDefaultApplicationIncludes(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find application by ID
   */
  async findOne(id: number): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: this.getDefaultApplicationIncludes(),
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Legacy method - redirects to new implementation
   * @deprecated Use createApplication instead
   */
  async create(data: {
    candidateId: number;
    jobId: number;
    status?: string;
    resumePath?: string;
  }): Promise<Application> {
    this.logger.warn(
      'Deprecated method "create" called. Use "createApplication" instead',
    );
    return this.createApplication({
      jobId: data.jobId,
      applicantId: data.candidateId,
      resumePath: data.resumePath,
      status: data.status,
    });
  }

  /**
   * Update application status
   */
  async updateStatus(
    applicationId: number,
    updateDto: UpdateApplicationStatusDto,
  ): Promise<Application> {
    const application = await this.findApplicationById(applicationId);

    const updatedApplication = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: updateDto.status,
        note: updateDto.note || application.note,
      },
      include: this.getDefaultApplicationIncludes(),
    });

    // Notify relevant parties
    this.notificationsGateway.sendNotification('applicationStatusUpdated', {
      applicationId,
      status: updateDto.status,
      previousStatus: application.status,
    });

    return updatedApplication;
  }

  /**
   * Get applications by candidate ID
   */
  async getApplicationsByCandidate(
    candidateId: number,
  ): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          include: {
            category: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get applications by job ID
   */
  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create a new application
   */
  async createApplication(dto: CreateApplicationDto): Promise<Application> {
    this.validateCreateApplicationInput(dto);

    const job = await this.findJobById(dto.jobId);
    const applicantId = await this.ensureApplicantExists(dto);

    // Create application
    const application = await this.prisma.application.create({
      data: {
        job: {
          connect: {
            id: dto.jobId,
          },
        },
        candidate: {
          connect: {
            id: applicantId,
          },
        },
        status: dto.status || 'PENDING',
        resumePath: dto.resumePath,
        coverLetter: dto.coverLetter,
        note: dto.note,
        source: dto.source,
      },
      include: {
        candidate: true,
        job: {
          include: {
            department: true,
            category: true,
            location: true,
          },
        },
      },
    });

    // Notify recruiters of new application
    const recruiterIds = job.recruiters.map((jr) => jr.recruiterId);
    this.notificationsGateway.sendNotification('newApplication', {
      jobId: dto.jobId,
      candidateId: applicantId,
      applicationId: application.id,
      recruiterIds,
    });

    return application;
  }

  /**
   * Get application by UUID (backward compatibility)
   */
  async getApplicationByUuid(uuid: string): Promise<Application> {
    const id = this.parseApplicationIdFromUuid(uuid);
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            category: true,
            location: true,
          },
        },
        candidate: true,
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(
        `Application with ID ${id} not found. It may have been removed or you don't have access to it.`,
      );
    }

    return application;
  }

  /**
   * Count applications with optional filters
   */
  async countApplications(filters?: ApplicationFilters): Promise<number> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters?.minDate || filters?.maxDate) {
      where.createdAt = {};

      if (filters.minDate) {
        where.createdAt.gte = filters.minDate;
      }

      if (filters.maxDate) {
        where.createdAt.lte = filters.maxDate;
      }
    }

    return this.prisma.application.count({ where });
  }

  /**
   * Apply with resume (convenience method)
   * @deprecated Use createApplication instead
   */
  async applyWithResume(data: {
    candidateId: number;
    jobId: number;
    resumePath: string;
  }): Promise<Application> {
    this.logger.warn(
      'Deprecated method "applyWithResume" called. Use "createApplication" instead',
    );
    return this.createApplication({
      jobId: data.jobId,
      applicantId: data.candidateId,
      resumePath: data.resumePath,
    });
  }

  /**
   * Helper method to get default includes for application queries
   * @private
   */
  private getDefaultApplicationIncludes() {
    return {
      candidate: true,
      job: {
        include: {
          category: true,
          location: true,
        },
      },
    };
  }

  /**
   * Helper method to find application by ID, throwing exception if not found
   * @private
   */
  private async findApplicationById(id: number): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    return application;
  }

  /**
   * Helper method to find job by ID, throwing exception if not found
   * @private
   */
  private async findJobById(
    jobId: number,
  ): Promise<Job & { recruiters: any[] }> {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });

    if (!job) {
      throw new BadRequestException(`Job with ID ${jobId} not found`);
    }

    return job;
  }

  /**
   * Helper method to validate input for creating an application
   * @private
   */
  private validateCreateApplicationInput(dto: CreateApplicationDto): void {
    if (!dto.jobId) {
      throw new BadRequestException('Job ID is required');
    }

    if (!dto.applicantId && (!dto.name || !dto.email)) {
      throw new BadRequestException(
        'Either applicantId or guest information (name and email) is required',
      );
    }
  }

  /**
   * Helper method to ensure applicant exists, creating a guest account if needed
   * @private
   */
  private async ensureApplicantExists(
    dto: CreateApplicationDto,
  ): Promise<number> {
    // For guest applications (no applicantId but has name/email)
    if (!dto.applicantId && dto.name && dto.email) {
      // Create a guest candidate record if needed
      const candidate =
        (await this.prisma.user.findFirst({
          where: { email: dto.email },
        })) ||
        (await this.prisma.user.create({
          data: {
            name: dto.name,
            email: dto.email,
            password: '', // Temp empty password
            role: 'CANDIDATE',
          },
        }));

      return candidate.id;
    }

    if (!dto.applicantId) {
      throw new BadRequestException(
        'Applicant ID or guest information (name/email) is required',
      );
    }

    // Check if candidate exists
    const candidate = await this.prisma.user.findUnique({
      where: { id: dto.applicantId },
    });

    if (!candidate) {
      throw new BadRequestException(
        `Candidate with ID ${dto.applicantId} not found`,
      );
    }

    return dto.applicantId;
  }

  /**
   * Helper method to parse application ID from UUID
   * @private
   */
  private parseApplicationIdFromUuid(uuid: string): number {
    let id: number;

    try {
      // Try parsing as a number first (new format)
      id = parseInt(uuid, 10);

      // If it's not a valid number or doesn't match our expected format
      if (isNaN(id) || id <= 0) {
        throw new NotFoundException(
          `Invalid application identifier ${uuid}. Please use a valid application ID.`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(
        `Application with identifier ${uuid} not found. The format may be invalid.`,
      );
    }

    return id;
  }
}
