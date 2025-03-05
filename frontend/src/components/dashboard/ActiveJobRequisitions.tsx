import React from "react";
import {
  Paper,
  Typography,
  Box,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  alpha,
  Badge,
  Tooltip,
  Button,
} from "@mui/material";
import {
  BusinessCenter as JobIcon,
  Add as AddIcon,
  VisibilityOutlined as ViewIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { JobRequisition } from "../../types";

interface ActiveJobRequisitionsProps {
  jobs: JobRequisition[];
  onViewJob: (id: number | string) => void;
  onCreateJob?: () => void;
  title?: string;
}

/**
 * Component for displaying active job requisitions
 */
const ActiveJobRequisitions: React.FC<ActiveJobRequisitionsProps> = ({
  jobs = [],
  onViewJob,
  onCreateJob,
  title = "Active Job Requisitions",
}) => {
  const theme = useTheme();

  // Prioritize jobs with HIGH priority first, then by most recent
  const sortedJobs = React.useMemo(() => {
    return [...jobs].sort((a, b) => {
      // First sort by priority
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      const priorityDiff =
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder];

      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        {onCreateJob && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onCreateJob}
            sx={{
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            Create Job Requisition
          </Button>
        )}
      </Box>

      {jobs.length === 0 ? (
        <Box
          sx={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography color="text.secondary">
            No active job requisitions at this time
          </Typography>

          {onCreateJob && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateJob}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Create Your First Job Requisition
            </Button>
          )}
        </Box>
      ) : (
        <TableContainer sx={{ overflow: "auto", maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Open Positions</TableCell>
                <TableCell align="right">Applications</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Posted Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedJobs.map((job) => (
                <TableRow
                  key={job.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                    cursor: "pointer",
                    // Highlight high priority jobs
                    ...(job.priority === "HIGH" && {
                      backgroundColor: alpha(theme.palette.error.light, 0.05),
                    }),
                  }}
                  onClick={() => onViewJob(job.id)}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <JobIcon
                        sx={{
                          mr: 1.5,
                          color: theme.palette.primary.main,
                          opacity: 0.8,
                        }}
                      />
                      <Typography fontWeight={500}>{job.title}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>{job.department}</TableCell>

                  <TableCell align="right">
                    <Chip
                      label={job.openPositions}
                      size="small"
                      color={job.openPositions > 1 ? "primary" : "default"}
                      sx={{
                        minWidth: 40,
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Badge
                      badgeContent={job.applicationsCount}
                      color={
                        job.applicationsCount > 20
                          ? "success"
                          : job.applicationsCount > 5
                          ? "primary"
                          : "default"
                      }
                      max={99}
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.75rem",
                          height: 20,
                          minWidth: 20,
                          borderRadius: "10px",
                        },
                      }}
                    >
                      <Box sx={{ width: 24, height: 24 }} />
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={job.priority}
                      size="small"
                      color={
                        job.priority === "HIGH"
                          ? "error"
                          : job.priority === "MEDIUM"
                          ? "warning"
                          : "default"
                      }
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewJob(job.id);
                      }}
                      sx={{
                        color: theme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        },
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default ActiveJobRequisitions;
