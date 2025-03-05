import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Typography,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Button,
  Paper,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Message as MessageIcon,
  Event as EventIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { Application } from "../../types/application";

interface ApplicationListProps {
  applications: Application[];
  loading: boolean;
  onViewDetails: (application: Application) => void;
  onChangeStatus: (application: Application) => void;
  onAddComment: (application: Application) => void;
  onScheduleInterview: (application: Application) => void;
  clearFilters: () => void;
}

/**
 * Displays a list of applications in a table format with actions
 */
const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  loading,
  onViewDetails,
  onChangeStatus,
  onAddComment,
  onScheduleInterview,
  clearFilters,
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

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading applications...</Typography>
      </Box>
    );
  }

  if (applications.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          No applications found matching your filters.
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ mt: 2 }}
          onClick={clearFilters}
        >
          Clear Filters
        </Button>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ borderRadius: 0, boxShadow: "none" }}
    >
      <Table>
        <TableHead
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          }}
        >
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Candidate</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Job Position</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Applied Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((application) => (
            <TableRow
              key={application.id}
              hover
              sx={{
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.03),
                },
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onClick={() => onViewDetails(application)}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: getStatusColor(application.status),
                      color: "#fff",
                    }}
                  >
                    {application.candidate?.name?.[0] || "C"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {application.candidate?.name || "Unknown Candidate"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {application.candidate?.email || "No email"}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2">
                  {application.job?.title || "Unknown Position"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {application.job?.department?.name || "No Department"}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={application.status.replace("_", " ")}
                  size="small"
                  sx={{
                    bgcolor: alpha(getStatusColor(application.status), 0.1),
                    color: getStatusColor(application.status),
                    fontWeight: 500,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
                {application.interviews &&
                  application.interviews.length > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        size="small"
                        icon={<EventIcon fontSize="small" />}
                        label={`${application.interviews.length} interview${
                          application.interviews.length === 1 ? "" : "s"
                        }`}
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                      />
                    </Box>
                  )}
              </TableCell>
              <TableCell>
                {application.source ? (
                  <Chip
                    label={
                      application.source.charAt(0).toUpperCase() +
                      application.source.slice(1).replace("_", " ")
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      bgcolor: alpha(theme.palette.info.light, 0.1),
                      color: theme.palette.info.dark,
                      borderColor: theme.palette.info.light,
                      fontWeight: 500,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Direct
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(application.createdAt)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {formatDate(application.updatedAt)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    "& .MuiIconButton-root": { ml: 0.5 },
                  }}
                >
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(application);
                      }}
                      size="small"
                      aria-label="view details"
                    >
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Change Status">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onChangeStatus(application);
                      }}
                      size="small"
                      aria-label="change status"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add Comment">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComment(application);
                      }}
                      size="small"
                      aria-label="add comment"
                    >
                      <MessageIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Schedule Interview">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleInterview(application);
                      }}
                      size="small"
                      aria-label="schedule interview"
                    >
                      <EventIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ApplicationList;
