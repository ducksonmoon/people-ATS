import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface CreateGrowthPlanDto {
  departmentId: number;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  notes?: string;
  priority?: string;
}

export interface UpdateGrowthPlanDto {
  targetHeadcount?: number;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  priority?: string;
}

export interface GrowthPlanResponse {
  id: number;
  departmentId: number;
  departmentName: string;
  targetHeadcount: number;
  startDate: Date;
  endDate: Date;
  notes?: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GrowthPlanService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all department growth plans with associated department info
   * @returns Array of growth plans with department info
   */
  async getDepartmentGrowthPlans(): Promise<GrowthPlanResponse[]> {
    const plans = await this.prisma.departmentGrowthPlan.findMany({
      include: {
        department: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      departmentId: plan.departmentId,
      departmentName: plan.department.name,
      targetHeadcount: plan.targetHeadcount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes || undefined,
      priority: plan.priority,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  /**
   * Get growth plans for a specific department
   * @param departmentId Department ID
   * @returns Array of growth plans for the department
   */
  async getDepartmentGrowthPlansByDepartmentId(
    departmentId: number,
  ): Promise<GrowthPlanResponse[]> {
    const plans = await this.prisma.departmentGrowthPlan.findMany({
      where: {
        departmentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        department: true,
      },
    });

    if (plans.length === 0) {
      return [];
    }

    return plans.map((plan) => ({
      id: plan.id,
      departmentId: plan.departmentId,
      departmentName: plan.department.name,
      targetHeadcount: plan.targetHeadcount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes || undefined,
      priority: plan.priority,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  /**
   * Get a specific growth plan by ID
   * @param id Growth plan ID
   * @returns Growth plan with department info
   */
  async getDepartmentGrowthPlanById(id: number): Promise<GrowthPlanResponse> {
    const plan = await this.prisma.departmentGrowthPlan.findUnique({
      where: {
        id,
      },
      include: {
        department: true,
      },
    });

    if (!plan) {
      throw new NotFoundException(`Growth plan with ID ${id} not found`);
    }

    return {
      id: plan.id,
      departmentId: plan.departmentId,
      departmentName: plan.department.name,
      targetHeadcount: plan.targetHeadcount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes || undefined,
      priority: plan.priority,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  /**
   * Create a new department growth plan
   * @param data Growth plan data
   * @returns The created growth plan
   */
  async createDepartmentGrowthPlan(
    data: CreateGrowthPlanDto,
  ): Promise<GrowthPlanResponse> {
    // Verify the department exists
    const department = await this.prisma.department.findUnique({
      where: {
        id: data.departmentId,
      },
    });

    if (!department) {
      throw new NotFoundException(
        `Department with ID ${data.departmentId} not found`,
      );
    }

    const plan = await this.prisma.departmentGrowthPlan.create({
      data: {
        departmentId: data.departmentId,
        targetHeadcount: data.targetHeadcount,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        priority: data.priority || 'medium',
      },
      include: {
        department: true,
      },
    });

    return {
      id: plan.id,
      departmentId: plan.departmentId,
      departmentName: plan.department.name,
      targetHeadcount: plan.targetHeadcount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes || undefined,
      priority: plan.priority,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  /**
   * Update an existing department growth plan
   * @param id Growth plan ID
   * @param data Updated growth plan data
   * @returns The updated growth plan
   */
  async updateDepartmentGrowthPlan(
    id: number,
    data: UpdateGrowthPlanDto,
  ): Promise<GrowthPlanResponse> {
    // Check if the growth plan exists
    const existingPlan = await this.prisma.departmentGrowthPlan.findUnique({
      where: {
        id,
      },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Growth plan with ID ${id} not found`);
    }

    const updatedPlan = await this.prisma.departmentGrowthPlan.update({
      where: {
        id,
      },
      data,
      include: {
        department: true,
      },
    });

    return {
      id: updatedPlan.id,
      departmentId: updatedPlan.departmentId,
      departmentName: updatedPlan.department.name,
      targetHeadcount: updatedPlan.targetHeadcount,
      startDate: updatedPlan.startDate,
      endDate: updatedPlan.endDate,
      notes: updatedPlan.notes || undefined,
      priority: updatedPlan.priority,
      createdAt: updatedPlan.createdAt,
      updatedAt: updatedPlan.updatedAt,
    };
  }

  /**
   * Delete a department growth plan
   * @param id Growth plan ID
   * @returns Boolean indicating success
   */
  async deleteDepartmentGrowthPlan(id: number): Promise<boolean> {
    // Check if the growth plan exists
    const existingPlan = await this.prisma.departmentGrowthPlan.findUnique({
      where: {
        id,
      },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Growth plan with ID ${id} not found`);
    }

    await this.prisma.departmentGrowthPlan.delete({
      where: {
        id,
      },
    });

    return true;
  }

  /**
   * Get high priority growth plans
   * @returns Array of high priority growth plans
   */
  async getHighPriorityGrowthPlans(): Promise<GrowthPlanResponse[]> {
    const plans = await this.prisma.departmentGrowthPlan.findMany({
      where: {
        priority: 'high',
      },
      include: {
        department: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      departmentId: plan.departmentId,
      departmentName: plan.department.name,
      targetHeadcount: plan.targetHeadcount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes || undefined,
      priority: plan.priority,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  /**
   * Get active department growth plans
   * Growth plans are considered active if the current date is between startDate and endDate
   * @returns Array of active growth plans with department info
   */
  async getActiveGrowthPlans(): Promise<GrowthPlanResponse[]> {
    const currentDate = new Date();

    const plans = await this.prisma.departmentGrowthPlan.findMany({
      where: {
        startDate: {
          lte: currentDate,
        },
        endDate: {
          gte: currentDate,
        },
      },
      include: {
        department: true,
      },
      orderBy: {
        endDate: 'asc', // Prioritize plans ending sooner
      },
    });

    return plans.map((plan) => ({
      id: plan.id,
      departmentId: plan.departmentId,
      departmentName: plan.department.name,
      targetHeadcount: plan.targetHeadcount,
      startDate: plan.startDate,
      endDate: plan.endDate,
      notes: plan.notes || undefined,
      priority: plan.priority,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }));
  }

  /**
   * Update a growth plan's status
   * @param id Growth plan ID
   * @param status New status value
   * @returns Updated growth plan
   */
  async updateGrowthPlanStatus(
    id: number,
    status: string,
  ): Promise<GrowthPlanResponse> {
    // First check if the growth plan exists
    const existingPlan = await this.prisma.departmentGrowthPlan.findUnique({
      where: { id },
      include: { department: true },
    });

    if (!existingPlan) {
      throw new NotFoundException(`Growth plan with ID ${id} not found`);
    }

    // Update the growth plan with the new status (stored in the priority field)
    const updatedPlan = await this.prisma.departmentGrowthPlan.update({
      where: { id },
      data: { priority: status },
      include: { department: true },
    });

    return {
      id: updatedPlan.id,
      departmentId: updatedPlan.departmentId,
      departmentName: updatedPlan.department.name,
      targetHeadcount: updatedPlan.targetHeadcount,
      startDate: updatedPlan.startDate,
      endDate: updatedPlan.endDate,
      notes: updatedPlan.notes || undefined,
      priority: updatedPlan.priority,
      createdAt: updatedPlan.createdAt,
      updatedAt: updatedPlan.updatedAt,
    };
  }
}
