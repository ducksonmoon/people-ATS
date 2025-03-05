import React, { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Link,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useCompanyTheme } from "../hooks/useCompanyTheme";

/**
 * Form data interface for login
 */
interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Form validation errors interface
 */
interface FormErrors {
  email?: string;
  password?: string;
}

/**
 * Login form component with validation and improved UI/UX
 */
const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const companyTheme = useCompanyTheme();

  // Redux state
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  // Local state
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Clear auth errors when component mounts
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  /**
   * Validates form input
   * @returns boolean indicating if form is valid
   */
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  /**
   * Handles input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific field error when user starts typing again
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  /**
   * Toggles password visibility
   */
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Dispatch login start action
    dispatch(loginStart());

    try {
      const response = await loginUser(formData.email, formData.password);

      // Dispatch success with user data and tokens
      dispatch(
        loginSuccess({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: response.user,
        })
      );

      // Navigate to home page
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);

      // Show appropriate error message based on error type
      const errorMessage =
        err.response?.status === 401
          ? "Invalid email or password"
          : err.response?.data?.message ||
            "An error occurred during login. Please try again.";

      dispatch(loginFailure(errorMessage));
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: "450px",
          borderRadius: 2,
          borderTop: 4,
          borderColor: companyTheme.primary || "primary.main",
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          align="center"
          sx={{ mb: 3, fontWeight: 600 }}
          color={companyTheme.primary || "primary.main"}
        >
          Log In to Your Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            id="email"
            name="email"
            label="Email Address"
            variant="outlined"
            fullWidth
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={submitted && !!formErrors.email}
            helperText={submitted && formErrors.email}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={submitted && !!formErrors.password}
            helperText={submitted && formErrors.password}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: companyTheme.primary || "primary.main",
              "&:hover": {
                bgcolor: companyTheme.primaryDark || "primary.dark",
              },
              position: "relative",
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                color="inherit"
                sx={{ position: "absolute" }}
              />
            ) : (
              "Log In"
            )}
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                variant="body2"
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginForm;
