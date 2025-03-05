import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Grid,
  Alert,
  Button,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  AccessTime as ClockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Import types from the barrel file
import {
  UseCompanyThemeReturn,
  UseDashboardDataReturn,
  JobRequisition,
  DepartmentMetric,
  TimeToHireMetric,
} from "../types";

// Import hooks from the barrel file
import { useCompanyTheme, useDashboardData } from "../hooks";

// Import all dashboard components from the barrel file
import {
  DashboardHeader,
  HiringTrends,
  RecruitmentFunnel,
  DepartmentHiringProgress,
  ActiveCandidates,
  ActiveJobRequisitions,
  DashboardLoader,
  TimeToHireMetrics,
  DepartmentMetrics,
} from "../components/dashboard";

/**
 * HR Dashboard Page
 * Shows hiring analytics, department progress, candidates, job requisitions, and hiring metrics
 */
const HRDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme, isDarkMode, primaryGradient }: UseCompanyThemeReturn =
    useCompanyTheme();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState<boolean>(false);

  // Use custom hook for fetching and managing dashboard data
  const {
    data: dashboardData,
    loading,
    error,
    refreshData,
    departmentFilter,
    setDepartmentFilter,
    filteredCandidates,
  }: UseDashboardDataReturn = useDashboardData();

  // Update the timestamp when data is refreshed
  useEffect(() => {
    if (!loading && dashboardData && isRefreshing) {
      setLastUpdated(new Date());
      setIsRefreshing(false);
      setShowRefreshSuccess(true);
    }
  }, [dashboardData, loading, isRefreshing]);

  // Format time since last update
  const getTimeSinceUpdate = useCallback(() => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    if (diffHours < 24) return `${diffHours} hours ago`;

    return lastUpdated.toLocaleString();
  }, [lastUpdated]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    refreshData();
  }, [refreshData]);

  // Handle close of success notification
  const handleCloseSuccessNotification = useCallback(() => {
    setShowRefreshSuccess(false);
  }, []);

  // Navigation handlers
  const handleCreateJob = useCallback(
    () => navigate("/create-job"),
    [navigate]
  );
  const handleViewCandidate = useCallback(
    (id: string | number) => navigate(`/candidates/${id}`),
    [navigate]
  );
  const handleViewJob = useCallback(
    (id: string | number) => navigate(`/jobs/${id}`),
    [navigate]
  );
  const handleDepartmentGoals = useCallback(
    () => navigate("/departments/hiring-goals"),
    [navigate]
  );
  const handleViewGoals = useCallback(
    () => navigate("/department-hiring-goals"),
    [navigate]
  );

  if (loading && !isRefreshing) {
    return <DashboardLoader />;
  }

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: "background.default",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Dashboard Header with title and actions */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <DashboardHeader
                title="HR Dashboard"
                notifications={4}
                primaryAction={{
                  label: "Create Job Requisition",
                  icon: <AddIcon />,
                  onClick: handleCreateJob,
                  gradient: primaryGradient,
                }}
              />

              <Tooltip title="Refresh dashboard data">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ ml: 2 }}
                  aria-label="Refresh data"
                >
                  <RefreshIcon
                    sx={{
                      animation: isRefreshing
                        ? "spin 1s linear infinite"
                        : "none",
                      "@keyframes spin": {
                        "0%": {
                          transform: "rotate(0deg)",
                        },
                        "100%": {
                          transform: "rotate(360deg)",
                        },
                      },
                    }}
                  />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Last updated indicator */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, ml: 1 }}>
              <Chip
                size="small"
                icon={<ClockIcon fontSize="small" />}
                label={`Updated ${getTimeSinceUpdate()}`}
                sx={{
                  fontSize: "0.75rem",
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  "& .MuiChip-icon": {
                    color: theme.palette.text.secondary,
                  },
                }}
              />
            </Box>
          </Grid>

          {/* Enhanced Refresh Button */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={
                <RefreshIcon
                  sx={{
                    animation: isRefreshing
                      ? "spin 1s linear infinite"
                      : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              }
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                mb: 3,
                py: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              {isRefreshing
                ? "Refreshing Dashboard Data..."
                : "Refresh Dashboard Data (Force Reload)"}
            </Button>
          </Grid>

          {/* Show skeleton loaders for individual components while refreshing */}
          {isRefreshing ? (
            <DashboardLoader />
          ) : (
            <>
              {/* Hiring Trends Chart */}
              <Grid item xs={12}>
                <HiringTrends data={dashboardData?.hiringTrendsData || []} />
              </Grid>

              {/* Time to Hire Metrics - New Component */}
              <Grid item xs={12}>
                <TimeToHireMetrics
                  data={
                    dashboardData?.timeToHireMetrics || {
                      avgDaysToHire: 0,
                      fastestHire: 0,
                      slowestHire: 0,
                    }
                  }
                />
              </Grid>

              {/* Recruitment Funnel */}
              <Grid item xs={12} md={4}>
                <RecruitmentFunnel
                  data={dashboardData?.recruitmentFunnelData || []}
                />
              </Grid>

              {/* Department Hiring Progress */}
              <Grid item xs={12} md={8}>
                <DepartmentHiringProgress
                  departments={dashboardData?.departmentHiringData || []}
                  onViewGoals={handleViewGoals}
                  onManageGoals={handleDepartmentGoals}
                />
              </Grid>

              {/* Department Metrics - New Component */}
              <Grid item xs={12}>
                <DepartmentMetrics
                  data={dashboardData?.departmentMetrics || []}
                  onViewDepartment={(id) => navigate(`/departments/${id}`)}
                />
              </Grid>

              {/* Active Candidates */}
              <Grid item xs={12}>
                <ActiveCandidates
                  candidates={filteredCandidates}
                  departmentFilter={departmentFilter}
                  setDepartmentFilter={setDepartmentFilter}
                  departments={dashboardData?.departmentHiringData || []}
                  onViewCandidate={handleViewCandidate}
                />
              </Grid>

              {/* Job Requisitions */}
              <Grid item xs={12}>
                <ActiveJobRequisitions
                  jobs={dashboardData?.jobRequisitions || []}
                  onViewJob={handleViewJob}
                  onCreateJob={handleCreateJob}
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* Error handling and retry button */}
        {error && (
          <Alert
            severity="error"
            sx={{ mt: 3, mb: 0 }}
            action={
              <Button variant="outlined" size="small" onClick={refreshData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Success notification */}
        <Snackbar
          open={showRefreshSuccess}
          autoHideDuration={3000}
          onClose={handleCloseSuccessNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          message={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <CheckCircleIcon
                sx={{ color: theme.palette.success.main, mr: 1 }}
              />
              <Typography variant="body2">
                Dashboard data successfully refreshed from server
              </Typography>
            </Box>
          }
        />
      </Container>
    </Box>
  );
};

export default HRDashboardPage;
