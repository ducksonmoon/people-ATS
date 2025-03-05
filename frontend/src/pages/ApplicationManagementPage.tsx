import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip,
  Badge,
  InputBase,
  InputAdornment,
  CircularProgress,
  Backdrop,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  BusinessCenter as JobIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  Message as MessageIcon,
  Note as NoteIcon,
  Event as EventIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Videocam as VideocamIcon,
  Refresh as RefreshIcon,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { hrService } from "../services/hr.service";
import { useSnackbar } from "notistack";

// Import types
import {
  Application,
  ApplicationStatus,
  InterviewFormState,
  Interviewer,
} from "../types/application";

// Import components
import ApplicationList from "../components/application/ApplicationList";
import ApplicationDetails from "../components/application/ApplicationDetails";
import ApplicationFilters from "../components/application/ApplicationFilters";
import StatusChangeDialog from "../components/application/StatusChangeDialog";
import CommentDialog from "../components/application/CommentDialog";
import InterviewDialog from "../components/application/InterviewDialog";

// Initial state for the interview form
const initialInterviewForm: InterviewFormState = {
  date: new Date(),
  duration: 60,
  type: "INITIAL",
  location: "",
  meetingLink: "",
  notes: "",
  interviewer: null,
};

/**
 * Main page for managing job applications
 */
const ApplicationManagementPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // State for loading indicators
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Application data state
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [currentApplication, setCurrentApplication] =
    useState<Application | null>(null);

  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsView, setDetailsView] = useState(false);

  // Dialog state
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [openInterviewDialog, setOpenInterviewDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Form state
  const [newStatus, setNewStatus] = useState<ApplicationStatus>("PENDING");
  const [comment, setComment] = useState("");
  const [interviewForm, setInterviewForm] =
    useState<InterviewFormState>(initialInterviewForm);

  // Error handling
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Interviewers list
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);

  /**
   * Fetches all applications from the API
   */
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await hrService.getAllApplications();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setErrorMessage("Failed to load applications. Please try again.");
      enqueueSnackbar("Failed to load applications", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  /**
   * Fetches interviewers list from the API
   */
  const fetchInterviewers = useCallback(async () => {
    try {
      const data = await hrService.getInterviewers();
      setInterviewers(data);
    } catch (error) {
      console.error("Error fetching interviewers:", error);
      enqueueSnackbar("Failed to load interviewers", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  // Initial data loading
  useEffect(() => {
    fetchApplications();
    fetchInterviewers();
  }, [fetchApplications, fetchInterviewers]);

  /**
   * Gets the status based on tab index
   */
  const getTabStatus = (tabIndex: number): string => {
    switch (tabIndex) {
      case 0:
        return "all";
      case 1:
        return "PENDING";
      case 2:
        return "INTERVIEWING";
      case 3:
        return "OFFER_SENT";
      case 4:
        return "HIRED";
      case 5:
        return "REJECTED";
      default:
        return "all";
    }
  };

  /**
   * Handles tab changes and updates the status filter
   */
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setStatusFilter(getTabStatus(newValue));
  };

  /**
   * Updates interview form field values
   */
  const handleInterviewFormChange = (
    field: keyof InterviewFormState,
    value: any
  ) => {
    setInterviewForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Resets the interview form to initial state
   */
  const resetInterviewForm = () => {
    setInterviewForm(initialInterviewForm);
  };

  /**
   * Helper for optimistic updates to application data
   */
  const optimisticUpdateApplication = (
    applicationId: number,
    updates: Partial<Application>
  ) => {
    // Update the applications list
    setApplications((prevApplications) =>
      prevApplications.map((app) =>
        app.id === applicationId ? { ...app, ...updates } : app
      )
    );

    // If we're viewing the details of this application, update that too
    if (currentApplication && currentApplication.id === applicationId) {
      setCurrentApplication((prev) => ({ ...prev!, ...updates }));
    }
  };

  /**
   * Handles changing an application's status
   */
  const handleStatusChange = async () => {
    if (!selectedApplication || !newStatus) {
      return;
    }

    setActionLoading(true);
    const applicationId = selectedApplication.id;

    try {
      // Optimistic update
      const updatedAt = new Date().toISOString();
      optimisticUpdateApplication(applicationId, {
        status: newStatus,
        updatedAt,
      });

      // API call
      await hrService.updateApplicationStatus(applicationId, newStatus);
      enqueueSnackbar("Application status updated successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      // Revert optimistic update by re-fetching
      fetchApplications();
      enqueueSnackbar("Failed to update application status", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
      setOpenStatusDialog(false);
    }
  };

  /**
   * Handles adding a comment to an application
   */
  const handleAddComment = async () => {
    if (!selectedApplication || !comment.trim()) {
      return;
    }

    setActionLoading(true);
    const applicationId = selectedApplication.id;

    try {
      // Optimistic update
      const updatedAt = new Date().toISOString();
      const currentApplication = applications.find(
        (app) => app.id === applicationId
      );

      if (currentApplication) {
        const updatedNote = currentApplication.note
          ? `${
              currentApplication.note
            }\n\n${new Date().toLocaleString()}: ${comment}`
          : `${new Date().toLocaleString()}: ${comment}`;

        optimisticUpdateApplication(applicationId, {
          note: updatedNote,
          updatedAt,
        });
      }

      // API call
      await hrService.addApplicationComment(applicationId, comment);
      enqueueSnackbar("Comment added successfully", { variant: "success" });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      // Revert optimistic update by re-fetching
      fetchApplications();
      enqueueSnackbar("Failed to add comment", { variant: "error" });
    } finally {
      setActionLoading(false);
      setOpenCommentDialog(false);
    }
  };

  /**
   * Validates the interview form before submission
   */
  const validateInterviewForm = (): boolean => {
    if (!interviewForm.date) {
      enqueueSnackbar("Please select an interview date", { variant: "error" });
      return false;
    }

    if (!interviewForm.interviewer) {
      enqueueSnackbar("Please select an interviewer", { variant: "error" });
      return false;
    }

    if (interviewForm.duration < 15) {
      enqueueSnackbar("Interview duration must be at least 15 minutes", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  /**
   * Handles scheduling an interview
   */
  const handleScheduleInterview = async () => {
    if (!selectedApplication) {
      return;
    }

    if (!validateInterviewForm()) {
      return;
    }

    setActionLoading(true);
    const applicationId = selectedApplication.id;

    try {
      // Find the interviewer object
      const interviewer = interviewers.find(
        (i) => i.id === interviewForm.interviewer
      );

      if (!interviewer) {
        throw new Error("Selected interviewer not found");
      }

      // Create interview object for optimistic update
      const newInterview = {
        id: Date.now(), // temporary ID
        scheduledAt:
          interviewForm.date instanceof Date
            ? interviewForm.date.toISOString()
            : new Date(interviewForm.date).toISOString(),
        duration: interviewForm.duration,
        type: interviewForm.type,
        location: interviewForm.location,
        meetingLink: interviewForm.meetingLink,
        status: "SCHEDULED",
        interviewer,
      };

      // Optimistic update
      const updatedAt = new Date().toISOString();
      const currentApplication = applications.find(
        (app) => app.id === applicationId
      );

      const appUpdates: Partial<Application> = {
        status: "INTERVIEWING",
        updatedAt,
      };

      if (currentApplication) {
        appUpdates.interviews = [
          ...(currentApplication.interviews || []),
          newInterview as any,
        ];
      }

      optimisticUpdateApplication(applicationId, appUpdates);

      // API call
      await hrService.scheduleInterview(applicationId, {
        scheduledAt: newInterview.scheduledAt,
        duration: interviewForm.duration,
        type: interviewForm.type,
        location: interviewForm.location,
        meetingLink: interviewForm.meetingLink,
        notes: interviewForm.notes,
        interviewerId: interviewForm.interviewer,
      });

      enqueueSnackbar("Interview scheduled successfully", {
        variant: "success",
      });
      resetInterviewForm();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      // Revert optimistic update by re-fetching
      fetchApplications();
      enqueueSnackbar("Failed to schedule interview", { variant: "error" });
    } finally {
      setActionLoading(false);
      setOpenInterviewDialog(false);
    }
  };

  /**
   * Handles viewing application details
   */
  const handleViewDetails = async (application: Application) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // In a real app, you might want to fetch the full details
      const applicationDetails = await hrService.getApplicationById(
        application.id
      );
      setCurrentApplication(applicationDetails);
      setDetailsView(true);
    } catch (error) {
      console.error("Error fetching application details:", error);
      setErrorMessage("Failed to load application details. Please try again.");
      enqueueSnackbar("Failed to load application details", {
        variant: "error",
      });
      // Fall back to the application from the list
      setCurrentApplication(application);
      setDetailsView(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Event handler for changing status in the dialog
   */
  const handleStatusSelectChange = (event: SelectChangeEvent) => {
    setNewStatus(event.target.value as ApplicationStatus);
  };

  /**
   * Event handler for changing comment in the dialog
   */
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  /**
   * Filter applications based on search and status filter
   */
  const filteredApplications = applications
    .filter((app) => {
      if (statusFilter === "all") return true;
      return app.status === statusFilter;
    })
    .filter((app) => {
      if (sourceFilter === "all") return true;
      if (sourceFilter === "direct") return !app.source;
      return app.source === sourceFilter;
    })
    .filter((app) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        app.candidate.name.toLowerCase().includes(searchLower) ||
        app.job.title.toLowerCase().includes(searchLower)
      );
    });

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setStatusFilter("all");
    setSourceFilter("all");
    setSearchTerm("");
    setTabValue(0);
  };

  /**
   * Open status change dialog with selected application
   */
  const handleOpenStatusDialog = (application: Application) => {
    setSelectedApplication(application);
    setNewStatus(application.status as ApplicationStatus);
    setOpenStatusDialog(true);
  };

  /**
   * Open comment dialog with selected application
   */
  const handleOpenCommentDialog = (application: Application) => {
    setSelectedApplication(application);
    setComment("");
    setOpenCommentDialog(true);
  };

  /**
   * Open interview dialog with selected application
   */
  const handleOpenInterviewDialog = (application: Application) => {
    setSelectedApplication(application);
    resetInterviewForm();
    setOpenInterviewDialog(true);
  };

  // Helper method to handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Helper method to handle status filter change
  const handleStatusFilterChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  // Helper method to handle source filter change
  const handleSourceFilterChange = (e: SelectChangeEvent) => {
    setSourceFilter(e.target.value);
  };

  if (loading && !detailsView) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If we're in details view, render the ApplicationDetails component
  if (detailsView && currentApplication) {
    return (
      <>
        <ApplicationDetails
          application={currentApplication}
          loading={loading}
          actionLoading={actionLoading}
          errorMessage={errorMessage}
          onBack={() => setDetailsView(false)}
          onRefresh={() => handleViewDetails(currentApplication)}
          onChangeStatus={() => handleOpenStatusDialog(currentApplication)}
          onAddComment={() => handleOpenCommentDialog(currentApplication)}
          onScheduleInterview={() =>
            handleOpenInterviewDialog(currentApplication)
          }
        />

        {/* Render the dialogs for actions */}
        <StatusChangeDialog
          open={openStatusDialog}
          status={newStatus}
          loading={actionLoading}
          onClose={() => setOpenStatusDialog(false)}
          onStatusChange={handleStatusChange}
          onChange={handleStatusSelectChange}
        />

        <CommentDialog
          open={openCommentDialog}
          comment={comment}
          loading={actionLoading}
          onClose={() => setOpenCommentDialog(false)}
          onAddComment={handleAddComment}
          onChange={handleCommentChange}
        />

        <InterviewDialog
          open={openInterviewDialog}
          form={interviewForm}
          loading={actionLoading}
          interviewers={interviewers}
          onClose={() => setOpenInterviewDialog(false)}
          onSchedule={handleScheduleInterview}
          onChange={handleInterviewFormChange}
        />
      </>
    );
  }

  // Main applications list view
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
        <Typography variant="h4" component="h1" fontWeight="bold">
          Application Management
        </Typography>
      </Box>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Box sx={{ ml: 2 }}>
              <Typography
                variant="button"
                sx={{ cursor: "pointer" }}
                onClick={fetchApplications}
              >
                Retry
              </Typography>
            </Box>
          }
        >
          {errorMessage}
        </Alert>
      )}

      <Paper elevation={1} sx={{ mb: 4, overflow: "hidden", borderRadius: 2 }}>
        {/* Filters component */}
        <ApplicationFilters
          tabValue={tabValue}
          statusFilter={statusFilter}
          sourceFilter={sourceFilter}
          searchTerm={searchTerm}
          applications={applications}
          onTabChange={handleTabChange}
          onStatusFilterChange={handleStatusFilterChange}
          onSourceFilterChange={handleSourceFilterChange}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
        />

        {/* Application list component */}
        <ApplicationList
          applications={filteredApplications}
          loading={loading}
          onViewDetails={handleViewDetails}
          onChangeStatus={handleOpenStatusDialog}
          onAddComment={handleOpenCommentDialog}
          onScheduleInterview={handleOpenInterviewDialog}
          clearFilters={handleClearFilters}
        />
      </Paper>

      {/* Dialogs for actions */}
      <StatusChangeDialog
        open={openStatusDialog}
        status={newStatus}
        loading={actionLoading}
        onClose={() => setOpenStatusDialog(false)}
        onStatusChange={handleStatusChange}
        onChange={handleStatusSelectChange}
      />

      <CommentDialog
        open={openCommentDialog}
        comment={comment}
        loading={actionLoading}
        onClose={() => setOpenCommentDialog(false)}
        onAddComment={handleAddComment}
        onChange={handleCommentChange}
      />

      <InterviewDialog
        open={openInterviewDialog}
        form={interviewForm}
        loading={actionLoading}
        interviewers={interviewers}
        onClose={() => setOpenInterviewDialog(false)}
        onSchedule={handleScheduleInterview}
        onChange={handleInterviewFormChange}
      />

      {/* Loading overlay for background operations */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={actionLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
};

export default ApplicationManagementPage;
