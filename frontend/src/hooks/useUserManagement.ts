import { useState, useCallback, useEffect } from "react";
import { useSnackbar } from "notistack";
import { userService } from "../services/userService";
import {
  User,
  Role,
  Department,
  CreateUserFormData,
  UpdateUserFormData,
  UserFilterOptions,
} from "../types/user";

/**
 * Custom hook for user management operations
 */
export const useUserManagement = () => {
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState<UserFilterOptions>({});
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { enqueueSnackbar } = useSnackbar();

  /**
   * Clear any form errors
   */
  const clearFormErrors = () => {
    setFormErrors({});
  };

  /**
   * Fetch users with optional role filter
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers(filterOptions.role);
      setUsers(data);
    } catch (err) {
      const errorMessage = "Failed to load users";
      console.error(errorMessage, err);
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, filterOptions.role]);

  /**
   * Fetch departments for department selection
   */
  const fetchDepartments = useCallback(async () => {
    try {
      const departments = await userService.getDepartments();
      setDepartments(departments);
    } catch (err) {
      console.error("Error fetching departments:", err);
      enqueueSnackbar("Failed to load departments", { variant: "warning" });
    }
  }, [enqueueSnackbar]);

  /**
   * Create a new user
   */
  const createUser = async (userData: CreateUserFormData): Promise<boolean> => {
    setActionLoading(true);
    clearFormErrors();

    try {
      const newUser = await userService.createUser({
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password,
        role: userData.role,
        departmentId: userData.departmentId,
        hireDate: userData.hireDate,
      });

      // Update local state without making another API call
      setUsers((prevUsers) => [...prevUsers, newUser]);

      enqueueSnackbar("User created successfully", { variant: "success" });
      return true;
    } catch (err: any) {
      console.error("Error creating user:", err);

      // Handle validation errors from the server
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        enqueueSnackbar("Please correct the errors in the form", {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          err.response?.data?.message || "Failed to create user",
          { variant: "error" }
        );
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Update an existing user
   */
  const updateUser = async (
    id: number,
    userData: UpdateUserFormData
  ): Promise<boolean> => {
    setActionLoading(true);
    clearFormErrors();

    try {
      // Ensure userData is clean and ready for submission
      const updateData = { ...userData };

      // Remove unnecessary properties
      delete updateData.confirmPassword;

      // Check if we actually have data to update
      if (Object.keys(updateData).length < 2) {
        // id + at least one property
        enqueueSnackbar("No changes to update", { variant: "info" });
        return true;
      }

      // Make API call with clean data
      const updatedUser = await userService.updateUser(id, updateData);

      // Update the selected user with new data
      setSelectedUser(updatedUser);

      // Update the user in the users array
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );

      enqueueSnackbar("User updated successfully", { variant: "success" });
      return true;
    } catch (err: any) {
      console.error("Error updating user:", err);

      // Handle validation errors from the server
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
        enqueueSnackbar("Please correct the errors in the form", {
          variant: "error",
        });
      } else {
        enqueueSnackbar(
          err.response?.data?.message || "Failed to update user",
          { variant: "error" }
        );
      }
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Delete a user
   */
  const deleteUser = async (id: number): Promise<boolean> => {
    setActionLoading(true);
    try {
      await userService.deleteUser(id);

      enqueueSnackbar("User deleted successfully", { variant: "success" });
      setSelectedUser(null);

      // Remove the user from the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      return true;
    } catch (err: any) {
      console.error("Error deleting user:", err);
      enqueueSnackbar(err.response?.data?.message || "Failed to delete user", {
        variant: "error",
      });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Apply filters to users
   */
  const applyFilters = useCallback(
    (options: UserFilterOptions) => {
      setFilterOptions(options);

      let results = [...users];

      // Filter by search term
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        results = results.filter(
          (user) =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }

      // Additional department filter (if needed)
      if (options.departmentId) {
        results = results.filter(
          (user) => user.departmentId === options.departmentId
        );
      }

      setFilteredUsers(results);
    },
    [users]
  );

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setFilterOptions({});
    setFilteredUsers(users);
  };

  // Initialize filteredUsers when users change
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Initial data loading
  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  // Refresh filtered users when filter options change
  useEffect(() => {
    applyFilters(filterOptions);
  }, [filterOptions, applyFilters]);

  return {
    // Data
    users,
    filteredUsers,
    departments,
    selectedUser,

    // State
    loading,
    actionLoading,
    error,
    formErrors,
    filterOptions,

    // Actions
    setSelectedUser,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    applyFilters,
    resetFilters,
    clearFormErrors,
  };
};

export default useUserManagement;
