import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Badge,
  useTheme,
  alpha,
} from "@mui/material";
import { NotificationsOutlined } from "@mui/icons-material";

interface PrimaryAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  gradient?: string;
}

interface DashboardHeaderProps {
  title: string;
  primaryAction?: PrimaryAction;
  notifications?: number;
  onNotificationsClick?: () => void;
}

/**
 * A reusable header component for dashboard pages
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  primaryAction,
  notifications = 0,
  onNotificationsClick,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        width: "100%",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: theme.palette.primary.main,
          textShadow: "0px 0px 1px rgba(0,0,0,0.05)",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -8,
            left: 0,
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
          },
        }}
      >
        {title}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        {notifications > 0 && (
          <IconButton
            onClick={onNotificationsClick}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              },
            }}
          >
            <Badge badgeContent={notifications} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        )}

        {primaryAction && (
          <Button
            variant="contained"
            startIcon={primaryAction.icon}
            onClick={primaryAction.onClick}
            sx={{
              background:
                primaryAction.gradient ||
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              },
              transition: "all 0.3s ease",
              textTransform: "none",
              fontSize: "0.95rem",
              fontWeight: 600,
              px: 3,
              py: 1,
            }}
          >
            {primaryAction.label}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default DashboardHeader;
