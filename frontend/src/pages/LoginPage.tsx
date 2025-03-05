import React, { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Box,
  Divider,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../services/authService";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  selectAuthLoading,
  selectAuthError,
  clearAuthError,
} from "../redux/authSlice";
import { useForm, Controller } from "react-hook-form";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import AuthLayout from "../components/AuthLayout";

// Define the form data type for better type safety
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Unified login page that handles all user types
 */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  // State
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Redux state
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Login form submission handler
  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());

    try {
      const response = await loginUser(data.email, data.password);

      // Login successful
      dispatch(
        loginSuccess({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: response.user,
        })
      );

      // Redirect based on user role
      if (response.user.role === "ADMIN") {
        navigate("/settings");
      } else if (response.user.role === "RECRUITER") {
        navigate("/dashboard/recruiter");
      } else if (response.user.role === "HR") {
        navigate("/dashboard/hr");
      } else {
        // For candidates and other roles
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      dispatch(loginFailure("Invalid email or password. Please try again."));
    }
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
        Sign In
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 3, color: "text.secondary" }}>
        Access your People ATS account
      </Typography>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Login form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
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
              variant="outlined"
              fullWidth
              autoComplete="email"
              sx={{ mb: 2 }}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
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
              autoComplete="current-password"
              sx={{ mb: 3 }}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: "bold",
            borderRadius: 2,
            mb: 3,
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
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          Forgot your password?{" "}
          <RouterLink
            to="/forgot-password"
            style={{
              fontWeight: "bold",
              color: theme.palette.secondary.main,
              textDecoration: "none",
            }}
          >
            Reset here
          </RouterLink>
        </Typography>

        <Typography variant="body2">
          Don't have an account?{" "}
          <RouterLink
            to="/register"
            style={{
              fontWeight: "bold",
              color: theme.palette.secondary.main,
              textDecoration: "none",
            }}
          >
            Sign Up
          </RouterLink>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default LoginPage;
