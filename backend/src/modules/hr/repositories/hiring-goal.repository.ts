import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { HiringGoal, CompletedHiringGoal, Prisma } from '@prisma/client';
import { HiringGoalDto } from '../dtos/hiring-goal.dto';

@Injectable()
export class HiringGoalRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<HiringGoal[]> {
    return this.prisma.hiringGoal.findMany({
      include: {
        department: true,
        assignedRecruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<HiringGoal> {
    return this.prisma.hiringGoal.findUnique({
      where: { id },
      include: {
        department: true,
        assignedRecruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
  }

  async findByDepartmentId(departmentId: number): Promise<HiringGoal> {
    return this.prisma.hiringGoal.findFirst({
      where: { departmentId },
      include: {
        department: true,
        assignedRecruiters: {
          include: {
            recruiter: true,
          },
        },
      },
    });
  }

  async deleteByDepartmentIds(
    departmentIds: number[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.hiringGoal.deleteMany({
      where: {
        departmentId: { in: departmentIds },
      },
    });
  }

  async createMany(
    data: Omit<
      HiringGoalDto,
      'assignedRecruiterIds' | 'changeState' | 'deleted'
    >[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.hiringGoal.createMany({
      data: data.map((goal) => ({
        departmentId: goal.departmentId,
        targetHeadcount: goal.targetHeadcount,
        startDate: goal.startDate,
        endDate: goal.endDate,
        priority: goal.priority || 'medium',
        status: goal.status || 'not_started',
        notes: goal.notes,
        budget: goal.budget,
      })),
    });
  }

  async assignRecruiters(
    hiringGoalId: number,
    recruiterIds: number[],
  ): Promise<Prisma.BatchPayload> {
    return this.prisma.hiringGoalRecruiter.createMany({
      data: recruiterIds.map((recruiterId) => ({
        hiringGoalId,
        recruiterId,
      })),
    });
  }

  async findAllCompleted(): Promise<CompletedHiringGoal[]> {
    return this.prisma.completedHiringGoal.findMany({
      include: {
        department: true,
      },
    });
  }

  async findExpired(): Promise<HiringGoal[]> {
    const today = new Date();

    return this.prisma.hiringGoal.findMany({
      where: {
        endDate: {
          lt: today,
        },
        status: {
          not: 'completed',
        },
      },
      include: {
        department: true,
        assignedRecruiters: true,
      },
    });
  }

  async createCompletedGoal(
    data: Prisma.CompletedHiringGoalCreateInput,
  ): Promise<CompletedHiringGoal> {
    return this.prisma.completedHiringGoal.create({
      data,
    });
  }

  async delete(id: number): Promise<HiringGoal> {
    return this.prisma.hiringGoal.delete({
      where: { id },
    });
  }

  async logActivity(
    action: string,
    details: string,
    entityType: string,
    entityIds: string,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO "ActivityLog" ("action", "details", "entityType", "entityIds", "timestamp")
      VALUES (
        ${action},
        ${details},
        ${entityType},
        ${entityIds},
        ${new Date()}
      )
    `;
  }

  /**
   * Get company settings that might contain growth plans
   */
  async getCompanySettings(): Promise<any> {
    return this.prisma.companySettings.findFirst();
  }
}
