import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  Breadcrumbs,
  Link,
  Backdrop,
  CircularProgress,
  AlertTitle,
  Snackbar,
} from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useUserManagement } from "../hooks/useUserManagement";

// Import custom components
import UserTable from "../components/user-management/UserTable";
import UserActionsBar from "../components/user-management/UserActionsBar";
import UserForm from "../components/user-management/UserForm";
import UserDeleteDialog from "../components/user-management/UserDeleteDialog";
import {
  CreateUserFormData,
  Role,
  UpdateUserFormData,
  User,
} from "../types/user";

/**
 * User Management Page
 * Displays list of users and provides functionality to manage them
 */
const UserManagementPage: React.FC = () => {
  // Use custom hook for user management logic
  const {
    filteredUsers,
    departments,
    selectedUser,
    loading,
    actionLoading,
    error,
    formErrors,
    filterOptions,
    setSelectedUser,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    applyFilters,
    resetFilters,
    clearFormErrors,
  } = useUserManagement();

  // UI state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateRequestStatus, setUpdateRequestStatus] = useState("");

  // Handlers
  const handleSearch = (searchTerm: string) => {
    applyFilters({ ...filterOptions, search: searchTerm });
  };

  const handleRoleChange = (role?: Role) => {
    applyFilters({ ...filterOptions, role });
  };

  const handleDepartmentFilter = (departmentId?: number) => {
    applyFilters({ ...filterOptions, departmentId });
  };

  const handleAddUser = () => {
    clearFormErrors();
    setCreateDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    clearFormErrors();
    setSelectedUser(user);
    setUpdateDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleCreateUser = async (data: CreateUserFormData) => {
    const success = await createUser(data);
    if (success) {
      setCreateDialogOpen(false);
    }
  };

  const handleUpdateUser = async (data: UpdateUserFormData) => {
    if (!selectedUser) return;

    setUpdateRequestStatus("pending");
    const success = await updateUser(selectedUser.id, data);

    if (success) {
      setUpdateDialogOpen(false);
      setUpdateRequestStatus("success");
    } else {
      setUpdateRequestStatus("error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    const success = await deleteUser(selectedUser.id);
    if (success) {
      setDeleteDialogOpen(false);
    }
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedUser(null);
  };

  const handleCloseSnackbar = () => {
    setUpdateRequestStatus("");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb Navigation */}
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to="/dashboard/hr"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            HR Dashboard
          </Link>
          <Typography
            color="text.primary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <PeopleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            User Management
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          User Management
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Box
              component="button"
              sx={{
                cursor: "pointer",
                border: "none",
                bgcolor: "transparent",
                display: "flex",
                alignItems: "center",
                fontWeight: "bold",
                color: "inherit",
                p: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                },
              }}
              onClick={fetchUsers}
            >
              <RefreshIcon sx={{ mr: 0.5 }} />
              Retry
            </Box>
          }
        >
          <AlertTitle>Error Loading Users</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Filter bar */}
      <Paper
        elevation={2}
        sx={{
          mb: 4,
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        }}
      >
        <UserActionsBar
          onSearch={handleSearch}
          onAddUser={handleAddUser}
          onRefresh={fetchUsers}
          onRoleChange={handleRoleChange}
          onResetFilters={handleResetFilters}
          loading={loading}
          departments={departments}
          onDepartmentFilter={handleDepartmentFilter}
          filterOptions={filterOptions}
        />

        {/* Users Table */}
        <UserTable
          users={filteredUsers}
          loading={loading}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
        />
      </Paper>

      {/* Create User Modal */}
      <UserForm
        open={createDialogOpen}
        mode="create"
        departments={departments}
        loading={actionLoading}
        formErrors={formErrors}
        clearFormErrors={clearFormErrors}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
      />

      {/* Edit User Modal */}
      <UserForm
        open={updateDialogOpen}
        mode="edit"
        user={selectedUser}
        departments={departments}
        loading={actionLoading}
        formErrors={formErrors}
        clearFormErrors={clearFormErrors}
        onClose={handleCloseUpdateDialog}
        onSubmit={handleUpdateUser}
      />

      {/* Delete User Dialog */}
      <UserDeleteDialog
        open={deleteDialogOpen}
        user={selectedUser}
        loading={actionLoading}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Loading overlay */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={actionLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Update status notification */}
      <Snackbar
        open={updateRequestStatus === "success"}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message="User updated successfully"
      />
    </Container>
  );
};

export default UserManagementPage;
