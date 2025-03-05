import { useMemo } from "react";
import { useTheme, Theme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { UseCompanyThemeReturn } from "../types";

/**
 * Helper function to lighten a color by a percentage
 */
function lightenColor(color: string, percent: number): string {
  try {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
  } catch (error) {
    console.warn("Error lightening color:", error);
    return color; // Return original color if processing fails
  }
}

/**
 * Helper function to darken a color by a percentage
 */
function darkenColor(color: string, percent: number): string {
  try {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
  } catch (error) {
    console.warn("Error darkening color:", error);
    return color; // Return original color if processing fails
  }
}

/**
 * Function to determine if text should be dark or light based on background color
 */
function getContrastText(hexColor: string): string {
  try {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance (simplified algorithm)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark colors and black for light colors
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  } catch (error) {
    console.warn("Error calculating contrast text:", error);
    return "#FFFFFF"; // Default to white if processing fails
  }
}

/**
 * Generates theme colors from primary color and Material-UI theme
 */
function getThemeColors(
  primaryColor: string,
  muiTheme: Theme,
  hasCustomColor: boolean
): Omit<UseCompanyThemeReturn, "theme" | "isDarkMode"> {
  return {
    // Main colors
    primary: primaryColor,
    primaryLight: hasCustomColor
      ? lightenColor(primaryColor, 15)
      : muiTheme.palette.primary.light,
    primaryDark: hasCustomColor
      ? darkenColor(primaryColor, 15)
      : muiTheme.palette.primary.dark,
    contrastText: hasCustomColor
      ? getContrastText(primaryColor)
      : muiTheme.palette.primary.contrastText,

    // Background colors with different opacities
    primaryBackground: `${primaryColor}10`, // 10% opacity
    primaryBackgroundHover: `${primaryColor}15`, // 15% opacity
    primaryBackgroundActive: `${primaryColor}25`, // 25% opacity

    // Gradient background
    primaryGradient: `linear-gradient(135deg, ${primaryColor}, ${
      hasCustomColor
        ? darkenColor(primaryColor, 15)
        : muiTheme.palette.primary.dark
    })`,
  };
}

/**
 * Interface for company theme colors
 */
interface CompanyThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryBackground: string;
  textOnPrimary: string;
}

/**
 * Hook to access company theme colors
 * Uses company settings if available, falls back to theme defaults
 */
export const useCompanyTheme = (): CompanyThemeColors => {
  const theme = useTheme();
  const { settings } = useSelector((state: RootState) => state.companySettings);

  return useMemo(() => {
    // Get primary color from settings or use theme default
    const primaryColor = settings?.primaryColor || theme.palette.primary.main;

    // Function to calculate darker shade for hover states
    const getDarkerShade = (color: string, percent: number = 15): string => {
      try {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
        const B = Math.max(0, (num & 0x0000ff) - amt);
        return `#${((1 << 24) | (R << 16) | (G << 8) | B)
          .toString(16)
          .slice(1)}`;
      } catch (e) {
        // If color parsing fails, return theme default
        return theme.palette.primary.dark;
      }
    };

    // Function to calculate lighter shade
    const getLighterShade = (color: string, percent: number = 15): string => {
      try {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
        const B = Math.min(255, (num & 0x0000ff) + amt);
        return `#${((1 << 24) | (R << 16) | (G << 8) | B)
          .toString(16)
          .slice(1)}`;
      } catch (e) {
        // If color parsing fails, return theme default
        return theme.palette.primary.light;
      }
    };

    // Get darker and lighter shades
    const primaryDark = getDarkerShade(primaryColor);
    const primaryLight = getLighterShade(primaryColor);

    // Calculate contrast color for text on primary (white or black)
    const calculateTextColor = (background: string): string => {
      try {
        // Convert hex to RGB
        const hex = background.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // Calculate luminance
        // Formula: (0.299 * R + 0.587 * G + 0.114 * B)
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Use white for dark backgrounds, black for light backgrounds
        return luminance > 0.5 ? "#000000" : "#ffffff";
      } catch (e) {
        // Default to white text
        return "#ffffff";
      }
    };

    // Return theme colors object
    return {
      primary: primaryColor,
      primaryDark,
      primaryLight,
      primaryBackground: `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`,
      textOnPrimary: calculateTextColor(primaryColor),
    };
  }, [settings, theme]);
};

export default useCompanyTheme;
