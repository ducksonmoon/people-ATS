import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../services/authService";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  selectAuthLoading,
  selectAuthError,
} from "../redux/authSlice";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use Redux state instead of local state for loading and error
  const loading = useSelector(selectAuthLoading);
  const reduxError = useSelector(selectAuthError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessError, setAccessError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccessError("");

    // Dispatch login start action
    dispatch(loginStart());

    try {
      // Attempt to login
      const response = await loginUser(email, password);

      // Check if the user has one of the allowed roles
      if (
        !response.user.role ||
        !["ADMIN", "RECRUITER", "HR"].includes(response.user.role)
      ) {
        setAccessError(
          "Access denied. This login is only for administrative staff."
        );
        dispatch(loginFailure("Unauthorized role"));
        return;
      }

      // Dispatch success action
      dispatch(
        loginSuccess({
          accessToken: response.access_token,
          user: response.user,
        })
      );

      // Redirect based on role
      if (response.user.role === "RECRUITER") {
        navigate("/recruiter-dashboard");
      } else if (response.user.role === "HR") {
        navigate("/hr-dashboard");
      } else {
        navigate("/company-settings");
      }
    } catch (err) {
      // Dispatch failure action
      dispatch(loginFailure("Invalid email or password"));
    }
  };

  // Display either the access error or the general auth error
  const errorMessage = accessError || reduxError;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1E3A5F 30%, #3B4D61 90%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
            Admin Portal
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ mb: 3, color: "text.secondary" }}
          >
            Access for recruiters, HR and admin staff only
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminLoginPage;
