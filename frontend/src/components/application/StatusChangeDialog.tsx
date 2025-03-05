import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";

interface StatusChangeDialogProps {
  open: boolean;
  status: string;
  loading: boolean;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onChange: (event: SelectChangeEvent) => void;
}

/**
 * Dialog for changing an application's status
 */
const StatusChangeDialog: React.FC<StatusChangeDialogProps> = ({
  open,
  status,
  loading,
  onClose,
  onStatusChange,
  onChange,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="status-dialog-title"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="status-dialog-title">
        Change Application Status
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={status}
            onChange={onChange}
            label="Status"
            disabled={loading}
          >
            <MenuItem value="PENDING">Pending Review</MenuItem>
            <MenuItem value="INTERVIEWING">Interviewing</MenuItem>
            <MenuItem value="OFFER_SENT">Offer Sent</MenuItem>
            <MenuItem value="HIRED">Hired</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={() => onStatusChange(status)}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Updating..." : "Update Status"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusChangeDialog;
