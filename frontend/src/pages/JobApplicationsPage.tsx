import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Badge,
  LinearProgress,
  Menu,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  Card,
  CardContent,
  styled,
} from "@mui/material";
import {
  SearchOutlined,
  FilterListOutlined,
  GetAppOutlined,
  MoreVertOutlined,
  VisibilityOutlined,
  CheckCircleOutline,
  CancelOutlined,
  ForwardOutlined,
  MailOutline,
  EventOutlined,
  Person as PersonIcon,
  ArrowBack,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import useCompanyTheme from "../hooks/useCompanyTheme";

// Custom styled components
const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const JobApplicationsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedApplication, setSelectedApplication] = useState<number | null>(
    null
  );
  const companyTheme = useCompanyTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch job and applications data from the API
    const fetchData = async () => {
      try {
        // Fetch job details
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (!jobResponse.ok) {
          throw new Error(`Failed to fetch job: ${jobResponse.statusText}`);
        }
        const jobData = await jobResponse.json();

        // Fetch applications for this job
        const applicationsResponse = await fetch(
          `/api/jobs/${jobId}/applications`
        );
        if (!applicationsResponse.ok) {
          throw new Error(
            `Failed to fetch applications: ${applicationsResponse.statusText}`
          );
        }
        const applicationsData = await applicationsResponse.json();

        setJob(jobData);
        setApplications(applicationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load job applications. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    } else {
      setError("No job ID provided");
      setLoading(false);
    }
  }, [jobId]);

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    applicationId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(applicationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleActionClick = (action: string) => {
    console.log(
      `Performing action: ${action} on application ID: ${selectedApplication}`
    );

    // In a real implementation, you would update the application status:
    if (
      selectedApplication &&
      ["PENDING", "INTERVIEWING", "REJECTED", "OFFER_SENT", "HIRED"].includes(
        action
      )
    ) {
      const updatedApplications = applications.map((app) =>
        app.id === selectedApplication ? { ...app, status: action } : app
      );
      setApplications(updatedApplications);
    }

    handleMenuClose();
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(
      (app) =>
        (statusFilter === "all" || app.status === statusFilter) &&
        (app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        );
      } else if (sortBy === "name") {
        return a.candidateName.localeCompare(b.candidateName);
      } else {
        return 0;
      }
    });

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

  const getStatusChip = (status: string) => {
    const color = getStatusColor(status);
    const icon = getStatusIcon(status);

    return (
      <Chip
        icon={icon}
        label={status.replace("_", " ")}
        size="small"
        sx={{
          backgroundColor: alpha(color, 0.1),
          color: color,
          fontWeight: 600,
          borderRadius: 1,
        }}
      />
    );
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              mr: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: theme.palette.primary.main }}
            >
              Applications for {job.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {job.location} • {job.applicationsCount} total applications
            </Typography>
          </Box>
        </Box>

        {/* Job details card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Job Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {job.description}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip
                  label={job.department}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
                <Chip
                  label={job.location}
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                />
                <Chip
                  label={job.status}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.light, 0.1),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Hiring Progress
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Applications Reviewed
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      78%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={78}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.success.main, 0.2),
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: theme.palette.success.main,
                      },
                    }}
                  />
                </Paper>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<GetAppOutlined />}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Export
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<MailOutline />}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      background:
                        companyTheme.primaryGradient ||
                        "linear-gradient(135deg, #1E3A5F, #3B4D61)",
                      color: companyTheme.contrastText || "white",
                      "&:hover": {
                        background: "linear-gradient(135deg, #15293F, #2B3B4B)",
                      },
                    }}
                  >
                    Contact All
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Applications management */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              p: 3,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", flex: 1 }}>
              <TextField
                placeholder="Search applicants..."
                size="small"
                variant="outlined"
                sx={{ minWidth: 240 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: 150 }}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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

              <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: 150 }}
              >
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Application Date</MenuItem>
                  <MenuItem value="name">Applicant Name</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {filteredApplications.length}{" "}
                {filteredApplications.length === 1 ? "result" : "results"}
              </Typography>
            </Box>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Applied On</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <TableRow
                      key={application.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background-color 0.2s",
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        console.log(
                          `View application details for: ${application.id}`
                        );
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StyledBadge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            variant="dot"
                            sx={{ mr: 2 }}
                          >
                            <Avatar alt={application.candidateName}>
                              {application.candidateName.charAt(0)}
                            </Avatar>
                          </StyledBadge>
                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {application.candidateName}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <MailIcon fontSize="small" /> {application.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(application.appliedAt)}</TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {application.skills
                            .slice(0, 3)
                            .map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                              />
                            ))}
                          {application.skills.length > 3 && (
                            <Chip
                              label={`+${application.skills.length - 3}`}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                backgroundColor: alpha(
                                  theme.palette.grey[500],
                                  0.1
                                ),
                                color: theme.palette.grey[700],
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{application.experience}</TableCell>
                      <TableCell>{getStatusChip(application.status)}</TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="View Resume">
                            <IconButton
                              size="small"
                              sx={{
                                color: theme.palette.primary.main,
                                backgroundColor: alpha(
                                  theme.palette.primary.main,
                                  0.1
                                ),
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.primary.main,
                                    0.2
                                  ),
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  `View resume for: ${application.candidateName}`
                                );
                              }}
                            >
                              <AssignmentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Schedule Interview">
                            <IconButton
                              size="small"
                              sx={{
                                color: theme.palette.info.main,
                                backgroundColor: alpha(
                                  theme.palette.info.main,
                                  0.1
                                ),
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.info.main,
                                    0.2
                                  ),
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  `Schedule interview with: ${application.candidateName}`
                                );
                              }}
                            >
                              <EventOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="More Actions">
                            <IconButton
                              size="small"
                              sx={{
                                color: theme.palette.text.secondary,
                                "&:hover": {
                                  backgroundColor: alpha(
                                    theme.palette.text.secondary,
                                    0.1
                                  ),
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuClick(e, application.id);
                              }}
                            >
                              <MoreVertOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" sx={{ py: 3 }}>
                        No applications found matching your filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                minWidth: 180,
                borderRadius: 2,
                mt: 1,
              },
            }}
          >
            <MenuItem onClick={() => handleActionClick("PENDING")}>
              <ScheduleIcon
                fontSize="small"
                sx={{ mr: 1, color: theme.palette.warning.main }}
              />
              <Typography variant="body2">Mark as Pending</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleActionClick("INTERVIEWING")}>
              <PersonIcon
                fontSize="small"
                sx={{ mr: 1, color: theme.palette.info.main }}
              />
              <Typography variant="body2">Move to Interviewing</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleActionClick("OFFER_SENT")}>
              <MailIcon
                fontSize="small"
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
              <Typography variant="body2">Send Offer</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleActionClick("HIRED")}>
              <CheckIcon
                fontSize="small"
                sx={{ mr: 1, color: theme.palette.success.main }}
              />
              <Typography variant="body2">Mark as Hired</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => handleActionClick("REJECTED")}>
              <CloseIcon
                fontSize="small"
                sx={{ mr: 1, color: theme.palette.error.main }}
              />
              <Typography variant="body2">Reject Application</Typography>
            </MenuItem>
          </Menu>
        </Paper>
      </Container>
    </Box>
  );
};

export default JobApplicationsPage;
