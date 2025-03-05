import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { DepartmentWithGoal } from "../../types/hiring-goal";

interface GoalDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentToDelete: DepartmentWithGoal | null;
}

const GoalDeleteDialog: React.FC<GoalDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  departmentToDelete,
}) => {
  if (!departmentToDelete) return null;

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="delete-dialog-title">
      <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete the hiring goal for{" "}
          <strong>{departmentToDelete.name}</strong>? This action will be
          finalized when you click "Save Changes" on the main screen.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalDeleteDialog;
