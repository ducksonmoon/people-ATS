import React from "react";
import {
  Button as MuiButton,
  ButtonProps,
  IconButton,
  IconButtonProps,
  Fab,
  FabProps,
  alpha,
  Box,
  CircularProgress,
} from "@mui/material";
import useCompanyTheme from "../hooks/useCompanyTheme";

// Extend ButtonProps to include our custom props
export interface ExtendedButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "contained" | "outlined" | "text" | "gradient" | "soft" | "rounded";
  loading?: boolean;
  fullWidth?: boolean;
  elevated?: boolean;
}

// Styled Button component that leverages company theming
const StyledButton: React.FC<ExtendedButtonProps> = (props) => {
  const companyTheme = useCompanyTheme();
  const {
    variant = "contained",
    color = "primary",
    loading = false,
    elevated = false,
    disabled,
    children,
    ...otherProps
  } = props;

  // Create dynamic styles based on company theme
  const buttonStyles: any = {
    textTransform: "none",
    borderRadius: variant === "rounded" ? "50px" : "8px",
    transition: "all 0.2s ease-in-out",
    position: "relative",
    ...(elevated && {
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      "&:hover": {
        boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
      },
    }),
  };

  // Handle different variants
  if (color === "primary") {
    if (variant === "contained") {
      buttonStyles.backgroundColor = companyTheme.primary;
      buttonStyles.color = companyTheme.contrastText;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryDark,
      };
    } else if (variant === "outlined") {
      buttonStyles.color = companyTheme.primary;
      buttonStyles.borderColor = companyTheme.primary;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryBackground,
        borderColor: companyTheme.primary,
      };
    } else if (variant === "text") {
      buttonStyles.color = companyTheme.primary;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryBackground,
      };
    } else if (variant === "gradient") {
      buttonStyles.background = companyTheme.primaryGradient;
      buttonStyles.color = companyTheme.contrastText;
      buttonStyles["&:hover"] = {
        opacity: 0.9,
      };
    } else if (variant === "soft") {
      buttonStyles.backgroundColor = companyTheme.primaryBackground;
      buttonStyles.color = companyTheme.primary;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryBackgroundHover,
      };
    } else if (variant === "rounded") {
      buttonStyles.backgroundColor = companyTheme.primary;
      buttonStyles.color = companyTheme.contrastText;
      buttonStyles.borderRadius = "50px";
      buttonStyles.padding = "8px 24px";
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryDark,
        transform: "translateY(-2px)",
      };
    }
  }

  // Determine which MUI variant to use
  const muiVariant: ButtonProps["variant"] =
    variant === "contained" ||
    variant === "gradient" ||
    variant === "soft" ||
    variant === "rounded"
      ? "contained"
      : variant === "outlined"
      ? "outlined"
      : "text";

  return (
    <MuiButton
      variant={muiVariant}
      color={color === "primary" ? undefined : color}
      disabled={disabled || loading}
      sx={{ ...buttonStyles, ...otherProps.sx }}
      {...otherProps}
    >
      {loading ? (
        <>
          <CircularProgress
            size={24}
            color="inherit"
            sx={{
              position: "absolute",
              left: "50%",
              marginLeft: "-12px",
            }}
          />
          <Box sx={{ opacity: 0 }}>{children}</Box>
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};

// Icon Button with company theming
export interface StyledIconButtonProps extends IconButtonProps {
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "default";
  variant?: "default" | "contained" | "outlined" | "soft";
}

export const StyledIconButton: React.FC<StyledIconButtonProps> = (props) => {
  const companyTheme = useCompanyTheme();
  const { color = "default", variant = "default", ...otherProps } = props;

  const buttonStyles: any = {};

  if (color === "primary") {
    if (variant === "contained") {
      buttonStyles.backgroundColor = companyTheme.primary;
      buttonStyles.color = companyTheme.contrastText;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryDark,
      };
    } else if (variant === "outlined") {
      buttonStyles.color = companyTheme.primary;
      buttonStyles.border = `1px solid ${companyTheme.primary}`;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryBackground,
      };
    } else if (variant === "soft") {
      buttonStyles.backgroundColor = companyTheme.primaryBackground;
      buttonStyles.color = companyTheme.primary;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryBackgroundHover,
      };
    } else {
      buttonStyles.color = companyTheme.primary;
      buttonStyles["&:hover"] = {
        backgroundColor: companyTheme.primaryBackground,
      };
    }
  }

  return (
    <IconButton
      color={color === "primary" ? undefined : color}
      sx={{ ...buttonStyles, ...otherProps.sx }}
      {...otherProps}
    />
  );
};

// FAB with company theming
export interface StyledFabProps extends Omit<FabProps, "color"> {
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "default";
  variant?: "default" | "extended" | "gradient";
}

export const StyledFab: React.FC<StyledFabProps> = (props) => {
  const companyTheme = useCompanyTheme();
  const { color = "primary", variant = "default", ...otherProps } = props;

  const fabStyles: any = {};

  if (color === "primary") {
    if (variant === "gradient") {
      fabStyles.background = companyTheme.primaryGradient;
      fabStyles.color = companyTheme.contrastText;
    } else {
      fabStyles.backgroundColor = companyTheme.primary;
      fabStyles.color = companyTheme.contrastText;
    }
    fabStyles["&:hover"] = {
      backgroundColor: companyTheme.primaryDark,
    };
  }

  const muiVariant = variant === "extended" ? "extended" : "circular";

  return (
    <Fab
      color={color === "primary" ? undefined : color}
      variant={muiVariant}
      sx={{ ...fabStyles, ...otherProps.sx }}
      {...otherProps}
    />
  );
};

export default StyledButton;
