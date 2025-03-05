import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  NotFoundException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  GrowthPlanService,
  CreateGrowthPlanDto,
  UpdateGrowthPlanDto,
} from './growth-plan.service';

@Controller('growth-plans')
export class GrowthPlanController {
  constructor(private readonly growthPlanService: GrowthPlanService) {}

  @Get()
  async getAllGrowthPlans() {
    return this.growthPlanService.getDepartmentGrowthPlans();
  }

  @Get('active')
  async getActiveGrowthPlans() {
    return this.growthPlanService.getActiveGrowthPlans();
  }

  @Get('department/:departmentId')
  async getGrowthPlansByDepartment(
    @Param('departmentId', ParseIntPipe) departmentId: number,
  ) {
    try {
      return await this.growthPlanService.getDepartmentGrowthPlansByDepartmentId(
        departmentId,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error retrieving growth plans: ${error.message}`,
      );
    }
  }

  @Get(':id')
  async getGrowthPlanById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.growthPlanService.getDepartmentGrowthPlanById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error retrieving growth plan: ${error.message}`,
      );
    }
  }

  @Post()
  async createGrowthPlan(@Body() data: CreateGrowthPlanDto) {
    try {
      return await this.growthPlanService.createDepartmentGrowthPlan(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error creating growth plan: ${error.message}`,
      );
    }
  }

  @Put(':id')
  async updateGrowthPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateGrowthPlanDto,
  ) {
    try {
      return await this.growthPlanService.updateDepartmentGrowthPlan(id, data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error updating growth plan: ${error.message}`,
      );
    }
  }

  @Put(':id/status')
  async updateGrowthPlanStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }

    try {
      return await this.growthPlanService.updateGrowthPlanStatus(id, status);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error updating growth plan status: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  async deleteGrowthPlan(@Param('id', ParseIntPipe) id: number) {
    try {
      const result =
        await this.growthPlanService.deleteDepartmentGrowthPlan(id);
      return { success: result };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error deleting growth plan: ${error.message}`,
      );
    }
  }
}
