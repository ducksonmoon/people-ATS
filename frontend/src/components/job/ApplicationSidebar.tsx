import React from "react";
import { Box, Paper, Typography, Button, alpha, useTheme } from "@mui/material";
import { useCompanyTheme } from "../../hooks/useCompanyTheme";

interface ApplicationSidebarProps {
  companyName: string;
  onApplyClick: () => void;
  isLoggedIn: boolean;
}

const ApplicationSidebar: React.FC<ApplicationSidebarProps> = ({
  companyName,
  onApplyClick,
  isLoggedIn,
}) => {
  const theme = useTheme();
  const companyTheme = useCompanyTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor:
          companyTheme.primaryBackground ||
          alpha(theme.palette.primary.main, 0.03),
        border: `1px solid ${
          companyTheme.primaryBackgroundActive ||
          alpha(theme.palette.primary.main, 0.1)
        }`,
        position: "sticky",
        top: 100,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: companyTheme.primary || theme.palette.primary.main,
        }}
      >
        Application Process
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontWeight: 500, mb: 1 }}>Steps to apply:</Typography>
        <Box component="ol" sx={{ pl: 2, mb: 0 }}>
          <li>Click the "Apply Now" button</li>
          <li>Fill in your contact information</li>
          <li>Upload your resume (PDF or DOCX)</li>
          <li>Add a cover letter (optional)</li>
          <li>Submit your application</li>
        </Box>
      </Box>

      <Typography sx={{ mb: 3, color: theme.palette.text.secondary }}>
        Applications are typically reviewed within{" "}
        {companyName ? `${companyName}'s` : ""} team within 1-2 weeks.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        onClick={onApplyClick}
        sx={{
          py: 1.5,
          background:
            companyTheme.primaryGradient ||
            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: `0 6px 15px ${alpha(
            companyTheme.primary || theme.palette.primary.main,
            0.25
          )}`,
          color: companyTheme.contrastText || "white",
        }}
      >
        Apply for this Position
      </Button>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {isLoggedIn
            ? "You're signed in and ready to apply"
            : "You can apply without signing in"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ApplicationSidebar;
