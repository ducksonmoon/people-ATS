import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  InterviewerDto,
  RecruiterDto,
  UserWithEmail,
} from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all users with optional role filtering
   * @param role Optional role filter
   * @param filter Optional additional filters
   * @returns Array of users matching the criteria
   */
  async findAllUsers(role?: Role, filter?: UserFilterDto): Promise<User[]> {
    const where: any = {};

    // Apply role filter if provided
    if (role) {
      where.role = role;
    }

    // Apply additional filters if provided
    if (filter) {
      if (filter.departmentId) {
        where.departmentId = filter.departmentId;
      }

      if (filter.search) {
        where.OR = [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
    }

    return this.prisma.user.findMany({
      where,
      include: {
        department: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  /**
   * Find user by ID
   * @param id User ID
   * @returns User with the specified ID
   */
  async findById(id: number): Promise<UserWithEmail> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user as UserWithEmail;
  }

  /**
   * Create a new user
   * @param data User data
   * @returns Created user
   */
  async createUser(data: CreateUserDto): Promise<User> {
    // Check if user with this email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${data.email} already exists`,
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create the user with hashed password
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        hireDate: data.hireDate ? new Date(data.hireDate) : undefined,
      },
      include: {
        department: true,
      },
    });
  }

  /**
   * Update an existing user
   * @param id User ID
   * @param data Updated user data
   * @returns Updated user
   */
  async updateUser(id: number, data: UpdateUserDto): Promise<User> {
    // Check if user exists
    const user = await this.findById(id);

    // If email is being changed, check if it's already taken
    if (data.email && data.email !== user.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailTaken) {
        throw new ConflictException(`Email ${data.email} is already taken`);
      }
    }

    // Hash new password if provided
    let updatedData: any = { ...data };
    if (data.password) {
      updatedData.password = await bcrypt.hash(data.password, 10);
    }

    // Convert date strings to Date objects
    if (data.hireDate) {
      updatedData.hireDate = new Date(data.hireDate);
    }

    if (data.endDate) {
      updatedData.endDate = new Date(data.endDate);
    }

    // Update the user
    return this.prisma.user.update({
      where: { id },
      data: updatedData,
      include: {
        department: true,
      },
    });
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Deleted user
   */
  async deleteUser(id: number): Promise<User> {
    // Check if user exists
    await this.findById(id);

    // Delete the user
    return this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Find all potential interviewers (ADMIN, HR, RECRUITER, EMPLOYEE roles)
   * @param search Optional search string to filter interviewers by name or email
   * @returns Array of interviewers with their basic info
   */
  async findInterviewers(search?: string): Promise<InterviewerDto[]> {
    const whereClause: any = {
      OR: [
        { role: Role.ADMIN },
        { role: Role.HR },
        { role: Role.RECRUITER },
        { role: Role.EMPLOYEE },
      ],
    };

    if (search) {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      ];
    }

    return this.prisma.user.findMany({
      where: whereClause,
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
  }

  /**
   * Find all users with RECRUITER role
   * @returns Array of recruiters with their basic info
   */
  async findRecruiters(): Promise<RecruiterDto[]> {
    return this.prisma.user.findMany({
      where: {
        role: Role.RECRUITER,
      },
      select: {
        id: true,
        name: true,
        email: true,
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
  }
}
