import React from "react";
import { Chip, ChipProps, Box, Typography } from "@mui/material";
import useCompanyTheme from "../hooks/useCompanyTheme";

interface StyledBadgeProps extends Omit<ChipProps, "variant"> {
  variant?: "filled" | "outlined" | "light" | "gradient";
  size?: "small" | "medium" | "large";
}

const StyledBadge: React.FC<StyledBadgeProps> = (props) => {
  const companyTheme = useCompanyTheme();
  const {
    variant = "filled",
    size = "medium",
    color = "primary",
    ...otherProps
  } = props;

  // Set size values
  let fontSize = "0.75rem";
  let height = 24;
  let paddingX = 1;

  if (size === "small") {
    fontSize = "0.625rem";
    height = 20;
    paddingX = 0.75;
  } else if (size === "large") {
    fontSize = "0.875rem";
    height = 28;
    paddingX = 1.5;
  }

  // Set styles based on variant and color
  let styles: any = {
    height,
    fontSize,
    px: paddingX,
    fontWeight: 600,
    borderRadius: "50px",
  };

  if (color === "primary") {
    if (variant === "filled") {
      styles = {
        ...styles,
        backgroundColor: companyTheme.primary,
        color: companyTheme.contrastText,
      };
    } else if (variant === "outlined") {
      styles = {
        ...styles,
        backgroundColor: "transparent",
        color: companyTheme.primary,
        border: `1px solid ${companyTheme.primary}`,
      };
    } else if (variant === "light") {
      styles = {
        ...styles,
        backgroundColor: companyTheme.primaryBackground,
        color: companyTheme.primary,
      };
    } else if (variant === "gradient") {
      styles = {
        ...styles,
        background: companyTheme.primaryGradient,
        color: companyTheme.contrastText,
      };
    }
  }

  return <Chip sx={styles} color={color} {...otherProps} />;
};

// Helper components for different common badge types
export const StatusBadge: React.FC<{
  status: string;
  size?: "small" | "medium" | "large";
}> = ({ status, size = "medium" }) => {
  const companyTheme = useCompanyTheme();
  let color: ChipProps["color"] = "default";
  let variant: StyledBadgeProps["variant"] = "light";

  switch (status.toLowerCase()) {
    case "active":
    case "approved":
    case "completed":
    case "published":
      color = "success";
      break;
    case "pending":
    case "in progress":
    case "in review":
      color = "warning";
      break;
    case "rejected":
    case "failed":
    case "closed":
      color = "error";
      break;
    case "draft":
    case "paused":
      color = "default";
      break;
    default:
      color = "primary";
      break;
  }

  return (
    <StyledBadge label={status} color={color} variant={variant} size={size} />
  );
};

export const PriorityBadge: React.FC<{
  priority: string;
  size?: "small" | "medium" | "large";
}> = ({ priority, size = "medium" }) => {
  let color: ChipProps["color"] = "default";
  let variant: StyledBadgeProps["variant"] = "light";

  switch (priority.toLowerCase()) {
    case "high":
      color = "error";
      break;
    case "medium":
      color = "warning";
      break;
    case "low":
      color = "info";
      break;
    default:
      color = "default";
      break;
  }

  return (
    <StyledBadge label={priority} color={color} variant={variant} size={size} />
  );
};

export default StyledBadge;
