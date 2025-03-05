import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Application, Prisma } from '@prisma/client';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
  ApplicationFilterDto,
} from '../dtos/application.dto';

@Injectable()
export class ApplicationRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateApplicationDto): Promise<Application> {
    const { jobId, candidateId, recruiterIds, ...rest } = data;

    return this.prisma.$transaction(async (prisma) => {
      // First create the application
      const application = await prisma.application.create({
        data: {
          ...rest,
          job: { connect: { id: jobId } },
          candidate: { connect: { id: candidateId } },
        },
        include: {
          job: {
            include: {
              department: true,
            },
          },
          candidate: true,
        },
      });

      // Then add recruiters if provided
      if (recruiterIds && recruiterIds.length > 0) {
        await prisma.applicationRecruiter.createMany({
          data: recruiterIds.map((recruiterId) => ({
            applicationId: application.id,
            recruiterId,
          })),
        });
      }

      return application;
    });
  }

  async update(id: number, data: UpdateApplicationDto): Promise<Application> {
    const { recruiterIds, ...rest } = data;

    return this.prisma.$transaction(async (prisma) => {
      const application = await prisma.application.update({
        where: { id },
        data: {
          ...rest,
          updatedAt: new Date(),
        },
        include: {
          job: {
            include: {
              department: true,
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

      // Update recruiters if provided
      if (recruiterIds) {
        // First delete existing recruiters
        await prisma.applicationRecruiter.deleteMany({
          where: { applicationId: id },
        });

        // Then add new recruiters
        if (recruiterIds.length > 0) {
          await prisma.applicationRecruiter.createMany({
            data: recruiterIds.map((recruiterId) => ({
              applicationId: id,
              recruiterId,
            })),
          });
        }
      }

      return application;
    });
  }

  async findById(id: number): Promise<Application> {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            department: true,
            category: true,
            location: true,
          },
        },
        candidate: true,
        interviews: {
          include: {
            interviewer: true,
          },
          orderBy: { scheduledAt: 'asc' },
        },
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
  }

  async findAll(filters?: ApplicationFilterDto): Promise<Application[]> {
    const where: Prisma.ApplicationWhereInput = {};

    if (filters) {
      if (filters.search) {
        where.OR = [
          {
            candidate: {
              name: { contains: filters.search, mode: 'insensitive' },
            },
          },
          {
            job: {
              title: { contains: filters.search, mode: 'insensitive' },
            },
          },
        ];
      }

      if (filters.jobId) {
        where.jobId = filters.jobId;
      }

      if (filters.departmentId) {
        where.job = {
          departmentId: filters.departmentId,
        };
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.recruiterId) {
        where.recruiters = {
          some: {
            recruiterId: filters.recruiterId,
          },
        };
      }
    }

    return this.prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            department: true,
          },
        },
        candidate: true,
        interviews: {
          include: {
            interviewer: true,
          },
        },
        recruiters: {
          include: {
            recruiter: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: string): Promise<Application> {
    return this.prisma.application.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        job: true,
        candidate: true,
      },
    });
  }

  async addComment(
    id: number,
    comment: string,
    userId: number,
    userName: string,
  ): Promise<Application> {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });

    const currentNotes = application.note || '';
    const timestamp = new Date().toISOString();
    const newComment = `[${timestamp}] ${userName}: ${comment}\n\n`;

    return this.prisma.application.update({
      where: { id },
      data: {
        note: newComment + currentNotes,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: number): Promise<Application> {
    return this.prisma.application.delete({
      where: { id },
    });
  }
}
