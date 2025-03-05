import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Container,
  Chip,
  Avatar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Badge,
  useTheme,
  alpha,
  LinearProgress,
  Select,
  MenuItem,
  InputBase,
  FormControl,
  InputLabel,
  styled,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  NotificationsOutlined,
  Add as AddIcon,
  ArrowUpward,
  Person as PersonIcon,
  BusinessCenter as JobIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { hrService } from "../services/hr.service";
import useCompanyTheme from "../hooks/useCompanyTheme";

const SearchInput = styled(InputBase)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  borderRadius: theme.shape.borderRadius,
  width: "100%",
  padding: theme.spacing(1, 1, 1, 0),
  paddingLeft: theme.spacing(6),
  transition: theme.transitions.create("width"),
}));

const RecruiterDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const companyTheme = useCompanyTheme();

  const fetchDashboardData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        // Pass the forceRefresh parameter to the service
        const data = await hrService.getRecruiterDashboardData(forceRefresh);
        setDashboardData(data);
        setApplications(data.recentApplications || []);
        setJobs(data.activeJobs || []);
        setLoading(false);

        if (isRefreshing) {
          setIsRefreshing(false);
          setShowRefreshSuccess(true);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [isRefreshing]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // Handle close of success notification
  const handleCloseSuccessNotification = useCallback(() => {
    setShowRefreshSuccess(false);
  }, []);

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

  const filteredApplications = applications
    .filter(
      (app) =>
        app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((app) => statusFilter === "all" || app.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return theme.palette.warning.main;
      case "INTERVIEWING":
        return theme.palette.info.main;
      case "OFFER_SENT":
        return theme.palette.primary.main;
      case "REJECTED":
        return theme.palette.error.main;
      case "HIRED":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <ScheduleIcon fontSize="small" />;
      case "INTERVIEWING":
        return <PersonIcon fontSize="small" />;
      case "OFFER_SENT":
        return <MailIcon fontSize="small" />;
      case "REJECTED":
        return <CloseIcon fontSize="small" />;
      case "HIRED":
        return <CheckIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        <Grid container spacing={4}>
          {/* Dashboard Header */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                Recruiter Dashboard
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <IconButton
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }}
                >
                  <Badge badgeContent={4} color="error">
                    <NotificationsOutlined />
                  </Badge>
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/create-job")}
                  sx={{
                    background:
                      companyTheme.primaryGradient ||
                      "linear-gradient(135deg, #1E3A5F, #3B4D61)",
                    color: companyTheme.contrastText || "white",
                    boxShadow: "0 2px 8px rgba(30, 58, 95, 0.2)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #15293F, #2B3B4B)",
                    },
                  }}
                >
                  Post New Job
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.light, 0.2),
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total Applications
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData?.totalApplications || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.success.dark,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} />
                {dashboardData?.pendingReviews || 0} pending reviews
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.light, 0.2),
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <JobIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Active Jobs
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData?.totalJobs || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.primary.dark,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {dashboardData?.activeJobs?.length || 0} with active candidates
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.light, 0.2),
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Interviews
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                {dashboardData?.interviewScheduled || 0}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.info.dark,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Scheduled this week
              </Typography>
            </Paper>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Applications by Job
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dashboardData?.jobPerformanceData || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="applications"
                    fill={theme.palette.primary.main}
                    name="Applications"
                  />
                  <Bar
                    dataKey="interviews"
                    fill={theme.palette.info.main}
                    name="Interviews"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Application Status
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dashboardData?.statusCounts || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {(dashboardData?.statusCounts || []).map(
                        (entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getStatusColor(entry.name.toUpperCase())}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  {(dashboardData?.statusCounts || []).map((item: any) => (
                    <Chip
                      key={item.name}
                      label={`${item.name}: ${item.value}`}
                      sx={{
                        backgroundColor: alpha(
                          getStatusColor(item.name.toUpperCase()),
                          0.2
                        ),
                        color: getStatusColor(item.name.toUpperCase()),
                      }}
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ borderRadius: 2, mb: 4 }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Activity
                </Typography>
                <Grid container spacing={2}>
                  {(dashboardData?.recentActivity || []).map(
                    (activity: any) => (
                      <Grid item xs={12} key={activity.id}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            backgroundColor: alpha(
                              theme.palette.background.paper,
                              0.7
                            ),
                            borderRadius: 1,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          >
                            {getStatusIcon(activity.status)}
                          </Avatar>
                          <Box sx={{ ml: 2 }}>
                            <Typography variant="subtitle2">
                              {activity.applicantName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.jobTitle} - {activity.status}
                            </Typography>
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: "auto" }}
                          >
                            {formatDate(activity.timestamp)}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  )}
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Applications Table */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ borderRadius: 2 }}>
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Applications
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box sx={{ position: "relative" }}>
                      <SearchIcon
                        sx={{
                          position: "absolute",
                          left: 2,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "text.disabled",
                        }}
                      />
                      <SearchInput
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </Box>
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: 150,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      }}
                    >
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) =>
                          setStatusFilter(e.target.value as string)
                        }
                        label="Status"
                      >
                        <MenuItem value="all">All Statuses</MenuItem>
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="INTERVIEWING">Interviewing</MenuItem>
                        <MenuItem value="OFFER_SENT">Offer Sent</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                        <MenuItem value="HIRED">Hired</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Applicant</TableCell>
                        <TableCell>Job Position</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Applied On</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar>
                                {application.applicantName.charAt(0)}
                              </Avatar>
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="subtitle2">
                                  {application.applicantName}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {application.applicantEmail}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{application.jobTitle}</TableCell>
                          <TableCell>
                            <Chip
                              label={application.status}
                              size="small"
                              sx={{
                                backgroundColor: alpha(
                                  getStatusColor(application.status),
                                  0.1
                                ),
                                color: getStatusColor(application.status),
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {formatDate(application.createdAt)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <MailIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <PhoneIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <AssignmentIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
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
              Dashboard data successfully refreshed
            </Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default RecruiterDashboardPage;
