/**
 * API Endpoints Constants
 *
 * Centralized configuration for all API endpoints used in the application.
 * This makes it easier to maintain and update endpoints across the app.
 */

// Get the base API URL from environment variables
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * API Endpoints organized by resource/domain
 */
const API_ENDPOINTS = {
  // Jobs related endpoints
  JOBS: {
    BASE: "/jobs",
    DETAILS: (id: number) => `/jobs/${id}`,
    CATEGORIES: "/jobs/categories",
    LOCATIONS: "/jobs/locations",
    DEPARTMENTS: "/jobs/departments",
    APPLY: (id: number) => `/jobs/${id}/apply`,
    FEATURED: "/jobs/featured",
    RECOMMENDED: "/jobs/recommended",
    SAVED: "/jobs/saved",
    SAVE: (id: number) => `/jobs/${id}/save`,
    SEARCH: "/jobs/search",
    STATS: (id: number) => `/jobs/${id}/stats`,
    RELATED: (id: number) => `/jobs/${id}/related`,
  },

  // Authentication endpoints
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REGISTER_ADMIN: "/auth/register-admin",
    CHECK_ADMIN_EXISTS: "/auth/check-admin-exists",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_EMAIL: "/auth/verify-email",
    PROFILE: "/auth/profile",
    UPDATE_PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // User management endpoints
  USERS: {
    BASE: "/users",
    DETAILS: (id: number) => `/users/${id}`,
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    AVATAR: "/users/avatar",
    RESUME: "/users/resume",
    APPLICATIONS: "/users/applications",
    SAVED_JOBS: "/users/saved-jobs",
  },

  // Applications endpoints
  APPLICATIONS: {
    BASE: "/applications",
    DETAILS: (id: number) => `/applications/${id}`,
    STATUS: (id: number) => `/applications/${id}/status`,
    USER: "/applications/user",
    STATS: "/applications/stats",
  },

  // Company settings
  COMPANY: {
    SETTINGS: "/company-settings",
    LOGO: "/company/logo",
    THEME: "/company/theme",
    ABOUT: "/company/about",
    CONTACT: "/company/contact",
    SOCIAL: "/company/social",
  },

  // Admin dashboard endpoints
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    STATS: "/admin/stats",
    JOBS: "/admin/jobs",
    APPLICATIONS: "/admin/applications",
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: "/notifications",
    UNREAD: "/notifications/unread",
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/read-all",
  },
};

export default API_ENDPOINTS;
