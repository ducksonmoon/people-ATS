import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  Event as EventIcon,
  Note as NoteIcon,
  Videocam as VideocamIcon,
} from "@mui/icons-material";
import { Application, Interview } from "../../types/application";

interface ApplicationDetailsProps {
  application: Application;
  loading: boolean;
  actionLoading: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onChangeStatus: () => void;
  onAddComment: () => void;
  onScheduleInterview: () => void;
}

/**
 * Displays detailed information about an application
 */
const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  loading,
  actionLoading,
  errorMessage,
  onBack,
  onRefresh,
  onChangeStatus,
  onAddComment,
  onScheduleInterview,
}) => {
  const theme = useTheme();

  // Helper function to format a date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to format a date with time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get status color
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

  // Format meeting link
  const formatMeetingLink = (link: string | undefined) => {
    if (!link) return null;
    let formattedLink = link;
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      formattedLink = `https://${link}`;
    }
    return formattedLink;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={onBack}>
          Back to Applications
        </Button>

        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={onRefresh}>
              Retry
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading application details...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card elevation={1} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <CardHeader
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: getStatusColor(application.status),
                      width: 56,
                      height: 56,
                      color: "#fff",
                    }}
                  >
                    {application.candidate.name[0]}
                  </Avatar>
                }
                title={
                  <Typography variant="h6">
                    {application.candidate.name}
                  </Typography>
                }
                subheader={application.candidate.email}
              />
              <Divider />
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Applied on:</strong>{" "}
                    {formatDate(application.createdAt)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>Last updated:</strong>{" "}
                    {formatDate(application.updatedAt)}
                  </Typography>
                  {application.source && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Source:</strong>{" "}
                      {application.source.charAt(0).toUpperCase() +
                        application.source.slice(1).replace("_", " ")}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mr: 1 }}
                    >
                      <strong>Status:</strong>
                    </Typography>
                    <Chip
                      label={application.status.replace("_", " ")}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(application.status), 0.1),
                        color: getStatusColor(application.status),
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ mt: 2, fontWeight: 600 }}
                >
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onChangeStatus}
                  fullWidth
                  sx={{ mb: 1 }}
                  disabled={actionLoading}
                >
                  Change Status
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MessageIcon />}
                  onClick={onAddComment}
                  fullWidth
                  sx={{ mb: 1 }}
                  disabled={actionLoading}
                >
                  Add Comment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={onScheduleInterview}
                  fullWidth
                  disabled={actionLoading}
                >
                  Schedule Interview
                </Button>
              </CardContent>
            </Card>

            <Card
              elevation={1}
              sx={{ mt: 3, borderRadius: 2, overflow: "hidden" }}
            >
              <CardHeader
                title="Job Details"
                titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }}
              />
              <CardContent>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontWeight: 500 }}
                >
                  {application.job.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                    Department:
                  </Box>
                  {application.job.department?.name || "No Department"}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                    Category:
                  </Box>
                  {application.job.category?.name || "Uncategorized"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                    Location:
                  </Box>
                  {application.job.location?.name || "Remote"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Resume & Cover Letter
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {application.resumePath ? (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    href={application.resumePath}
                    target="_blank"
                    startIcon={<AssignmentIcon />}
                  >
                    View Resume
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No resume uploaded
                </Alert>
              )}

              {application.coverLetter ? (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    Cover Letter
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      maxHeight: 200,
                      overflow: "auto",
                      backgroundColor: alpha(
                        theme.palette.background.default,
                        0.5
                      ),
                    }}
                  >
                    <Typography variant="body2">
                      {application.coverLetter}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No cover letter provided
                </Alert>
              )}
            </Paper>

            <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Interviews
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<EventIcon />}
                  onClick={onScheduleInterview}
                >
                  Schedule New Interview
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {application.interviews?.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead
                      sx={{
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                      }}
                    >
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Date & Time
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Interviewer
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {application.interviews.map((interview: Interview) => (
                        <TableRow key={interview.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDateTime(interview.scheduledAt)}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              color="text.secondary"
                            >
                              {interview.duration} mins
                            </Typography>
                          </TableCell>
                          <TableCell>{interview.type}</TableCell>
                          <TableCell>
                            {interview.location || "-"}
                            {interview.meetingLink && (
                              <Box mt={1}>
                                <Button
                                  href={formatMeetingLink(
                                    interview.meetingLink
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  startIcon={<VideocamIcon fontSize="small" />}
                                  variant="outlined"
                                >
                                  Join
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {interview.interviewer.name}
                            </Typography>
                            {interview.interviewer.email && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                {interview.interviewer.email}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={interview.status}
                              size="small"
                              color={
                                interview.status === "COMPLETED"
                                  ? "success"
                                  : interview.status === "SCHEDULED"
                                  ? "primary"
                                  : "default"
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {interview.feedback ? (
                              <Tooltip title={interview.feedback}>
                                <IconButton size="small">
                                  <NoteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">No interviews scheduled yet</Alert>
              )}
            </Paper>

            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Notes & Comments
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<MessageIcon />}
                  onClick={onAddComment}
                >
                  Add Comment
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {application.note ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    maxHeight: 300,
                    overflow: "auto",
                    backgroundColor: alpha(
                      theme.palette.background.default,
                      0.5
                    ),
                  }}
                >
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}
                  >
                    {application.note}
                  </Typography>
                </Paper>
              ) : (
                <Alert severity="info">No notes or comments yet</Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ApplicationDetails;
