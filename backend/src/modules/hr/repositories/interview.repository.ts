import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Interview, Prisma } from '@prisma/client';
import {
  ScheduleInterviewDto,
  UpdateInterviewDto,
  InterviewFilterDto,
  InterviewStatus,
  InterviewType,
} from '../dtos/interview.dto';

/**
 * Repository responsible for interview data operations
 */
@Injectable()
export class InterviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Schedule a new interview for an application
   * @param applicationId - The ID of the application
   * @param data - Interview scheduling data
   * @param userId - The ID of the interviewer
   * @returns Newly created interview with relations
   */
  async schedule(
    applicationId: number,
    data: ScheduleInterviewDto,
    userId: number,
  ): Promise<Interview> {
    const { scheduledAt, duration, type, location, meetingLink, notes } = data;

    return this.prisma.interview.create({
      data: {
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        type: type || InterviewType.INITIAL,
        status: InterviewStatus.SCHEDULED,
        feedback: notes || null,
        location: location || null,
        meetingLink: meetingLink || null,
        application: {
          connect: { id: applicationId },
        },
        interviewer: {
          connect: { id: userId },
        },
      },
      include: this.getFullInterviewInclude(),
    });
  }

  /**
   * Update an existing interview
   * @param id - The ID of the interview to update
   * @param data - Updated interview data
   * @returns Updated interview with relations
   */
  async update(id: number, data: UpdateInterviewDto): Promise<Interview> {
    return this.prisma.interview.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: this.getFullInterviewInclude(),
    });
  }

  /**
   * Find an interview by its ID
   * @param id - The ID of the interview
   * @returns The interview with relations or null if not found
   */
  async findById(id: number): Promise<Interview | null> {
    return this.prisma.interview.findUnique({
      where: { id },
      include: this.getDetailedInterviewInclude(),
    });
  }

  /**
   * Find all interviews with optional filtering
   * @param filters - Filter criteria for interviews
   * @param userId - Current user ID for permission filtering
   * @param userRole - Current user role for permission filtering
   * @returns Array of interviews matching the criteria
   */
  async findAll(
    filters?: InterviewFilterDto,
    userId?: number,
    userRole?: string,
  ): Promise<Interview[]> {
    const where = this.buildWhereClause(filters, userId, userRole);

    return this.prisma.interview.findMany({
      where,
      include: this.getListInterviewInclude(),
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  }

  /**
   * Delete an interview by its ID
   * @param id - The ID of the interview to delete
   * @returns The deleted interview
   */
  async delete(id: number): Promise<Interview> {
    return this.prisma.interview.delete({
      where: { id },
    });
  }

  /**
   * Update the application status after an interview
   * @param applicationId - The application ID
   * @param status - Optional new status
   * @param nextInterviewDate - Optional date for the next interview
   */
  async updateApplicationAfterInterview(
    applicationId: number,
    status?: string,
    nextInterviewDate?: Date | null,
  ): Promise<void> {
    await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: status || undefined,
        nextInterviewDate: nextInterviewDate,
      },
    });
  }

  /**
   * Find all pending interviews for a specific application
   * @param applicationId - The application ID
   * @returns Array of scheduled interviews
   */
  async findPendingInterviewsByApplicationId(
    applicationId: number,
  ): Promise<Interview[]> {
    return this.prisma.interview.findMany({
      where: {
        applicationId,
        status: InterviewStatus.SCHEDULED,
      },
    });
  }

  /**
   * Build the where clause for interview queries based on filters and permissions
   * @private
   */
  private buildWhereClause(
    filters?: InterviewFilterDto,
    userId?: number,
    userRole?: string,
  ): Prisma.InterviewWhereInput {
    const where: Prisma.InterviewWhereInput = {};

    // Filter by permissions
    if (userId && userRole && !['ADMIN', 'HR'].includes(userRole)) {
      where.interviewerId = userId;
    }

    // Apply filters if provided
    if (!filters) return where;

    // Apply individual filters
    if (filters.applicationId) {
      where.applicationId = filters.applicationId;
    }

    if (filters.interviewerId) {
      where.interviewerId = filters.interviewerId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    // Fix for date filtering to properly handle the spread operator issue
    let dateFilter: Prisma.DateTimeFilter | undefined;

    if (filters.startDate) {
      dateFilter = { ...(dateFilter || {}), gte: filters.startDate };
    }

    if (filters.endDate) {
      dateFilter = { ...(dateFilter || {}), lte: filters.endDate };
    }

    if (dateFilter) {
      where.scheduledAt = dateFilter;
    }

    return where;
  }

  /**
   * Get standard include object for interview list queries
   * @private
   */
  private getListInterviewInclude(): Prisma.InterviewInclude {
    return {
      application: {
        include: {
          job: {
            include: {
              department: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      interviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };
  }

  /**
   * Get standard include object for detailed interview queries
   * @private
   */
  private getDetailedInterviewInclude(): Prisma.InterviewInclude {
    return {
      application: {
        include: {
          job: {
            include: {
              department: true,
            },
          },
          candidate: true,
        },
      },
      interviewer: true,
    };
  }

  /**
   * Returns all includes for a full interview object
   */
  private getFullInterviewInclude(): Prisma.InterviewInclude {
    return {
      application: {
        include: {
          job: true,
          candidate: true,
          recruiters: {
            include: {
              recruiter: true,
            },
          },
        },
      },
      interviewer: true,
    };
  }

  /**
   * Find all users who can serve as interviewers (ADMIN, HR, and RECRUITER roles)
   * @returns A filtered list of users with minimal information needed for interviewer selection
   */
  async findAllInterviewers() {
    // Get users with ADMIN, HR, or RECRUITER roles only
    const interviewers = await this.prisma.user.findMany({
      where: {
        OR: [{ role: 'ADMIN' }, { role: 'HR' }, { role: 'RECRUITER' }],
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return interviewers;
  }
}
