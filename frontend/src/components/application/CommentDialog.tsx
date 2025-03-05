import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

interface CommentDialogProps {
  open: boolean;
  comment: string;
  loading: boolean;
  onClose: () => void;
  onAddComment: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Dialog for adding a comment to an application
 */
const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  comment,
  loading,
  onClose,
  onAddComment,
  onChange,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="comment-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="comment-dialog-title">Add Comment</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="comment"
          label="Comment"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={onChange}
          disabled={loading}
          placeholder="Enter your comment here..."
          InputProps={{
            sx: { fontFamily: "inherit" },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onAddComment}
          variant="contained"
          disabled={loading || !comment.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Adding..." : "Add Comment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommentDialog;
