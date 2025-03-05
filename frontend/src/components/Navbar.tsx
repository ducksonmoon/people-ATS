import React, { useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  CircularProgress,
  Container,
  IconButton,
  useMediaQuery,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import WorkIcon from "@mui/icons-material/Work";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { getTextDirection } from "../utils/language";
import { logout } from "../redux/authSlice";
import { NavMenuItem, DrawerNavItem, UserMenu } from "./navigation/NavUtils";
import MobileDrawerContent from "./navigation/MobileDrawerContent";
import { NavItem } from "../types/navigation";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const [mobileDrawer, setMobileDrawer] = React.useState(false);
  const [dashboardMenu, setDashboardMenu] = React.useState<null | HTMLElement>(
    null
  );
  const [managementMenu, setManagementMenu] =
    React.useState<null | HTMLElement>(null);
  const [userMenu, setUserMenu] = React.useState<null | HTMLElement>(null);

  const { settings, loading } = useSelector(
    (state: RootState) => state.companySettings
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Extract company primary color from settings or use theme default
  const companyPrimaryColor = useMemo(
    () => settings?.primaryColor || theme.palette.primary.main,
    [settings, theme.palette.primary.main]
  );

  // Create darker shade for gradients and hover states
  const companyPrimaryDark = useMemo(() => {
    // Simple function to darken a hex color
    const darkenColor = (color: string, percent: number) => {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.max(0, (num >> 16) - amt);
      const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
      const B = Math.max(0, (num & 0x0000ff) - amt);
      return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
    };

    return settings?.primaryColor
      ? darkenColor(settings.primaryColor, 15)
      : theme.palette.primary.dark;
  }, [settings, theme.palette.primary.dark]);

  const isAdmin = user?.role === "ADMIN";
  const isHR = user?.role === "HR";
  const isRecruiter = user?.role === "RECRUITER";

  // Menu handlers
  const handleDrawerToggle = () => setMobileDrawer(!mobileDrawer);
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setUserMenu(event.currentTarget);
  const handleUserMenuClose = () => setUserMenu(null);
  const handleDashboardMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setDashboardMenu(event.currentTarget);
  const handleDashboardMenuClose = () => setDashboardMenu(null);
  const handleManagementMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setManagementMenu(event.currentTarget);
  const handleManagementMenuClose = () => setManagementMenu(null);

  const handleLogout = () => {
    dispatch(logout());
    handleUserMenuClose();
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  // Generate navigation items based on user role
  const primaryNavItems = useMemo<NavItem[]>(
    () => [
      { path: "/", label: "Home", icon: <HomeIcon /> },
      { path: "/jobs", label: "Jobs", icon: <WorkOutlineIcon /> },
    ],
    []
  );

  // Dashboard menu items
  const dashboardItems = useMemo<NavItem[]>(
    () => [
      ...(isRecruiter || isAdmin
        ? [
            {
              path: "/dashboard/recruiter",
              label: "Recruiter Dashboard",
              icon: <DashboardIcon />,
            },
          ]
        : []),
      ...(isAdmin || isHR
        ? [
            {
              path: "/dashboard/hr",
              label: "HR Dashboard",
              icon: <BusinessIcon />,
            },
          ]
        : []),
      ...(isAdmin || isHR
        ? [
            {
              path: "/departments/hiring-goals",
              label: "Hiring Goals",
              icon: <PeopleIcon />,
            },
          ]
        : []),
    ],
    [isAdmin, isHR, isRecruiter]
  );

  // Management menu items
  const managementItems = useMemo<NavItem[]>(
    () => [
      ...(isAdmin || isHR || isRecruiter
        ? [
            {
              path: "/applications/manage",
              label: "Applications",
              icon: <WorkIcon />,
            },
          ]
        : []),
      ...(isAdmin || isRecruiter
        ? [
            {
              path: "/applications/external",
              label: "External Applications",
              icon: <PersonIcon />,
            },
          ]
        : []),
      ...(isAdmin || isHR || isRecruiter
        ? [
            {
              path: "/interviews/calendar",
              label: "Interview Calendar",
              icon: <CalendarMonthIcon />,
            },
          ]
        : []),
      ...(isAdmin || isHR
        ? [
            {
              path: "/users/manage",
              label: "User Management",
              icon: <GroupIcon />,
            },
          ]
        : []),
      ...(isAdmin || isHR
        ? [
            {
              path: "/jobs/manage",
              label: "Job Listings",
              icon: <BusinessIcon />,
            },
          ]
        : []),
      ...(isAdmin
        ? [
            {
              path: "/settings",
              label: "Settings",
              icon: <SettingsIcon />,
            },
          ]
        : []),
    ],
    [isAdmin, isHR, isRecruiter]
  );

  const textDirection = settings?.companyName
    ? getTextDirection(settings.companyName)
    : "ltr";

  return (
    <AppBar
      position="sticky"
      elevation={1}
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ height: 64 }}>
          {/* Company Logo/Name */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              mr: 4,
              direction: textDirection as any,
            }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : settings?.logoUrl ? (
              <Box
                component="img"
                src={settings.logoUrl}
                alt={settings.companyName || "Company Logo"}
                sx={{ height: 40, maxWidth: 160, objectFit: "contain" }}
              />
            ) : (
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: companyPrimaryColor,
                  textDecoration: "none",
                }}
              >
                {settings?.companyName || "Recruitment Portal"}
              </Typography>
            )}
          </Box>

          {/* Desktop Navigation */}
          {!isMobile ? (
            <>
              <Box sx={{ display: "flex", flexGrow: 1 }}>
                {/* Primary Nav Links */}
                {primaryNavItems.map((item) => (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    startIcon={item.icon}
                    sx={{
                      mx: 0.5,
                      color: isActiveRoute(item.path)
                        ? companyPrimaryColor
                        : "text.primary",
                      borderRadius: 1,
                      position: "relative",
                      "&::after": isActiveRoute(item.path)
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: "10%",
                            width: "80%",
                            height: 3,
                            bgcolor: companyPrimaryColor,
                            borderTopLeftRadius: 3,
                            borderTopRightRadius: 3,
                          }
                        : {},
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                {/* Dashboard Menu Button - if user has dashboards */}
                {dashboardItems.length > 0 && (
                  <>
                    <Button
                      onClick={handleDashboardMenuOpen}
                      endIcon={<ArrowDropDownIcon />}
                      sx={{
                        mx: 0.5,
                        color: dashboardItems.some((item) =>
                          isActiveRoute(item.path)
                        )
                          ? companyPrimaryColor
                          : "text.primary",
                        borderRadius: 1,
                      }}
                    >
                      Dashboards
                    </Button>
                    <Menu
                      anchorEl={dashboardMenu}
                      open={Boolean(dashboardMenu)}
                      onClose={handleDashboardMenuClose}
                      PaperProps={{
                        elevation: 3,
                        sx: { mt: 1, width: 220, borderRadius: 1 },
                      }}
                    >
                      {dashboardItems.map((item) => (
                        <NavMenuItem
                          key={item.path}
                          item={item}
                          onClick={handleDashboardMenuClose}
                          selected={isActiveRoute(item.path)}
                          color={companyPrimaryColor}
                        />
                      ))}
                    </Menu>
                  </>
                )}

                {/* Management Menu Button - if user has management access */}
                {managementItems.length > 0 && (
                  <>
                    <Button
                      onClick={handleManagementMenuOpen}
                      endIcon={<ArrowDropDownIcon />}
                      sx={{
                        mx: 0.5,
                        color: managementItems.some((item) =>
                          isActiveRoute(item.path)
                        )
                          ? companyPrimaryColor
                          : "text.primary",
                        borderRadius: 1,
                      }}
                    >
                      Management
                    </Button>
                    <Menu
                      anchorEl={managementMenu}
                      open={Boolean(managementMenu)}
                      onClose={handleManagementMenuClose}
                      PaperProps={{
                        elevation: 3,
                        sx: { mt: 1, width: 220, borderRadius: 1 },
                      }}
                    >
                      {managementItems.map((item) => (
                        <NavMenuItem
                          key={item.path}
                          item={item}
                          onClick={handleManagementMenuClose}
                          selected={isActiveRoute(item.path)}
                          color={companyPrimaryColor}
                        />
                      ))}
                    </Menu>
                  </>
                )}
              </Box>

              {/* Right side actions */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {/* Post Job Button */}
                {user && (
                  <Button
                    component={RouterLink}
                    to="/create-job"
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      borderRadius: 1,
                      py: 0.8,
                      bgcolor: companyPrimaryColor,
                      "&:hover": {
                        bgcolor: companyPrimaryDark,
                      },
                    }}
                  >
                    Post a Job
                  </Button>
                )}

                {/* User Menu */}
                {user ? (
                  <>
                    <Tooltip title="Account">
                      <IconButton
                        onClick={handleUserMenuOpen}
                        sx={{ ml: 1 }}
                        aria-haspopup="true"
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: companyPrimaryColor,
                            fontSize: "0.875rem",
                          }}
                        >
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </Avatar>
                      </IconButton>
                    </Tooltip>
                    <UserMenu
                      user={user}
                      color={companyPrimaryColor}
                      handleLogout={handleLogout}
                      anchorEl={userMenu}
                      handleClose={handleUserMenuClose}
                    />
                  </>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/admin"
                    sx={{
                      ml: 1,
                      borderRadius: 1,
                      color: companyPrimaryColor,
                    }}
                    startIcon={<AccountCircleIcon />}
                  >
                    Admin Portal
                  </Button>
                )}
              </Box>
            </>
          ) : (
            // Mobile hamburger menu button
            <IconButton
              edge="end"
              onClick={handleDrawerToggle}
              sx={{
                ml: 1,
                color: companyPrimaryColor,
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawer}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
          },
        }}
      >
        <MobileDrawerContent
          user={user}
          handleDrawerToggle={handleDrawerToggle}
          primaryNavItems={primaryNavItems}
          dashboardItems={dashboardItems}
          managementItems={managementItems}
          isActiveRoute={isActiveRoute}
          companyPrimaryColor={companyPrimaryColor}
          handleLogout={handleLogout}
        />
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
