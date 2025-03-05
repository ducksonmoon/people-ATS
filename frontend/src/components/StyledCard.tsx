import React from "react";
import {
  Card,
  CardProps,
  CardHeader,
  CardHeaderProps,
  CardContent,
  CardContentProps,
  CardActions,
  CardActionsProps,
} from "@mui/material";
import useCompanyTheme from "../hooks/useCompanyTheme";

// Interfaces for the StyledCard component and its subcomponents
interface StyledCardHeaderProps extends CardHeaderProps {
  highlighted?: boolean;
}

interface StyledCardProps extends CardProps {
  highlighted?: boolean;
  outlineColor?: "primary" | "secondary" | "default";
  hoverEffect?: boolean;
}

// Styled Card Header component
export const StyledCardHeader: React.FC<StyledCardHeaderProps> = (props) => {
  const companyTheme = useCompanyTheme();
  const { highlighted, ...otherProps } = props;

  return (
    <CardHeader
      sx={{
        ...(highlighted && {
          background: companyTheme.primaryGradient,
          color: companyTheme.contrastText,
          "& .MuiCardHeader-subheader": {
            color: `${companyTheme.contrastText}CC`, // Add some transparency to the subheader
          },
        }),
        ...otherProps.sx,
      }}
      {...otherProps}
    />
  );
};

// Styled Card component
const StyledCard: React.FC<StyledCardProps> = (props) => {
  const companyTheme = useCompanyTheme();
  const {
    highlighted,
    outlineColor = "default",
    hoverEffect,
    ...otherProps
  } = props;

  // Determine border color
  let borderColor = "divider";
  if (outlineColor === "primary") {
    borderColor = companyTheme.primary;
  } else if (outlineColor === "secondary") {
    borderColor = "secondary.main";
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        ...(highlighted && {
          borderLeft: `4px solid ${companyTheme.primary}`,
        }),
        ...(outlineColor !== "default" && {
          border: `1px solid ${borderColor}`,
        }),
        ...(hoverEffect && {
          "&:hover": {
            boxShadow: 3,
            transform: "translateY(-4px)",
            borderColor: companyTheme.primary,
          },
        }),
        ...otherProps.sx,
      }}
      {...otherProps}
    />
  );
};

// Also export styled versions of CardContent and CardActions
export const StyledCardContent: React.FC<CardContentProps> = (props) => {
  return <CardContent {...props} />;
};

export const StyledCardActions: React.FC<CardActionsProps> = (props) => {
  const companyTheme = useCompanyTheme();

  return (
    <CardActions
      sx={{
        backgroundColor: `${companyTheme.primaryBackground}`,
        ...props.sx,
      }}
      {...props}
    />
  );
};

export default StyledCard;
