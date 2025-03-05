import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  TextField,
  IconButton,
  Alert,
  DialogContentText,
} from "@mui/material";
import {
  Event as EventIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { hrService } from "../services/hr.service";
import { useSnackbar } from "notistack";

// Setup the localizer
const localizer = momentLocalizer(moment);

const InterviewCalendarPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [confirmCancelDialog, setConfirmCancelDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [interviewStatus, setInterviewStatus] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching interviews...");
      const data = await hrService.getAllInterviews();
      console.log("Interviews data:", data);

      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid interview data received");
      }

      const formattedInterviews = data.map((interview) => ({
        id: interview.id,
        title: `${interview.application?.job?.title || "Unknown Job"} - ${
          interview.application?.candidate?.name || "Unknown Candidate"
        }`,
        start: new Date(interview.scheduledAt),
        end: new Date(
          new Date(interview.scheduledAt).getTime() + interview.duration * 60000
        ),
        interview: interview,
      }));

      setInterviews(formattedInterviews);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setError(error.message || "Failed to load interviews");
      enqueueSnackbar("Failed to load interviews", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedInterview(event.interview);
    setViewDialog(true);
    setFeedback(event.interview.feedback || "");
    setInterviewStatus(event.interview.status);
  };

  const handleUpdateInterview = async () => {
    try {
      setLoading(true);
      await hrService.updateInterview(selectedInterview.id, {
        feedback,
        status: interviewStatus,
      });
      fetchInterviews();
      setUpdateDialog(false);
      setViewDialog(false);
      enqueueSnackbar("Interview updated successfully", { variant: "success" });
    } catch (error) {
      console.error("Error updating interview:", error);
      enqueueSnackbar("Failed to update interview", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInterview = () => {
    setConfirmCancelDialog(true);
  };

  const confirmCancelInterview = async () => {
    try {
      setLoading(true);
      await hrService.updateInterview(selectedInterview.id, {
        status: "CANCELLED",
      });
      fetchInterviews();
      setConfirmCancelDialog(false);
      setUpdateDialog(false);
      setViewDialog(false);
      enqueueSnackbar("Interview cancelled successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error cancelling interview:", error);
      enqueueSnackbar("Failed to cancel interview", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return theme.palette.success.main;
      case "SCHEDULED":
        return theme.palette.primary.main;
      case "CANCELLED":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const eventStyleGetter = (event) => {
    const status = event.interview.status;
    return {
      style: {
        backgroundColor: getStatusColor(status),
        opacity: status === "CANCELLED" ? 0.5 : 1,
      },
    };
  };

  // If there's an error, display it with a retry button
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<RefreshIcon />}
          variant="contained"
          onClick={fetchInterviews}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  // Show loading state
  if (loading && interviews.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Interview Calendar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all scheduled interviews in one place
        </Typography>
      </Box>

      {interviews.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No interviews scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no interviews currently scheduled in the system.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={interviews}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={["month", "week", "day", "agenda"]}
            />
          </Box>
        </Paper>
      )}

      {/* Interview Details Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Interview Details
          {selectedInterview && (
            <Chip
              label={selectedInterview.status}
              size="small"
              sx={{
                ml: 2,
                backgroundColor: getStatusColor(selectedInterview.status),
                color: "white",
              }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <WorkIcon sx={{ mr: 1 }} />
                      Job Details
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Position:</strong>{" "}
                      {selectedInterview.application.job.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Department:</strong>{" "}
                      {selectedInterview.application.job.department?.name ||
                        "N/A"}
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <PersonIcon sx={{ mr: 1 }} />
                      Candidate
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Name:</strong>{" "}
                      {selectedInterview.application.candidate.name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Email:</strong>{" "}
                      {selectedInterview.application.candidate.email}
                    </Typography>
                    {selectedInterview.application.resumePath && (
                      <Button
                        variant="outlined"
                        size="small"
                        href={selectedInterview.application.resumePath}
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        View Resume
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <EventIcon sx={{ mr: 1 }} />
                      Interview Information
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Date & Time:</strong>{" "}
                      {moment(selectedInterview.scheduledAt).format(
                        "MMMM D, YYYY h:mm A"
                      )}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Duration:</strong> {selectedInterview.duration}{" "}
                      minutes
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Type:</strong> {selectedInterview.type}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Location:</strong>{" "}
                      {selectedInterview.location || "N/A"}
                    </Typography>
                    {selectedInterview.meetingLink && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VideoCallIcon />}
                        href={
                          selectedInterview.meetingLink.startsWith("http")
                            ? selectedInterview.meetingLink
                            : `https://${selectedInterview.meetingLink}`
                        }
                        target="_blank"
                        sx={{ mt: 1 }}
                      >
                        Join Meeting
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                    >
                      <EditIcon sx={{ mr: 1 }} />
                      Feedback
                    </Typography>
                    {!updateDialog ? (
                      <>
                        <Typography variant="body1" gutterBottom>
                          {selectedInterview.feedback ||
                            "No feedback provided yet"}
                        </Typography>
                        <Button
                          variant="outlined"
                          sx={{ mt: 2 }}
                          onClick={() => setUpdateDialog(true)}
                        >
                          {selectedInterview.feedback
                            ? "Update Feedback"
                            : "Add Feedback"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Interview Feedback"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => setInterviewStatus("COMPLETED")}
                            sx={{
                              bgcolor:
                                interviewStatus === "COMPLETED"
                                  ? "success.light"
                                  : "inherit",
                            }}
                          >
                            Complete
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={handleCancelInterview}
                            sx={{
                              bgcolor:
                                interviewStatus === "CANCELLED"
                                  ? "error.light"
                                  : "inherit",
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
          {updateDialog && (
            <>
              <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
              <Button
                onClick={handleUpdateInterview}
                variant="contained"
                color="primary"
              >
                Save Changes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirm Cancel Dialog */}
      <Dialog
        open={confirmCancelDialog}
        onClose={() => setConfirmCancelDialog(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this interview? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelDialog(false)}>
            No, Keep Interview
          </Button>
          <Button
            onClick={confirmCancelInterview}
            color="error"
            variant="contained"
          >
            Yes, Cancel Interview
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InterviewCalendarPage;
