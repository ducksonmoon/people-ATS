import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        employees: true,
        jobs: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async create(data: { name: string; description?: string }) {
    return this.prisma.department.create({
      data,
    });
  }

  async update(id: number, data: { name?: string; description?: string }) {
    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    // Check if department exists
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if department has associated employees or jobs
    const [employeeCount, jobCount] = await Promise.all([
      this.prisma.user.count({ where: { departmentId: id } }),
      this.prisma.job.count({ where: { departmentId: id } }),
    ]);

    if (employeeCount > 0 || jobCount > 0) {
      throw new Error(
        `Cannot delete department with ID ${id} because it has associated employees or jobs`,
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
