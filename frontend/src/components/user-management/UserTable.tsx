import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { User } from "../../types/user";
import { getRoleColor, getRoleAvatarColor, formatDate } from "./UserUtils";

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

/**
 * Component for displaying users in a table with actions
 */
const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show empty state
  if (users.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No users found
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 650 }} aria-label="users table">
        <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
          <TableRow>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Name
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Email
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Role
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Department
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Hire Date
            </TableCell>
            <TableCell sx={{ color: "white", fontWeight: "bold" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              sx={{
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                },
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onClick={() => onEdit(user)}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      bgcolor: getRoleAvatarColor(user.role, theme),
                      mr: 2,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body1">{user.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={user.role}
                  color={getRoleColor(user.role)}
                  size="small"
                  sx={{ fontWeight: "medium" }}
                />
              </TableCell>
              <TableCell>
                {user.department ? user.department.name : "-"}
              </TableCell>
              <TableCell>{formatDate(user.hireDate)}</TableCell>
              <TableCell
                onClick={(e) => e.stopPropagation()}
                sx={{ width: "120px" }}
              >
                <Box sx={{ display: "flex" }}>
                  <Tooltip title="Edit User">
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user);
                      }}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user);
                      }}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
