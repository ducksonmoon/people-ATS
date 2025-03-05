import React from "react";
import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  ListItem,
  ListItemButton,
  Menu,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavItem } from "../../types/navigation";

/**
 * Component for navigation item in dropdown menu
 */
export const NavMenuItem: React.FC<{
  item: NavItem;
  onClick?: () => void;
  selected?: boolean;
  color: string;
}> = ({ item, onClick, selected, color }) => (
  <MenuItem
    component={RouterLink}
    to={item.path}
    onClick={onClick}
    sx={{
      color: selected ? color : "text.primary",
      bgcolor: selected ? `${color}15` : "transparent",
    }}
  >
    <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
    <ListItemText primary={item.label} />
  </MenuItem>
);

/**
 * Component for navigation item in drawer
 */
export const DrawerNavItem: React.FC<{
  item: NavItem;
  onClick?: () => void;
  selected?: boolean;
  color: string;
}> = ({ item, onClick, selected, color }) => (
  <ListItem disablePadding>
    <ListItemButton
      component={RouterLink}
      to={item.path}
      onClick={onClick}
      selected={selected}
      sx={{
        py: 1.5,
        color: selected ? color : "text.primary",
        bgcolor: selected ? `${color}15` : "transparent",
      }}
    >
      <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.label} />
    </ListItemButton>
  </ListItem>
);

/**
 * User Menu component for profile dropdown
 */
export const UserMenu: React.FC<{
  user: any;
  color: string;
  handleLogout: () => void;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
}> = ({ user, color, handleLogout, anchorEl, handleClose }) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    PaperProps={{
      elevation: 3,
      sx: {
        mt: 1.5,
        width: 220,
        borderRadius: 1,
      },
    }}
  >
    <MenuItem sx={{ pointerEvents: "none" }}>
      <Box sx={{ width: "100%" }}>
        <Typography variant="subtitle2" noWrap>
          {user?.name || "User"}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user?.email || ""}
        </Typography>
      </Box>
    </MenuItem>
    <Divider />
    <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
      <ListItemIcon sx={{ color: "inherit" }}>
        <LogoutIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </MenuItem>
  </Menu>
);
