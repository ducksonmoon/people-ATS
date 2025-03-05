import React, { useState, useMemo } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stack,
  styled,
  useMediaQuery,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BusinessIcon from "@mui/icons-material/Business";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { registerAdmin } from "../services/api";
import { loginSuccess } from "../redux/authSlice";
import { User } from "../redux/authSlice"; // Import the User type

// Styled components for enhanced UI
const SetupContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(45deg, ${alpha(
    theme.palette.primary.dark,
    0.8
  )}, ${alpha(theme.palette.primary.main, 0.6)})`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4, 0),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  borderRadius: theme.shape.borderRadius * 2,
  background: "#fff",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(3),
  },
}));

const StepIcon = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 40,
  height: 40,
  marginRight: theme.spacing(2),
}));

// Interface for StepIconProps (similar to MUI's StepIconProps)
interface StepIconProps {
  active?: boolean;
  completed?: boolean;
  error?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  [key: string]: any; // For other props that might be passed
}

// Wrapper component to filter out non-DOM props before passing to Avatar
const StepIconWrapper: React.FC<StepIconProps> = ({
  active,
  completed,
  error,
  icon,
  children,
  ...otherProps
}) => {
  const theme = useTheme();

  // These boolean props shouldn't be passed directly to DOM elements
  // We use them for styling the avatar instead
  const avatarStyle = {
    backgroundColor: error
      ? theme.palette.error.main
      : active
      ? theme.palette.primary.main
      : completed
      ? theme.palette.success.main
      : theme.palette.grey[400],
  };

  // Remove boolean props to avoid React DOM warnings
  // Only pass safe props to the underlying DOM element
  const safeProps = { ...otherProps };
  delete safeProps.active;
  delete safeProps.completed;
  delete safeProps.error;

  return (
    <StepIcon sx={avatarStyle} {...safeProps}>
      {children}
    </StepIcon>
  );
};

// Types
interface AdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface CompanyFormData {
  companyName: string;
  companyWebsite: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  companyName?: string;
}

// Update the response type to account for our use case
interface AdminResponse {
  access_token: string;
  refresh_token: string;
  user?: User; // Use the User type from authSlice
}

// Custom hook for form handling
const useSetupForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [adminData, setAdminData] = useState<AdminFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [companyData, setCompanyData] = useState<CompanyFormData>({
    companyName: "",
    companyWebsite: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateAdminForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Name validation
    if (!adminData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(adminData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!adminData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (adminData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (adminData.password !== adminData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateCompanyForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!companyData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAdminDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanyDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    if (activeStep === 0 && validateAdminForm()) {
      setActiveStep(1);
    } else if (activeStep === 1 && validateCompanyForm()) {
      setActiveStep(2);
    }
  };

  const handlePreviousStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  return {
    activeStep,
    setActiveStep,
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    adminData,
    companyData,
    errors,
    validateAdminForm,
    validateCompanyForm,
    handleAdminDataChange,
    handleCompanyDataChange,
    handleNextStep,
    handlePreviousStep,
  };
};

// Password field component
const PasswordField: React.FC<{
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}> = ({ name, label, value, onChange, error }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      fullWidth
      margin="normal"
      name={name}
      label={label}
      type={showPassword ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={error}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

// Admin Form Component
const AdminForm: React.FC<{
  adminData: AdminFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
}> = ({ adminData, onChange, errors }) => (
  <Stack spacing={2} sx={{ mt: 2 }}>
    <TextField
      fullWidth
      label="Full Name"
      name="name"
      value={adminData.name}
      onChange={onChange}
      error={!!errors.name}
      helperText={errors.name}
    />

    <TextField
      fullWidth
      label="Email Address"
      name="email"
      type="email"
      value={adminData.email}
      onChange={onChange}
      error={!!errors.email}
      helperText={errors.email}
    />

    <PasswordField
      name="password"
      label="Password"
      value={adminData.password}
      onChange={onChange}
      error={errors.password}
    />

    <PasswordField
      name="confirmPassword"
      label="Confirm Password"
      value={adminData.confirmPassword}
      onChange={onChange}
      error={errors.confirmPassword}
    />
  </Stack>
);

// Company Form Component
const CompanyForm: React.FC<{
  companyData: CompanyFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: FormErrors;
}> = ({ companyData, onChange, errors }) => (
  <Stack spacing={2} sx={{ mt: 2 }}>
    <TextField
      fullWidth
      label="Company Name"
      name="companyName"
      value={companyData.companyName}
      onChange={onChange}
      error={!!errors.companyName}
      helperText={errors.companyName}
    />

    <TextField
      fullWidth
      label="Company Website"
      name="companyWebsite"
      value={companyData.companyWebsite}
      onChange={onChange}
      placeholder="https://example.com"
    />
  </Stack>
);

// Confirmation Component
const SetupConfirmation: React.FC<{
  adminData: AdminFormData;
  companyData: CompanyFormData;
}> = ({ adminData, companyData }) => (
  <Stack spacing={3} sx={{ mt: 2 }}>
    <Box>
      <Typography variant="h6" gutterBottom>
        Admin Information
      </Typography>
      <Box sx={{ pl: 2 }}>
        <Typography variant="body1">
          <strong>Name:</strong> {adminData.name}
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {adminData.email}
        </Typography>
      </Box>
    </Box>

    <Box>
      <Typography variant="h6" gutterBottom>
        Company Information
      </Typography>
      <Box sx={{ pl: 2 }}>
        <Typography variant="body1">
          <strong>Company Name:</strong> {companyData.companyName}
        </Typography>
        {companyData.companyWebsite && (
          <Typography variant="body1">
            <strong>Website:</strong> {companyData.companyWebsite}
          </Typography>
        )}
      </Box>
    </Box>

    <Typography variant="body2" color="text.secondary">
      By clicking "Complete Setup", you'll create your admin account and company
      profile. You'll be automatically logged in and redirected to the company
      settings page where you can further customize your ATS.
    </Typography>
  </Stack>
);

// Success Component
const SetupSuccess: React.FC = () => (
  <Fade in={true}>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 4,
      }}
    >
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Setup Complete!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Your admin account and company have been successfully created. You'll be
        redirected to the dashboard in a moment.
      </Typography>
      <CircularProgress size={24} />
    </Box>
  </Fade>
);

// Main component
const SetupPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    activeStep,
    loading,
    error,
    success,
    setLoading,
    setError,
    setSuccess,
    adminData,
    companyData,
    errors,
    validateAdminForm,
    validateCompanyForm,
    handleAdminDataChange,
    handleCompanyDataChange,
    handleNextStep,
    handlePreviousStep,
  } = useSetupForm();

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateAdminForm() || !validateCompanyForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Register admin and company
      const response = (await registerAdmin({
        admin: {
          name: adminData.name.trim(),
          email: adminData.email.trim().toLowerCase(),
          password: adminData.password,
          role: "ADMIN",
        },
        company: {
          name: companyData.companyName.trim(),
          website: companyData.companyWebsite
            ? companyData.companyWebsite.trim()
            : undefined,
        },
      })) as AdminResponse; // Cast to our custom interface

      // Show success message
      setSuccess(true);

      // Create a default user object if not present in response
      const userObject: User = response.user || {
        id: 0, // Placeholder ID until refresh
        name: adminData.name,
        email: adminData.email,
        role: "ADMIN",
      };

      // Auto login
      dispatch(
        loginSuccess({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: userObject,
        })
      );

      // Redirect after short delay to home page
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      console.error("Setup failed:", err);

      if (err.message && err.message.includes("admin already exists")) {
        setError(
          "An admin user already exists. Please use the login page instead."
        );
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          "An unexpected error occurred during setup. Please try again."
        );
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // Step configuration
  const steps = useMemo(
    () => [
      {
        label: "Create Admin Account",
        description: "Set up your administrator account",
        icon: <AdminPanelSettingsIcon />,
        content: (
          <AdminForm
            adminData={adminData}
            onChange={handleAdminDataChange}
            errors={errors}
          />
        ),
      },
      {
        label: "Company Information",
        description: "Enter your company details",
        icon: <BusinessIcon />,
        content: (
          <CompanyForm
            companyData={companyData}
            onChange={handleCompanyDataChange}
            errors={errors}
          />
        ),
      },
      {
        label: "Confirmation",
        description: "Review and confirm your setup",
        icon: <AccountCircleIcon />,
        content: (
          <SetupConfirmation adminData={adminData} companyData={companyData} />
        ),
      },
    ],
    [
      adminData,
      companyData,
      errors,
      handleAdminDataChange,
      handleCompanyDataChange,
    ]
  );

  return (
    <SetupContainer>
      <Container maxWidth="md">
        <StyledPaper elevation={5}>
          {success ? (
            <SetupSuccess />
          ) : (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 4,
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 50,
                    height: 50,
                  }}
                >
                  <AdminPanelSettingsIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Initial Setup
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Create your administrator account and company profile
                  </Typography>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Stepper
                activeStep={activeStep}
                orientation={isMobile ? "vertical" : "vertical"}
                sx={{ mb: 4 }}
              >
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconComponent={(props) => (
                        <StepIconWrapper {...props}>
                          {step.icon}
                        </StepIconWrapper>
                      )}
                    >
                      <Typography variant="h6">{step.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ py: 2 }}>{step.content}</Box>
                      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          onClick={
                            index === steps.length - 1
                              ? handleSubmit
                              : handleNextStep
                          }
                          disabled={loading}
                          sx={{
                            px: 4,
                            minWidth: 140,
                            height: 48,
                            borderRadius: 2,
                          }}
                        >
                          {loading && index === steps.length - 1 ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : index === steps.length - 1 ? (
                            "Complete Setup"
                          ) : (
                            "Continue"
                          )}
                        </Button>
                        {index > 0 && (
                          <Button
                            onClick={handlePreviousStep}
                            disabled={loading}
                            variant="outlined"
                            sx={{
                              minWidth: 100,
                              height: 48,
                              borderRadius: 2,
                            }}
                          >
                            Back
                          </Button>
                        )}
                      </Stack>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </>
          )}
        </StyledPaper>
      </Container>
    </SetupContainer>
  );
};

export default SetupPage;
