import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Divider,
  InputAdornment,
  Chip,
  FormHelperText,
  useTheme,
  alpha,
  Avatar,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  VpnKey as PasswordIcon,
  BusinessCenter as DepartmentIcon,
  CalendarMonth as CalendarIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  User,
  Role,
  Department,
  CreateUserFormData,
  UpdateUserFormData,
} from "../../types/user";
import {
  getRoleColor,
  getRoleDisplayName,
  emptyCreateUserForm,
  emptyUpdateUserForm,
} from "./UserUtils";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import isValid from "date-fns/isValid";

// Validation schemas
const createUserSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  role: yup.string().required("Role is required"),
  departmentId: yup.number().nullable().optional(),
  hireDate: yup.date().nullable().optional(),
});

const updateUserSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  password: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test(
      "passwordLength",
      "Password must be at least 8 characters",
      (value) => value === null || value === undefined || value.length >= 8
    ),
  confirmPassword: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test("passwordMatch", "Passwords must match", function (value) {
      const { password } = this.parent;
      if (!password) return true;
      return password === value;
    }),
  role: yup.string().required("Role is required"),
  departmentId: yup.number().nullable().optional(),
  hireDate: yup.date().nullable().optional(),
  endDate: yup
    .date()
    .nullable()
    .optional()
    .test(
      "dateAfterHire",
      "End date must be after hire date",
      function (endDate) {
        const { hireDate } = this.parent;
        if (!endDate || !hireDate) return true;
        return new Date(endDate) > new Date(hireDate);
      }
    ),
});

interface UserFormProps {
  open: boolean;
  mode: "create" | "edit";
  user?: User | null;
  departments: Department[];
  loading: boolean;
  formErrors?: Record<string, string>;
  onClose: () => void;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData) => void;
  clearFormErrors?: () => void;
}

/**
 * Form component for creating or editing users
 */
const UserForm: React.FC<UserFormProps> = ({
  open,
  mode,
  user,
  departments,
  loading,
  formErrors = {},
  onClose,
  onSubmit,
  clearFormErrors,
}) => {
  const theme = useTheme();
  const previousOpenRef = useRef(open);
  const initialSetupDoneRef = useRef(false);

  // Use the appropriate schema based on mode
  const schema = mode === "create" ? createUserSchema : updateUserSchema;

  // Parse dates correctly for the form
  const getInitialDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = parseISO(dateString);
      return isValid(date) ? date : null;
    } catch (e) {
      return null;
    }
  };

  // Initialize form with default values
  const getDefaultValues = () => {
    if (mode === "create") {
      return emptyCreateUserForm;
    }

    return user
      ? {
          name: user.name || "",
          email: user.email || "",
          password: "",
          confirmPassword: "",
          role: user.role,
          departmentId: user.departmentId || null,
          hireDate: getInitialDate(user.hireDate),
          endDate: getInitialDate(user.endDate),
        }
      : emptyUpdateUserForm;
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    reset,
    watch,
    setError,
  } = useForm({
    defaultValues: getDefaultValues(),
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  // Watch the password field for dependent validation
  const watchPassword = watch("password");

  // Reset form when dialog opens/closes
  useEffect(() => {
    // Only reset the form when the dialog transitions from closed to open
    if (open && !previousOpenRef.current) {
      if (clearFormErrors) clearFormErrors();
      reset(getDefaultValues());
      initialSetupDoneRef.current = true;
    }

    // Update the previous open state
    previousOpenRef.current = open;
  }, [open, clearFormErrors, reset]);

  // Handle server-side validation errors
  useEffect(() => {
    if (Object.keys(formErrors).length > 0 && initialSetupDoneRef.current) {
      Object.entries(formErrors).forEach(([field, message]) => {
        setError(field as any, {
          type: "server",
          message: Array.isArray(message) ? message[0] : message,
        });
      });
    }
  }, [formErrors, setError]);

  // Submit handler
  const onFormSubmit = (data: any) => {
    // Prepare data for submission
    const submissionData = { ...data };

    // In edit mode, only include fields that have changed
    if (mode === "edit" && user) {
      // Only send modified fields in the update
      const changedData = Object.keys(dirtyFields).reduce((acc: any, key) => {
        acc[key] = submissionData[key];
        return acc;
      }, {});

      // Always include ID
      changedData.id = user.id;

      // Format dates for API
      if (changedData.hireDate) {
        changedData.hireDate = format(
          new Date(changedData.hireDate),
          "yyyy-MM-dd"
        );
      }

      if (changedData.endDate) {
        changedData.endDate = format(
          new Date(changedData.endDate),
          "yyyy-MM-dd"
        );
      }

      // If this is a real edit (not just opening the form), submit
      if (Object.keys(changedData).length > 1) {
        // > 1 because it always includes the ID
        onSubmit(changedData);
      } else {
        // Close without submitting if no changes
        onClose();
      }
    } else {
      // Format dates for create operation
      if (submissionData.hireDate) {
        submissionData.hireDate = format(
          new Date(submissionData.hireDate),
          "yyyy-MM-dd"
        );
      }

      if (submissionData.endDate) {
        submissionData.endDate = format(
          new Date(submissionData.endDate),
          "yyyy-MM-dd"
        );
      }

      onSubmit(submissionData);
    }
  };

  // Get title and icon based on mode
  const title = mode === "create" ? "Create New User" : "Edit User";
  const TitleIcon = mode === "create" ? PersonAddIcon : EditIcon;
  const SubmitIcon = mode === "create" ? PersonAddIcon : SaveIcon;
  const submitText = mode === "create" ? "Create User" : "Save Changes";
  const loadingText = mode === "create" ? "Creating..." : "Saving...";

  // Check if form has been modified (for save button state)
  const isFormModified = mode === "create" || isDirty;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: {
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.primary.main,
          color: "white",
          display: "flex",
          alignItems: "center",
          p: 2,
        }}
      >
        <TitleIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 500 }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent sx={{ py: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              {/* User information section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                  User Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Name */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      fullWidth
                      type="email"
                      required
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={
                        mode === "create"
                          ? "Password"
                          : "New Password (optional)"
                      }
                      fullWidth
                      type="password"
                      required={mode === "create"}
                      error={!!errors.password}
                      helperText={
                        errors.password?.message ||
                        (mode === "edit"
                          ? "Leave blank to keep current password"
                          : "")
                      }
                      disabled={loading}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PasswordIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm Password"
                      fullWidth
                      type="password"
                      required={mode === "create" || !!watchPassword}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={loading || (mode === "edit" && !watchPassword)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PasswordIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Role selection section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <DepartmentIcon fontSize="small" sx={{ mr: 1 }} />
                  Role & Department
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      required
                      error={!!errors.role}
                      disabled={loading}
                    >
                      <InputLabel id="role-label">User Role</InputLabel>
                      <Select
                        {...field}
                        labelId="role-label"
                        label="User Role"
                        renderValue={(selected) => (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Chip
                              avatar={
                                <Avatar sx={{ bgcolor: "transparent" }}>
                                  <PersonIcon sx={{ color: "white" }} />
                                </Avatar>
                              }
                              label={selected as string}
                              color={getRoleColor(selected as Role)}
                              sx={{
                                fontWeight: "medium",
                                minWidth: 100,
                                "& .MuiChip-avatar": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.2
                                  ),
                                },
                              }}
                            />
                          </Box>
                        )}
                      >
                        {Object.values(Role).map((role) => (
                          <MenuItem key={role} value={role}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Chip
                                label={role}
                                color={getRoleColor(role as Role)}
                                size="small"
                                sx={{ mr: 1, minWidth: 80 }}
                              />
                              <Typography>
                                {getRoleDisplayName(role as Role)}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.role && (
                        <FormHelperText error>
                          {errors.role.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      error={!!errors.departmentId}
                      disabled={loading}
                    >
                      <InputLabel id="department-label">Department</InputLabel>
                      <Select
                        {...field}
                        labelId="department-label"
                        label="Department"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? null : e.target.value
                          )
                        }
                        startAdornment={
                          <InputAdornment position="start">
                            <DepartmentIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {departments.map((dept) => (
                          <MenuItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.departmentId && (
                        <FormHelperText error>
                          {errors.departmentId.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Dates section */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                  Employment Dates
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              {/* Hire Date */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="hireDate"
                  control={control}
                  render={({ field: { onChange, value, ...restField } }) => (
                    <DatePicker
                      label="Hire Date"
                      value={value}
                      onChange={onChange}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.hireDate,
                          helperText: errors.hireDate?.message,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon color="primary" />
                              </InputAdornment>
                            ),
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* End Date - only for edit mode */}
              {mode === "edit" && (
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field: { onChange, value, ...restField } }) => (
                      <DatePicker
                        label="End Date"
                        value={value}
                        onChange={onChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.endDate,
                            helperText: errors.endDate?.message,
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon color="primary" />
                                </InputAdornment>
                              ),
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              )}
            </Grid>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              reset(); // Reset form state
              onClose();
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !isFormModified}
            startIcon={
              loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SubmitIcon />
              )
            }
          >
            {loading ? loadingText : submitText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
