import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import { User } from "../../types/user";
import { getRoleColor } from "./UserUtils";

interface UserDeleteDialogProps {
  open: boolean;
  user: User | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog for deleting a user
 */
const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  open,
  user,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 3,
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "error.light",
          color: "error.contrastText",
          display: "flex",
          alignItems: "center",
        }}
      >
        <WarningIcon sx={{ mr: 1 }} />
        Delete User
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ fontWeight: "medium" }}
        >
          Are you sure you want to delete this user?
        </Typography>
        <Typography color="text.secondary" gutterBottom paragraph>
          This action cannot be undone.
        </Typography>

        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "background.default",
            borderRadius: 1,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar alt={user.name} sx={{ width: 56, height: 56 }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6">{user.name}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <EmailIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Chip
                label={user.role}
                color={getRoleColor(user.role)}
                size="small"
                sx={{ fontWeight: "medium" }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          {loading ? "Deleting..." : "Delete User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDeleteDialog;
