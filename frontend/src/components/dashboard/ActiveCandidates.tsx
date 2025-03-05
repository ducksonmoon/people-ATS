import React from "react";
import {
  Paper,
  Typography,
  Box,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  Person as PersonIcon,
  VisibilityOutlined as ViewIcon,
} from "@mui/icons-material";

interface Candidate {
  id: number | string;
  name: string;
  avatarUrl?: string;
  role: string;
  department: string;
  status: string;
  progress: number;
  nextInterview?: string | Date;
}

interface Department {
  name: string;
}

interface ActiveCandidatesProps {
  candidates: Candidate[];
  departments: Department[];
  departmentFilter: string;
  setDepartmentFilter: (department: string) => void;
  onViewCandidate: (id: number | string) => void;
  title?: string;
}

/**
 * Component for displaying active candidates with filtering
 */
const ActiveCandidates: React.FC<ActiveCandidatesProps> = ({
  candidates = [],
  departments = [],
  departmentFilter = "all",
  setDepartmentFilter,
  onViewCandidate,
  title = "Active Candidates",
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string): string => {
    const statusMap: Record<string, string> = {
      New: theme.palette.info.main,
      Screening: theme.palette.primary.main,
      Interview: theme.palette.secondary.main,
      Assessment: theme.palette.warning.main,
      "Final Interview": theme.palette.error.main,
      Offer: theme.palette.success.main,
      Rejected: theme.palette.error.light,
      "On Hold": theme.palette.grey[500],
    };

    return statusMap[status] || theme.palette.primary.main;
  };

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

        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Department</InputLabel>
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as string)}
            label="Filter by Department"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.name} value={dept.name}>
                {dept.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {candidates.length === 0 ? (
        <Box
          sx={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">
            No active candidates{" "}
            {departmentFilter !== "all" ? `in ${departmentFilter}` : ""} at this
            time
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ overflow: "auto", maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Candidate</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Next Interview</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => onViewCandidate(candidate.id)}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={candidate.avatarUrl}
                        sx={{
                          mr: 2,
                          bgcolor: !candidate.avatarUrl
                            ? `${theme.palette.primary.main}`
                            : undefined,
                        }}
                      >
                        {candidate.name.charAt(0)}
                      </Avatar>
                      <Typography fontWeight={500}>{candidate.name}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>{candidate.role}</TableCell>
                  <TableCell>{candidate.department}</TableCell>

                  <TableCell>
                    <Chip
                      label={candidate.status}
                      size="small"
                      sx={{
                        backgroundColor: alpha(
                          getStatusColor(candidate.status),
                          0.1
                        ),
                        color: getStatusColor(candidate.status),
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Tooltip title={`${candidate.progress}% Complete`}>
                      <LinearProgress
                        variant="determinate"
                        value={candidate.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          width: "100%",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                        }}
                      />
                    </Tooltip>
                  </TableCell>

                  <TableCell>
                    {candidate.nextInterview
                      ? new Date(candidate.nextInterview).toLocaleDateString()
                      : "Not scheduled"}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCandidate(candidate.id);
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

export default ActiveCandidates;
