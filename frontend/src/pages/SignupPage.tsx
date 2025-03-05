import React, { useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../services/api";
import { loginSuccess } from "../redux/authSlice";
import { RootState } from "../redux/store";
import { useForm, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import AuthLayout from "../components/AuthLayout";

// Define form data type for better type safety
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  invitationCode: string;
}

// Invitation codes would ideally be stored securely on the backend
const INVITATION_CODES = {
  RECRUITER: "RECRUIT2023",
  ADMIN: "ADMIN2023",
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    React.useState<boolean>(false);

  // Use react-hook-form for better form handling and validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "CANDIDATE",
      invitationCode: "",
    },
  });

  // Watch the role field to conditionally display invitation code field
  const watchRole = watch("role");
  const watchPassword = watch("password");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (data: SignupFormData) => {
    setError(null);
    setSuccess(null);

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Verify invitation code for non-candidate roles
    if (data.role !== "CANDIDATE") {
      const requiredCode =
        INVITATION_CODES[data.role as keyof typeof INVITATION_CODES];
      if (data.invitationCode !== requiredCode) {
        setError(`Invalid invitation code for ${data.role} role.`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      // Automatically log in the user after signup
      dispatch(
        loginSuccess({
          accessToken: response.access_token,
          user: response.user,
        })
      );

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <AuthLayout maxWidth="sm">
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "primary.main",
          mb: 2,
        }}
      >
        Sign Up
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Controller
          name="name"
          control={control}
          rules={{
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Full Name"
              variant="outlined"
              fullWidth
              autoComplete="name"
              sx={{ mb: 2 }}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              autoComplete="email"
              sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              autoComplete="new-password"
              sx={{ mb: 2 }}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: "Please confirm your password",
            validate: (value) =>
              value === watchPassword || "Passwords do not match",
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              autoComplete="new-password"
              sx={{ mb: 2 }}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="role"
          control={control}
          rules={{ required: "Please select a role" }}
          render={({ field }) => (
            <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-select-label">User Type</InputLabel>
              <Select
                {...field}
                labelId="role-select-label"
                label="User Type"
                error={!!errors.role}
              >
                <MenuItem value="CANDIDATE">Candidate</MenuItem>
                <MenuItem value="RECRUITER">Recruiter</MenuItem>
                <MenuItem value="ADMIN">Administrator</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        <Collapse in={watchRole !== "CANDIDATE"}>
          <Controller
            name="invitationCode"
            control={control}
            rules={{
              required:
                watchRole !== "CANDIDATE"
                  ? "Invitation code is required"
                  : false,
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Invitation Code"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                error={!!errors.invitationCode}
                helperText={
                  errors.invitationCode?.message ||
                  (watchRole !== "CANDIDATE"
                    ? `Please enter the invitation code for ${watchRole} role`
                    : "")
                }
              />
            )}
          />
        </Collapse>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: 2,
            mb: 2,
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
                : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>

        <Typography variant="body2">
          Already have an account?{" "}
          <RouterLink
            to="/login"
            style={{
              fontWeight: "bold",
              color: theme.palette.secondary.main,
              textDecoration: "none",
            }}
          >
            Sign In
          </RouterLink>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default SignupPage;
