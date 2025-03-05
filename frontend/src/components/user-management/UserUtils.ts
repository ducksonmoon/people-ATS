import { Role } from "../../types/user";
import { Theme } from "@mui/material";

/**
 * Maps user role to appropriate color
 */
export const getRoleColor = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return "error";
    case Role.HR:
      return "secondary";
    case Role.RECRUITER:
      return "primary";
    case Role.EMPLOYEE:
      return "success";
    case Role.CANDIDATE:
      return "info";
    default:
      return "default";
  }
};

/**
 * Get color for role avatar
 */
export const getRoleAvatarColor = (role: Role, theme: Theme) => {
  switch (role) {
    case Role.ADMIN:
      return theme.palette.error.main;
    case Role.HR:
      return theme.palette.secondary.main;
    case Role.RECRUITER:
      return theme.palette.primary.main;
    case Role.EMPLOYEE:
      return theme.palette.success.main;
    case Role.CANDIDATE:
      return theme.palette.info.main;
    default:
      return theme.palette.grey[500];
  }
};

/**
 * Get human-readable role display name
 */
export const getRoleDisplayName = (role: Role): string => {
  switch (role) {
    case Role.ADMIN:
      return "Administrator";
    case Role.HR:
      return "HR Manager";
    case Role.RECRUITER:
      return "Recruiter";
    case Role.EMPLOYEE:
      return "Employee";
    case Role.CANDIDATE:
      return "Candidate";
    default:
      return role;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

/**
 * Format date string for display
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Initial empty form data for creating a user
 */
export const emptyCreateUserForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: Role.EMPLOYEE,
  departmentId: undefined,
  hireDate: undefined,
};

/**
 * Initial empty form data for updating a user
 */
export const emptyUpdateUserForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: undefined,
  departmentId: undefined,
  hireDate: undefined,
  endDate: undefined,
};
