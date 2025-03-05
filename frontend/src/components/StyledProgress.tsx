import React from "react";
import {
  Box,
  LinearProgress,
  CircularProgress,
  Typography,
  Tooltip,
  SxProps,
  Theme,
} from "@mui/material";
import useCompanyTheme from "../hooks/useCompanyTheme";

interface LinearProgressWithLabelProps {
  value: number;
  label?: React.ReactNode;
  tooltipTitle?: string;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  sx?: SxProps<Theme>;
  showPercentage?: boolean;
}

export const LinearProgressWithLabel: React.FC<
  LinearProgressWithLabelProps
> = ({
  value,
  label,
  tooltipTitle,
  size = "medium",
  color = "primary",
  sx,
  showPercentage = true,
}) => {
  const companyTheme = useCompanyTheme();

  // Determine height based on size
  let height = 8;
  if (size === "small") height = 4;
  if (size === "large") height = 12;

  // Custom color for primary that uses company settings
  const progressStyles =
    color === "primary"
      ? {
          "& .MuiLinearProgress-bar": {
            backgroundColor: companyTheme.primary,
          },
          backgroundColor: companyTheme.primaryBackground,
        }
      : {};

  const progressBar = (
    <Box sx={{ width: "100%", ...sx }}>
      {label && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(value)}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={value > 100 ? 100 : value}
        color={color === "primary" ? undefined : color}
        sx={{
          height,
          borderRadius: height,
          ...progressStyles,
        }}
      />
    </Box>
  );

  if (tooltipTitle) {
    return <Tooltip title={tooltipTitle}>{progressBar}</Tooltip>;
  }

  return progressBar;
};

interface CircularProgressWithLabelProps {
  value: number;
  size?: number;
  thickness?: number;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  showPercentage?: boolean;
  label?: React.ReactNode;
  tooltipTitle?: string;
  sx?: SxProps<Theme>;
}

export const CircularProgressWithLabel: React.FC<
  CircularProgressWithLabelProps
> = ({
  value,
  size = 40,
  thickness = 4,
  color = "primary",
  showPercentage = true,
  label,
  tooltipTitle,
  sx,
}) => {
  const companyTheme = useCompanyTheme();

  // Custom styling for primary color
  const circleStyles =
    color === "primary"
      ? {
          color: companyTheme.primary,
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }
      : {
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        };

  const progressCircle = (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        ...sx,
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress
          variant="determinate"
          value={value > 100 ? 100 : value}
          size={size}
          thickness={thickness}
          color={color === "primary" ? undefined : color}
          sx={circleStyles}
        />
        {showPercentage && (
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ fontWeight: 600, fontSize: size > 50 ? "1rem" : "0.75rem" }}
            >
              {Math.round(value)}%
            </Typography>
          </Box>
        )}
      </Box>
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, textAlign: "center" }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );

  if (tooltipTitle) {
    return <Tooltip title={tooltipTitle}>{progressCircle}</Tooltip>;
  }

  return progressCircle;
};

export default {
  LinearProgressWithLabel,
  CircularProgressWithLabel,
};
