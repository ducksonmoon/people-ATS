import api from "./api";
import { Role, UpdateUserFormData } from "../types/user";

/**
 * Service for user management operations
 */
export const userService = {
  /**
   * Get all users with optional role filtering
   */
  async getAllUsers(role?: Role) {
    try {
      console.log(`Fetching users${role ? ` with role ${role}` : ""}`);
      const params = role ? { role } : {};
      const response = await api.get("/users", { params });
      console.log(`Retrieved ${response.data.length} users`);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(id: number) {
    try {
      console.log(`Fetching user with ID ${id}`);
      const response = await api.get(`/users/${id}`);
      console.log("User retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new user
   */
  async createUser(userData: any) {
    try {
      console.log("Creating new user:", userData.name);
      const response = await api.post("/users", userData);
      console.log("User created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  async updateUser(id: number, userData: UpdateUserFormData) {
    if (!id) {
      console.error("User ID is required for update");
      throw new Error("User ID is required");
    }

    try {
      console.log(`Updating user ${id}:`, userData);
      const response = await api.put(`/users/${id}`, userData);
      console.log("User updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a user
   */
  async deleteUser(id: number) {
    try {
      console.log(`Deleting user ${id}`);
      const response = await api.delete(`/users/${id}`);
      console.log("User deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all potential interviewers (users with ADMIN, HR, or RECRUITER roles)
   */
  async getInterviewers(search?: string) {
    try {
      console.log("Fetching interviewers");
      // Use the updated endpoint in users controller instead of the hr endpoint
      const response = await api.get("/users/interviewers", {
        params: { search },
      });
      console.log("Interviewers retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching interviewers:", error);
      throw error;
    }
  },

  /**
   * Get all recruiters
   */
  async getRecruiters() {
    try {
      console.log("Fetching recruiters");
      const response = await api.get("/users/recruiters");
      console.log("Recruiters retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      throw error;
    }
  },

  /**
   * Get all departments
   */
  async getDepartments() {
    try {
      console.log("Fetching departments");
      const response = await api.get("/departments");
      console.log("Departments retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },
};
