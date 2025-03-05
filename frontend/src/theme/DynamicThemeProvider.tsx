import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import baseTheme from "../theme";
import { CssBaseline } from "@mui/material";

// A component that provides a theme with company settings applied
const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useSelector((state: RootState) => state.companySettings);

  // Create a dynamic theme based on company settings
  const theme = useMemo(() => {
    // If no settings or no primary color, use the base theme
    if (!settings?.primaryColor) return baseTheme;

    // Create a new theme with the company's primary color
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        primary: {
          main: settings.primaryColor,
          // Automatically generate light and dark variants
          light: lightenColor(settings.primaryColor, 15),
          dark: darkenColor(settings.primaryColor, 15),
          contrastText: getContrastText(settings.primaryColor),
        },
      },
    });
  }, [settings?.primaryColor]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

// Helper functions for color manipulation
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
}

function getContrastText(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance (simplified algorithm)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors and black for light colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

export default DynamicThemeProvider;
