import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Chip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { Role, Department, UserFilterOptions } from "../../types/user";
import { getRoleDisplayName, getRoleColor } from "./UserUtils";

interface UserActionsBarProps {
  onSearch: (searchTerm: string) => void;
  onAddUser: () => void;
  onRefresh: () => void;
  onRoleChange: (role?: Role) => void;
  onDepartmentFilter: (departmentId?: number) => void;
  onResetFilters: () => void;
  loading: boolean;
  departments: Department[];
  filterOptions: UserFilterOptions;
}

/**
 * Actions bar for the user management page
 * Contains search, filters, and actions for managing users
 */
const UserActionsBar: React.FC<UserActionsBarProps> = ({
  onSearch,
  onAddUser,
  onRefresh,
  onRoleChange,
  onDepartmentFilter,
  onResetFilters,
  loading,
  departments,
  filterOptions,
}) => {
  const theme = useTheme();
  // Local state for search box
  const [searchTerm, setSearchTerm] = useState(filterOptions.search || "");

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  // Clear search input
  const handleClearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  // Determine if any filters are active
  const hasActiveFilters = Boolean(
    filterOptions.role || filterOptions.departmentId || filterOptions.search
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        p: 2,
        gap: 2,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      {/* Search field */}
      <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: 400 } }}>
        <TextField
          fullWidth
          placeholder="Search users by name or email"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={loading}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="clear search"
                  onClick={handleClearSearch}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Divider for mobile */}
      <Box sx={{ display: { xs: "block", md: "none" }, width: "100%" }}>
        <Divider />
      </Box>

      {/* Filter area */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        {/* Role filter */}
        <FormControl size="small" sx={{ minWidth: 120 }} disabled={loading}>
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            id="role-filter"
            value={filterOptions.role || ""}
            label="Role"
            onChange={(e) =>
              onRoleChange((e.target.value as Role) || undefined)
            }
            displayEmpty
            startAdornment={
              <FilterIcon color="action" sx={{ fontSize: 18, mr: 0.5 }} />
            }
          >
            <MenuItem value="">
              <em>All Roles</em>
            </MenuItem>
            {Object.values(Role).map((role) => (
              <MenuItem key={role} value={role}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Chip
                    label={role}
                    size="small"
                    color={getRoleColor(role as Role)}
                    sx={{ mr: 1, minWidth: 70 }}
                  />
                  <Typography variant="body2">
                    {getRoleDisplayName(role as Role)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Department filter */}
        <FormControl size="small" sx={{ minWidth: 150 }} disabled={loading}>
          <InputLabel id="department-filter-label">Department</InputLabel>
          <Select
            labelId="department-filter-label"
            id="department-filter"
            value={filterOptions.departmentId || ""}
            label="Department"
            onChange={(e) =>
              onDepartmentFilter((e.target.value as number) || undefined)
            }
            displayEmpty
            startAdornment={
              <BusinessIcon color="action" sx={{ fontSize: 18, mr: 0.5 }} />
            }
          >
            <MenuItem value="">
              <em>All Departments</em>
            </MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reset filters button - only shown when filters are active */}
        {hasActiveFilters && (
          <Tooltip title="Reset all filters">
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onResetFilters}
              sx={{
                ml: { xs: 0, md: 1 },
                borderRadius: 2,
                bgcolor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
                "&:hover": {
                  bgcolor: theme.palette.error.main,
                },
              }}
            >
              Clear
            </Button>
          </Tooltip>
        )}

        {/* Divider */}
        <Divider orientation="vertical" flexItem sx={{ height: 28, mx: 1 }} />

        {/* Action buttons */}
        <Box>
          <Tooltip title="Refresh user list">
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{
                bgcolor: theme.palette.grey[100],
                "&:hover": {
                  bgcolor: theme.palette.grey[200],
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Tooltip title="Add new user">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddUser}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Add User
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default UserActionsBar;
