import React from "react";
import {
  Paper,
  Typography,
  Box,
  useTheme,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward,
  Edit as EditIcon,
} from "@mui/icons-material";

interface Department {
  name: string;
  current: number;
  target: number;
  hired: number;
}

interface DepartmentHiringProgressProps {
  departments: Department[];
  title?: string;
  onViewGoals?: () => void;
  onManageGoals?: () => void;
}

/**
 * Component for displaying department hiring progress
 */
const DepartmentHiringProgress: React.FC<DepartmentHiringProgressProps> = ({
  departments = [],
  title = "Department Hiring Progress",
  onViewGoals,
  onManageGoals,
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
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

        <Button
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={onManageGoals}
          sx={{
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Manage Goals
        </Button>
      </Box>

      {departments.length === 0 ? (
        <Box
          sx={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography color="text.secondary">
            No department hiring data available
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell align="right">Current</TableCell>
                  <TableCell align="right">Target</TableCell>
                  <TableCell align="right">Recent Hires</TableCell>
                  <TableCell align="right">Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.name}>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <BusinessIcon
                          sx={{
                            mr: 1,
                            color: theme.palette.primary.main,
                            opacity: 0.7,
                          }}
                        />
                        <Typography variant="body1">
                          {department.name}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell align="right">{department.current}</TableCell>

                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Typography variant="body1">
                          {department.target}
                        </Typography>
                        {department.target > department.current && (
                          <Tooltip title="Hiring needed">
                            <Chip
                              label={`+${
                                department.target - department.current
                              }`}
                              size="small"
                              color="primary"
                              sx={{
                                ml: 1,
                                height: 20,
                                fontSize: "0.65rem",
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Typography>{department.hired}</Typography>
                        {department.hired > 0 && (
                          <TrendingUpIcon
                            fontSize="small"
                            color="success"
                            sx={{ ml: 0.5, opacity: 0.8 }}
                          />
                        )}
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <LinearProgress
                          variant="determinate"
                          value={(department.current / department.target) * 100}
                          sx={{
                            width: "100%",
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, minWidth: 30 }}
                        >
                          {Math.round(
                            (department.current / department.target) * 100
                          )}
                          %
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {onViewGoals && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                endIcon={<ArrowUpward />}
                size="small"
                onClick={onViewGoals}
                sx={{ textTransform: "none" }}
              >
                View detailed hiring goals
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default DepartmentHiringProgress;
