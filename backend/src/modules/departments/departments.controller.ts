import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/public.decorator';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Public()
  @Get()
  async getAllDepartments() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  async getDepartmentById(@Param('id') id: string) {
    return this.departmentsService.findById(parseInt(id, 10));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'HR')
  async createDepartment(@Body() data: { name: string; description?: string }) {
    return this.departmentsService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'HR')
  async updateDepartment(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string },
  ) {
    return this.departmentsService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteDepartment(@Param('id') id: string) {
    return this.departmentsService.delete(parseInt(id, 10));
  }
}
