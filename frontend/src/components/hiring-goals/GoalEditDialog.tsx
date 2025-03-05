import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Chip,
  OutlinedInput,
  FormHelperText,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { DepartmentWithGoal } from "../../types/hiring-goal";
import { HiringGoalPriority, HiringGoalStatus } from "../../types/hiring-enums";

interface GoalEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDepartment: DepartmentWithGoal | null;
  selectedTarget: number;
  setSelectedTarget: (value: number) => void;
  selectedStartDate: Date | null;
  setSelectedStartDate: (date: Date | null) => void;
  selectedEndDate: Date | null;
  setSelectedEndDate: (date: Date | null) => void;
  selectedPriority: HiringGoalPriority;
  setSelectedPriority: (priority: HiringGoalPriority) => void;
  selectedStatus: HiringGoalStatus;
  setSelectedStatus: (status: HiringGoalStatus) => void;
  selectedNotes: string;
  setSelectedNotes: (notes: string) => void;
  selectedBudget: number;
  setSelectedBudget: (budget: number) => void;
  selectedRecruiters: number[];
  setSelectedRecruiters: (recruiters: number[]) => void;
  availableRecruiters: Array<{ id: number; name: string }>;
  companyTheme: any;
}

const GoalEditDialog: React.FC<GoalEditDialogProps> = ({
  open,
  onClose,
  onSave,
  selectedDepartment,
  selectedTarget,
  setSelectedTarget,
  selectedStartDate,
  setSelectedStartDate,
  selectedEndDate,
  setSelectedEndDate,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  selectedNotes,
  setSelectedNotes,
  selectedBudget,
  setSelectedBudget,
  selectedRecruiters,
  setSelectedRecruiters,
  availableRecruiters,
  companyTheme,
}) => {
  if (!selectedDepartment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="edit-department-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="edit-department-dialog-title">
        Edit Department Hiring Goal
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Update the hiring target and parameters for{" "}
          <strong>{selectedDepartment.name}</strong>.
        </DialogContentText>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Target Headcount"
              type="number"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(Number(e.target.value))}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Budget ($)"
              type="number"
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(Number(e.target.value))}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ mb: 2 }}
              helperText="Recruiting budget for this hiring goal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedPriority}
                onChange={(e) =>
                  setSelectedPriority(e.target.value as HiringGoalPriority)
                }
                label="Priority"
              >
                <MenuItem value={HiringGoalPriority.HIGH}>High</MenuItem>
                <MenuItem value={HiringGoalPriority.MEDIUM}>Medium</MenuItem>
                <MenuItem value={HiringGoalPriority.LOW}>Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as HiringGoalStatus)
                }
                label="Status"
              >
                <MenuItem value={HiringGoalStatus.NOT_STARTED}>
                  Not Started
                </MenuItem>
                <MenuItem value={HiringGoalStatus.IN_PROGRESS}>
                  In Progress
                </MenuItem>
                <MenuItem value={HiringGoalStatus.ON_TRACK}>On Track</MenuItem>
                <MenuItem value={HiringGoalStatus.AT_RISK}>At Risk</MenuItem>
                <MenuItem value={HiringGoalStatus.COMPLETED}>
                  Completed
                </MenuItem>
                <MenuItem value={HiringGoalStatus.CANCELLED}>
                  Cancelled
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Start Date"
              value={selectedStartDate}
              onChange={(date) => setSelectedStartDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <DatePicker
              label="End Date"
              value={selectedEndDate}
              onChange={(date) => setSelectedEndDate(date)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={selectedNotes}
              onChange={(e) => setSelectedNotes(e.target.value)}
              placeholder="Add any relevant notes about this hiring goal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="recruiters-label">Assign Recruiters</InputLabel>
              <Select
                labelId="recruiters-label"
                multiple
                value={selectedRecruiters}
                onChange={(e) =>
                  setSelectedRecruiters(e.target.value as number[])
                }
                input={<OutlinedInput label="Assign Recruiters" />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const recruiter = availableRecruiters.find(
                        (r) => r.id === value
                      );
                      return (
                        <Chip
                          key={value}
                          label={
                            recruiter ? recruiter.name : `Recruiter #${value}`
                          }
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 224,
                      width: 250,
                    },
                  },
                }}
              >
                {availableRecruiters.map((recruiter) => (
                  <MenuItem key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Assign recruiters who will be responsible for this hiring goal
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={{
            background:
              companyTheme.primaryGradient ||
              "linear-gradient(135deg, #1E3A5F, #3B4D61)",
            color: companyTheme.contrastText || "white",
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalEditDialog;
