import React from "react";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { NavItem } from "../../types/navigation";
import { DrawerNavItem } from "./NavUtils";

interface MobileDrawerContentProps {
  user: any;
  handleDrawerToggle: () => void;
  primaryNavItems: NavItem[];
  dashboardItems: NavItem[];
  managementItems: NavItem[];
  isActiveRoute: (path: string) => boolean;
  companyPrimaryColor: string;
  handleLogout: () => void;
}

/**
 * Component for Mobile Drawer Content
 * Extracted to improve readability and maintainability
 */
const MobileDrawerContent: React.FC<MobileDrawerContentProps> = ({
  user,
  handleDrawerToggle,
  primaryNavItems,
  dashboardItems,
  managementItems,
  isActiveRoute,
  companyPrimaryColor,
  handleLogout,
}) => (
  <Box sx={{ width: 280, pt: 1, height: "100%" }}>
    <Box sx={{ display: "flex", justifyContent: "flex-end", px: 2 }}>
      <IconButton onClick={handleDrawerToggle}>
        <CloseIcon />
      </IconButton>
    </Box>

    {/* User profile section */}
    {user && (
      <Box
        sx={{
          px: 2,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Avatar sx={{ bgcolor: companyPrimaryColor }}>
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user.name || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.role || "User"}
          </Typography>
        </Box>
      </Box>
    )}

    <List>
      {/* Primary navigation items */}
      {primaryNavItems.map((item) => (
        <DrawerNavItem
          key={item.path}
          item={item}
          onClick={handleDrawerToggle}
          selected={isActiveRoute(item.path)}
          color={companyPrimaryColor}
        />
      ))}

      {/* Post Job Button in Drawer */}
      {user && (
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/create-job"
            onClick={handleDrawerToggle}
            sx={{
              py: 1.5,
              color: companyPrimaryColor,
              fontWeight: 500,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Post a Job" />
          </ListItemButton>
        </ListItem>
      )}

      {/* Dashboard Section - if user has access */}
      {dashboardItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <ListItem>
            <ListItemText
              primary="Dashboards"
              primaryTypographyProps={{
                color: "text.secondary",
                variant: "caption",
                sx: { fontWeight: 700, fontSize: "0.75rem" },
              }}
            />
          </ListItem>
          {dashboardItems.map((item) => (
            <DrawerNavItem
              key={item.path}
              item={item}
              onClick={handleDrawerToggle}
              selected={isActiveRoute(item.path)}
              color={companyPrimaryColor}
            />
          ))}
        </>
      )}

      {/* Management Section - if user has access */}
      {managementItems.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <ListItem>
            <ListItemText
              primary="Management"
              primaryTypographyProps={{
                color: "text.secondary",
                variant: "caption",
                sx: { fontWeight: 700, fontSize: "0.75rem" },
              }}
            />
          </ListItem>
          {managementItems.map((item) => (
            <DrawerNavItem
              key={item.path}
              item={item}
              onClick={handleDrawerToggle}
              selected={isActiveRoute(item.path)}
              color={companyPrimaryColor}
            />
          ))}
        </>
      )}

      {/* Logout option */}
      {user && (
        <>
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                handleLogout();
                handleDrawerToggle();
              }}
              sx={{
                py: 1.5,
                color: "error.main",
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </>
      )}

      {/* Admin Login if not logged in */}
      {!user && (
        <>
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/admin"
              onClick={handleDrawerToggle}
              sx={{
                py: 1.5,
                color: companyPrimaryColor,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Admin Portal" />
            </ListItemButton>
          </ListItem>
        </>
      )}
    </List>
  </Box>
);

export default MobileDrawerContent;
