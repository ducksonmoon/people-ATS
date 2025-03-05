import { Role } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  ValidateNested,
  IsEnum,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// Request DTOs
export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class CompanyDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  name: string;

  @IsString()
  @IsOptional()
  website?: string;
}

export class AdminRegistrationDto {
  @ValidateNested()
  @Type(() => RegisterDto)
  admin: RegisterDto;

  @ValidateNested()
  @Type(() => CompanyDto)
  company: CompanyDto;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetDto {
  token: string;
  newPassword: string;
}

// Response DTOs
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  departmentId?: number | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: Role;
    };
    emailSent: boolean;
  };
}

export interface MessageResponse {
  message: string;
}

export interface AdminExistsResponse {
  adminExists: boolean;
}

// Add a new DTO for refresh token requests
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}
