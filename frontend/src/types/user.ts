import { Department } from "./application";

/**
 * User roles in the system
 */
export enum Role {
  ADMIN = "ADMIN",
  HR = "HR",
  RECRUITER = "RECRUITER",
  CANDIDATE = "CANDIDATE",
  EMPLOYEE = "EMPLOYEE",
}

/**
 * Department interface for User
 */
export interface Department {
  id: number;
  name: string;
}

/**
 * User interface representing a user in the system
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  departmentId?: number;
  department?: Department;
  hireDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Data required to create a new user
 */
export interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  departmentId?: number;
  hireDate?: string;
}

/**
 * Data used to update an existing user
 */
export interface UpdateUserFormData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: Role;
  departmentId?: number;
  hireDate?: string;
  endDate?: string;
}

/**
 * Options for filtering users
 */
export interface UserFilterOptions {
  role?: Role;
  departmentId?: number;
  search?: string;
}
