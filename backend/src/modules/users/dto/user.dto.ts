import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';

/**
 * Extended User type that guarantees email property exists
 */
export interface UserWithEmail extends User {
  email: string;
}

/**
 * DTO for creating a new user
 */
export class CreateUserDto {
  @ApiProperty({
    description: "User's email address",
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: "User's full name", example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "User's password (min 8 chars)",
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: "User's role in the system",
    enum: Role,
    example: 'RECRUITER',
  })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional({ description: "User's department ID", example: 1 })
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({
    description: "User's hire date",
    example: '2023-01-01',
  })
  @IsDateString()
  @IsOptional()
  hireDate?: string;
}

/**
 * DTO for updating an existing user
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: "User's email address",
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: "User's full name", example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "User's password (min 8 chars)",
    example: 'password123',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: "User's role in the system",
    enum: Role,
    example: 'RECRUITER',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({ description: "User's department ID", example: 1 })
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({
    description: "User's hire date",
    example: '2023-01-01',
  })
  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @ApiPropertyOptional({
    description: "User's end date",
    example: '2023-12-31',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

/**
 * DTO for user filtering
 */
export class UserFilterDto {
  @ApiPropertyOptional({
    description: 'Filter users by role',
    enum: Role,
    example: 'RECRUITER',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    description: 'Filter users by department ID',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'Search term for name or email',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

/**
 * Department data returned with user objects
 */
export interface DepartmentDto {
  id: number;
  name: string;
}

/**
 * DTO for interviewer data returned from API
 */
export interface InterviewerDto {
  id: number;
  name: string;
  email: string;
  role: Role;
  department?: DepartmentDto;
}

/**
 * DTO for recruiter data returned from API
 */
export interface RecruiterDto {
  id: number;
  name: string;
  email: string;
  department?: DepartmentDto;
}
