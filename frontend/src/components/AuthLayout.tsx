import React, { ReactNode } from "react";
import { Box, Container, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface AuthLayoutProps {
  children: ReactNode;
  maxWidth?: "xs" | "sm";
}

/**
 * AuthLayout - A consistent layout component for authentication pages
 * Provides a standardized container, styling, and responsive behavior
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  maxWidth = "xs",
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.grey[900]} 30%, ${theme.palette.grey[800]} 90%)`
            : `linear-gradient(135deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth={maxWidth}>
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            textAlign: "center",
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(135deg, ${theme.palette.grey[800]}, ${theme.palette.grey[900]})`
                : "linear-gradient(135deg, #F4F4F6, #FFFFFF)",
            boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.1)",
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
