import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Autocomplete,
  Chip,
  Typography,
  Box,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Interviewer, InterviewFormState } from "../../types/application";

interface InterviewDialogProps {
  open: boolean;
  form: InterviewFormState;
  loading: boolean;
  interviewers: Interviewer[];
  onClose: () => void;
  onSchedule: () => void;
  onChange: (field: keyof InterviewFormState, value: any) => void;
}

/**
 * Dialog for scheduling an interview
 */
const InterviewDialog: React.FC<InterviewDialogProps> = ({
  open,
  form,
  loading,
  interviewers,
  onClose,
  onSchedule,
  onChange,
}) => {
  // State for filter controls
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);
  const [filteredInterviewers, setFilteredInterviewers] =
    useState<Interviewer[]>(interviewers);

  // Calculate suggested interviewers based on current interview type and department
  const suggestedInterviewers = React.useMemo(() => {
    // Different interview types might need different kinds of interviewers
    // For technical interviews, prioritize employees
    // For initial screenings, prioritize HR and recruiters
    // For manager interviews, prioritize senior employees

    const typeBasedSuggestions: Interviewer[] = [];
    let relevantRoles: string[] = [];

    // Determine relevant roles based on interview type
    switch (form.type) {
      case "TECHNICAL":
        relevantRoles = ["EMPLOYEE"]; // Technical interviews often done by technical employees
        break;
      case "INITIAL":
        relevantRoles = ["HR", "RECRUITER"]; // Initial screenings often done by HR or recruiters
        break;
      case "MANAGER":
        relevantRoles = ["ADMIN"]; // Manager interviews often done by leadership
        break;
      case "TEAM":
        relevantRoles = ["EMPLOYEE"]; // Team interviews often done by future teammates
        break;
      default:
        relevantRoles = ["HR", "RECRUITER", "ADMIN"]; // Default suggestion order
    }

    // Find interviewers with relevant roles
    interviewers.forEach((interviewer) => {
      if (relevantRoles.includes(interviewer.role || "")) {
        typeBasedSuggestions.push(interviewer);
      }
    });

    // Limit to 5 suggestions max
    return typeBasedSuggestions.slice(0, 5);
  }, [interviewers, form.type]);

  // Get unique departments from interviewers list
  const departments = React.useMemo(() => {
    const deptMap = new Map();
    interviewers.forEach((interviewer) => {
      if (interviewer.department) {
        deptMap.set(interviewer.department.id, interviewer.department);
      }
    });
    return Array.from(deptMap.values());
  }, [interviewers]);

  // Update filtered interviewers when filters or interviewers list changes
  useEffect(() => {
    let filtered = [...interviewers];

    // Apply role filter if set
    if (roleFilter) {
      filtered = filtered.filter(
        (interviewer) => interviewer.role === roleFilter
      );
    }

    // Apply department filter if set
    if (departmentFilter) {
      filtered = filtered.filter(
        (interviewer) => interviewer.department?.id === departmentFilter
      );
    }

    setFilteredInterviewers(filtered);
  }, [roleFilter, departmentFilter, interviewers]);

  // Handle role filter changes
  const handleRoleFilterChange = (
    event: React.MouseEvent<HTMLElement>,
    newRole: string | null
  ) => {
    setRoleFilter(newRole);
  };

  // Handle department filter changes
  const handleDepartmentFilterChange = (
    event: SelectChangeEvent<number | string>
  ) => {
    const value = event.target.value;
    setDepartmentFilter(value === "" ? null : Number(value));
  };

  // Helper to handle date changes
  const handleDateChange = (newDate: Date | null) => {
    onChange("date", newDate);
  };

  // Helper to handle text field changes
  const handleTextChange =
    (field: keyof InterviewFormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(field, e.target.value);
    };

  // Helper to handle select changes
  const handleSelectChange =
    (field: keyof InterviewFormState) =>
    (e: SelectChangeEvent<string | number>) => {
      onChange(field, e.target.value);
    };

  // Helper to validate form
  const isFormValid = () => {
    return !!form.date && !!form.interviewer && form.duration >= 15;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="interview-dialog-title"
      >
        <DialogTitle id="interview-dialog-title">
          Schedule Interview
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DateTimePicker
                label="Interview Date and Time"
                value={form.date}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    disabled: loading,
                    required: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={form.duration}
                onChange={handleTextChange("duration")}
                InputProps={{ inputProps: { min: 15, step: 15 } }}
                margin="normal"
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="interview-type-label">
                  Interview Type
                </InputLabel>
                <Select
                  labelId="interview-type-label"
                  id="interview-type"
                  value={form.type}
                  onChange={handleSelectChange("type")}
                  label="Interview Type"
                  disabled={loading}
                >
                  <MenuItem value="INITIAL">Initial Screening</MenuItem>
                  <MenuItem value="TECHNICAL">Technical Interview</MenuItem>
                  <MenuItem value="MANAGER">Manager Interview</MenuItem>
                  <MenuItem value="TEAM">Team Interview</MenuItem>
                  <MenuItem value="FINAL">Final Interview</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mb: 1, display: "flex", alignItems: "center" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="16"
                    viewBox="0 0 24 24"
                    width="16"
                    fill="currentColor"
                    style={{ marginRight: 4 }}
                  >
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                  Quick Filter by Role:
                </Typography>
                <ToggleButtonGroup
                  value={roleFilter}
                  exclusive
                  onChange={handleRoleFilterChange}
                  aria-label="role filter"
                  size="small"
                  sx={{ mb: 1 }}
                >
                  <ToggleButton
                    value="ADMIN"
                    aria-label="admin"
                    sx={{
                      borderColor: "error.main",
                      color: roleFilter === "ADMIN" ? "white" : "error.main",
                      bgcolor:
                        roleFilter === "ADMIN" ? "error.main" : "transparent",
                      "&:hover": {
                        bgcolor:
                          roleFilter === "ADMIN" ? "error.dark" : "error.light",
                        color: roleFilter === "ADMIN" ? "white" : "error.main",
                      },
                    }}
                  >
                    Admin
                  </ToggleButton>
                  <ToggleButton
                    value="HR"
                    aria-label="hr"
                    sx={{
                      borderColor: "secondary.main",
                      color: roleFilter === "HR" ? "white" : "secondary.main",
                      bgcolor:
                        roleFilter === "HR" ? "secondary.main" : "transparent",
                      "&:hover": {
                        bgcolor:
                          roleFilter === "HR"
                            ? "secondary.dark"
                            : "secondary.light",
                        color: roleFilter === "HR" ? "white" : "secondary.main",
                      },
                    }}
                  >
                    HR
                  </ToggleButton>
                  <ToggleButton
                    value="RECRUITER"
                    aria-label="recruiter"
                    sx={{
                      borderColor: "primary.main",
                      color:
                        roleFilter === "RECRUITER" ? "white" : "primary.main",
                      bgcolor:
                        roleFilter === "RECRUITER"
                          ? "primary.main"
                          : "transparent",
                      "&:hover": {
                        bgcolor:
                          roleFilter === "RECRUITER"
                            ? "primary.dark"
                            : "primary.light",
                        color:
                          roleFilter === "RECRUITER" ? "white" : "primary.main",
                      },
                    }}
                  >
                    Recruiter
                  </ToggleButton>
                  <ToggleButton
                    value="EMPLOYEE"
                    aria-label="employee"
                    sx={{
                      borderColor: "success.main",
                      color:
                        roleFilter === "EMPLOYEE" ? "white" : "success.main",
                      bgcolor:
                        roleFilter === "EMPLOYEE"
                          ? "success.main"
                          : "transparent",
                      "&:hover": {
                        bgcolor:
                          roleFilter === "EMPLOYEE"
                            ? "success.dark"
                            : "success.light",
                        color:
                          roleFilter === "EMPLOYEE" ? "white" : "success.main",
                      },
                    }}
                  >
                    Employee
                  </ToggleButton>
                  <ToggleButton
                    value={null}
                    aria-label="all"
                    sx={{ borderColor: "text.secondary" }}
                  >
                    All
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box
                  sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}
                >
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mr: 2, display: "flex", alignItems: "center" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="16"
                      viewBox="0 0 24 24"
                      width="16"
                      fill="currentColor"
                      style={{ marginRight: 4 }}
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                    </svg>
                    Filter by Department:
                  </Typography>
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <Select
                      value={departmentFilter || ""}
                      onChange={handleDepartmentFilterChange}
                      displayEmpty
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {(roleFilter || departmentFilter) && (
                    <Button
                      size="small"
                      onClick={() => {
                        setRoleFilter(null);
                        setDepartmentFilter(null);
                      }}
                      sx={{ ml: 1 }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </Box>
              </FormControl>
              <FormControl fullWidth margin="normal" required>
                <Autocomplete
                  id="interviewer-select"
                  options={filteredInterviewers}
                  getOptionLabel={(option) => option.name}
                  value={
                    interviewers.find((i) => i.id === form.interviewer) || null
                  }
                  onChange={(event, newValue) => {
                    onChange("interviewer", newValue ? newValue.id : null);
                  }}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Interviewer"
                      required
                      placeholder="Search by name, email, department, or role..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Box
                              component="span"
                              sx={{
                                color: "action.active",
                                mr: 1,
                                display: "flex",
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20"
                                viewBox="0 0 24 24"
                                width="20"
                                fill="currentColor"
                              >
                                <path d="M0 0h24v24H0z" fill="none" />
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                              </svg>
                            </Box>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                      }}
                      helperText={`${filteredInterviewers.length} interviewers available`}
                    />
                  )}
                  renderOption={(props, option) => {
                    const isSuggested = suggestedInterviewers.some(
                      (suggested) => suggested.id === option.id
                    );
                    return (
                      <Box component="li" {...props}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor:
                                option.role === "ADMIN"
                                  ? "error.main"
                                  : option.role === "HR"
                                  ? "secondary.main"
                                  : option.role === "EMPLOYEE"
                                  ? "success.main"
                                  : "primary.main",
                              mr: 1,
                            }}
                          >
                            {option.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box
                            sx={{
                              ml: 1,
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1">
                                {option.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {option.email}{" "}
                                {option.department &&
                                  `• ${option.department.name}`}
                                {" • "}
                                {option.role === "ADMIN"
                                  ? "Administrator"
                                  : option.role === "HR"
                                  ? "HR Personnel"
                                  : option.role === "RECRUITER"
                                  ? "Recruiter"
                                  : "Employee"}
                              </Typography>
                            </Box>
                            {isSuggested && (
                              <Chip
                                label="Suggested"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  }}
                  loading={loading}
                  loadingText="Loading interviewers..."
                  noOptionsText={
                    interviewers.length === 0
                      ? "No interviewers available"
                      : "No interviewers match your search"
                  }
                  ListboxProps={{
                    style: {
                      maxHeight: "300px",
                    },
                  }}
                  renderGroup={(params) => (
                    <li key={params.key}>
                      <Box
                        component="div"
                        sx={{
                          p: 1,
                          fontWeight: "bold",
                          backgroundColor: (theme) =>
                            theme.palette.background.default,
                          color: (theme) => theme.palette.primary.main,
                        }}
                      >
                        {params.group}
                      </Box>
                      <ul style={{ padding: 0 }}>{params.children}</ul>
                    </li>
                  )}
                  // Add a "Suggested Interviewers" section at the beginning if we have any
                  groupBy={(option) => {
                    // If the option is in the suggested interviewers list, put it in a special group
                    if (
                      suggestedInterviewers.some(
                        (suggested) => suggested.id === option.id
                      )
                    ) {
                      return "Suggested Interviewers";
                    }

                    // If the option has a department, group by department
                    if (option.department?.name) {
                      return `Department: ${option.department.name}`;
                    }
                    // Otherwise, group by role as a fallback
                    return `Role: ${
                      option.role === "ADMIN"
                        ? "Administrator"
                        : option.role === "HR"
                        ? "HR Personnel"
                        : option.role === "RECRUITER"
                        ? "Recruiter"
                        : "Employee"
                    }`;
                  }}
                  filterOptions={(options, state) => {
                    if (!state.inputValue) {
                      return options;
                    }

                    const inputValue = state.inputValue.toLowerCase();

                    // Enhanced filtering that also matches role and complete phrases
                    return options.filter((option) => {
                      // Search in name, email, department, and role
                      const nameMatch = option.name
                        .toLowerCase()
                        .includes(inputValue);
                      const emailMatch =
                        option.email &&
                        option.email.toLowerCase().includes(inputValue);
                      const deptMatch =
                        option.department &&
                        option.department.name
                          .toLowerCase()
                          .includes(inputValue);

                      // Match friendly role names that we display
                      const roleText =
                        option.role === "ADMIN"
                          ? "administrator"
                          : option.role === "HR"
                          ? "hr personnel"
                          : option.role === "RECRUITER"
                          ? "recruiter"
                          : "employee";
                      const roleMatch = roleText.includes(inputValue);

                      return nameMatch || emailMatch || deptMatch || roleMatch;
                    });
                  }}
                  sx={{
                    "& .MuiAutocomplete-groupLabel": {
                      backgroundColor: (theme) =>
                        theme.palette.background.default,
                      fontWeight: "bold",
                      color: (theme) => theme.palette.primary.main,
                    },
                    "& .MuiAutocomplete-groupUl": {
                      padding: "4px 0",
                    },
                  }}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Interview Location"
                fullWidth
                value={form.location}
                onChange={handleTextChange("location")}
                margin="normal"
                placeholder="Office, Conference Room, etc."
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Meeting Link"
                fullWidth
                value={form.meetingLink}
                onChange={handleTextChange("meetingLink")}
                margin="normal"
                placeholder="Zoom, Google Meet, etc."
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Interview Notes"
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={handleTextChange("notes")}
                margin="normal"
                placeholder="Additional information for the interviewer and candidate"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onSchedule}
            variant="contained"
            disabled={loading || !isFormValid()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Scheduling..." : "Schedule"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default InterviewDialog;
