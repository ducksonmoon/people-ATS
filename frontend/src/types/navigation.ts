import { ReactNode } from "react";

/**
 * Interface for navigation items used in menus and navigation bars
 */
export interface NavItem {
  path: string;
  label: string;
  icon: ReactNode;
}
