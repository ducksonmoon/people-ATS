import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Department, User } from '@prisma/client';

@Injectable()
export class DepartmentRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Department[]> {
    return this.prisma.department.findMany({
      include: {
        employees: true,
        jobs: {
          include: {
            applications: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Department> {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        employees: true,
        jobs: {
          include: {
            applications: true,
          },
        },
      },
    });
  }

  async findByNames(names: string[]): Promise<Department[]> {
    return this.prisma.department.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });
  }

  async findEmployeesByDepartmentId(departmentId: number): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        departmentId,
        role: 'EMPLOYEE',
      },
    });
  }
}
