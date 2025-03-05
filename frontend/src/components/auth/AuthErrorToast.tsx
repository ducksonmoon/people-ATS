import React, { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Component that displays authentication-related error messages
 * as toast notifications, particularly focused on session expiration
 * and other auth errors.
 */
const AuthErrorToast: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"error" | "warning" | "info">(
    "error"
  );
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query parameters to detect specific error conditions
    const params = new URLSearchParams(location.search);
    const sessionParam = params.get("session");
    const errorParam = params.get("error");
    const errorCode = params.get("errorCode");

    if (sessionParam === "expired") {
      setMessage("Your session has expired. Please log in again.");
      setSeverity("warning");
      setOpen(true);

      // Remove the query parameter after showing the message
      navigate(location.pathname, { replace: true });
    } else if (errorParam) {
      setMessage(decodeURIComponent(errorParam));
      setSeverity("error");
      setOpen(true);

      // Remove the query parameter after showing the message
      navigate(location.pathname, { replace: true });
    } else if (errorCode) {
      // Map error codes to user-friendly messages
      let errorMessage = "An authentication error occurred";

      switch (errorCode) {
        case "AUTH_INVALID_CREDENTIALS":
          errorMessage = "Invalid email or password";
          break;
        case "AUTH_ACCOUNT_NOT_ACTIVATED":
          errorMessage =
            "Your account has not been activated. Please check your email.";
          break;
        case "AUTH_EMAIL_IN_USE":
          errorMessage = "This email address is already in use.";
          break;
        case "AUTH_INSUFFICIENT_PERMISSIONS":
          errorMessage = "You do not have permission to access this resource.";
          break;
        default:
          errorMessage = "An authentication error occurred";
      }

      setMessage(errorMessage);
      setSeverity("error");
      setOpen(true);

      // Remove the query parameter after showing the message
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AuthErrorToast;
