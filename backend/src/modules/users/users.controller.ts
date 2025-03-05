import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/decorators/jwt-auth.guard';
import { RolesGuard } from '../auth/decorators/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

/**
 * Controller for user management operations
 */
@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users with INTERVIEWER, HR, RECRUITER, or EMPLOYEE roles (for interview scheduling)
   */
  @Get('interviewers')
  @Roles(Role.ADMIN, Role.HR, Role.RECRUITER, Role.EMPLOYEE)
  @ApiOperation({ summary: 'Get all potential interviewers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all potential interviewers including employees',
  })
  async getAllInterviewers() {
    try {
      return await this.usersService.findInterviewers();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve interviewers',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all users with RECRUITER role
   */
  @Get('recruiters')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get all recruiters' })
  @ApiResponse({ status: 200, description: 'Returns all recruiters' })
  async getAllRecruiters() {
    try {
      return await this.usersService.findRecruiters();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve recruiters',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.usersService.findById(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all users with optional role filtering
   */
  @Get()
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Returns all users' })
  async getAllUsers(@Query('role') role?: Role) {
    try {
      return await this.usersService.findAllUsers(role);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve users',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new user
   */
  @Post()
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() data: CreateUserDto) {
    try {
      return await this.usersService.createUser(data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update an existing user
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.HR)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
  ) {
    try {
      return await this.usersService.updateUser(id, data);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a user
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.usersService.deleteUser(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete user',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
