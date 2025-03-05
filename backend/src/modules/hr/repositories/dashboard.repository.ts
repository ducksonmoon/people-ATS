import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Fetch job requisitions with related departments and applications count
   */
  async getJobRequisitions(filter: any = {}) {
    return this.prisma.job.findMany({
      where: filter,
      include: {
        department: true,
        applications: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  /**
   * Fetch active applications with candidate, job, department, and interview info
   */
  async getActiveApplications(filter: any = {}) {
    return this.prisma.application.findMany({
      where: {
        status: { notIn: ['REJECTED', 'WITHDRAWN', 'HIRED'] },
        ...filter,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          include: {
            department: true,
          },
        },
        interviews: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
        recruiters: {
          select: {
            recruiter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Fetch department metrics including employee count and open positions
   */
  async getDepartmentMetrics() {
    const departments = await this.prisma.department.findMany({
      include: {
        _count: {
          select: {
            employees: true,
            jobs: {
              where: {
                status: 'OPEN',
              },
            },
          },
        },
      },
    });

    return departments;
  }

  /**
   * Fetch historical hiring data for trends analysis
   */
  async getHistoricalHiringData(monthsBack: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const applications = await this.prisma.application.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        job: {
          include: {
            department: true,
          },
        },
      },
    });

    return applications;
  }

  /**
   * Fetch time-to-hire metrics from completed hiring cycles
   */
  async getTimeToHireData() {
    return this.prisma.application.findMany({
      where: {
        status: 'HIRED',
        updatedAt: { not: null },
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        job: {
          select: {
            id: true,
            title: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Fetch department hiring goals
   */
  async getDepartmentHiringGoals() {
    return this.prisma.hiringGoal.findMany({
      include: {
        department: true,
      },
    });
  }
}
