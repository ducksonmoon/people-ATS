import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Role } from '@prisma/client';
import { RolesGuard } from './guards/roles.guard';

@UseGuards(RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        Application: true,
      },
    });
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body() body: { role: Role }) {
    return this.prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: body.role },
    });
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.prisma.user.delete({
      where: { id: parseInt(id) },
    });
  }

  @Get('applications')
  async getAllApplications() {
    return this.prisma.application.findMany({
      include: {
        candidate: true,
        job: true,
      },
    });
  }
}
