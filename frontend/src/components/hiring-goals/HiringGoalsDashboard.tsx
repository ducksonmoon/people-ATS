import React, { useMemo } from "react";
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  useTheme,
  LinearProgress,
} from "@mui/material";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import { DepartmentGoal } from "../../types/hiring-goal";
import { HiringGoalPriority, HiringGoalStatus } from "../../types/hiring-enums";
import { getHealthScoreColor } from "../../utils/hiringGoalsUtils";

interface HiringGoalsDashboardProps {
  departmentData: DepartmentGoal[];
}

const HiringGoalsDashboard: React.FC<HiringGoalsDashboardProps> = ({
  departmentData,
}) => {
  const theme = useTheme();

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    if (!departmentData.length) {
      return {
        totalGoals: 0,
        totalTargetHeadcount: 0,
        departmentsOnTrack: 0,
        completedGoals: 0,
        averageHealthScore: 0,
        statusBreakdown: [],
        priorityBreakdown: [],
      };
    }

    const totalGoals = departmentData.length;
    const totalTargetHeadcount = departmentData.reduce(
      (sum, dept) => sum + dept.targetHeadcount,
      0
    );
    const completedGoals = departmentData.filter(
      (dept) => dept.status === HiringGoalStatus.COMPLETED
    ).length;
    const departmentsOnTrack = departmentData.filter(
      (dept) => dept.healthScore >= 70
    ).length;
    const averageHealthScore =
      departmentData.reduce((sum, dept) => sum + dept.healthScore, 0) /
      totalGoals;

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    departmentData.forEach((dept) => {
      statusCounts[dept.status] = (statusCounts[dept.status] || 0) + 1;
    });

    const statusBreakdown = Object.entries(statusCounts).map(
      ([status, count]) => ({
        name: status.replace(/_/g, " "),
        value: count,
        percentage: Math.round((count / totalGoals) * 100),
      })
    );

    // Priority breakdown
    const priorityCounts: Record<string, number> = {};
    departmentData.forEach((dept) => {
      priorityCounts[dept.priority] = (priorityCounts[dept.priority] || 0) + 1;
    });

    const priorityBreakdown = Object.entries(priorityCounts).map(
      ([priority, count]) => ({
        name: priority,
        value: count,
        percentage: Math.round((count / totalGoals) * 100),
      })
    );

    return {
      totalGoals,
      totalTargetHeadcount,
      departmentsOnTrack,
      completedGoals,
      averageHealthScore,
      statusBreakdown,
      priorityBreakdown,
    };
  }, [departmentData]);

  // Colors for the charts
  const statusColors = {
    "NOT STARTED": theme.palette.grey[500],
    "IN PROGRESS": theme.palette.primary.main,
    "ON HOLD": theme.palette.warning.main,
    COMPLETED: theme.palette.success.main,
    "AT RISK": theme.palette.error.main,
  };

  const priorityColors = {
    HIGH: theme.palette.error.main,
    MEDIUM: theme.palette.warning.main,
    LOW: theme.palette.info.main,
  };

  const healthScoreColor = getHealthScoreColor(
    dashboardMetrics.averageHealthScore
  );

  // Custom tooltip component for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <Typography variant="body2">{`${payload[0].name}: ${payload[0].value} (${payload[0].payload.percentage}%)`}</Typography>
        </Box>
      );
    }
    return null;
  };

  if (!departmentData.length) {
    return (
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            textAlign: "center",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            No hiring goals data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add department hiring goals to see the dashboard.
          </Typography>
        </Paper>
      </Grid>
    );
  }

  return (
    <>
      {/* Summary cards */}
      <Grid item xs={12} md={3}>
        <Card
          elevation={0}
          sx={{
            height: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "100%",
            }}
          >
            <TimelineIcon
              sx={{
                fontSize: 48,
                color: theme.palette.primary.main,
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              {dashboardMetrics.totalGoals}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Active Hiring Goals
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card
          elevation={0}
          sx={{
            height: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "100%",
            }}
          >
            <TrendingUpIcon
              sx={{
                fontSize: 48,
                color: theme.palette.success.main,
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              {dashboardMetrics.totalTargetHeadcount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Total Target Headcount
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card
          elevation={0}
          sx={{
            height: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "100%",
            }}
          >
            <AssignmentIcon
              sx={{
                fontSize: 48,
                color: theme.palette.warning.main,
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              {dashboardMetrics.departmentsOnTrack}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Departments On Track
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Typography variant="caption" sx={{ mr: 1 }}>
                {Math.round(
                  (dashboardMetrics.departmentsOnTrack /
                    dashboardMetrics.totalGoals) *
                    100
                )}
                %
              </Typography>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={
                    (dashboardMetrics.departmentsOnTrack /
                      dashboardMetrics.totalGoals) *
                    100
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card
          elevation={0}
          sx={{
            height: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "translateY(-5px)",
            },
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "100%",
            }}
          >
            <SpeedIcon
              sx={{
                fontSize: 48,
                color: healthScoreColor.background,
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: "bold" }}
            >
              {Math.round(dashboardMetrics.averageHealthScore)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Average Health Score
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={dashboardMetrics.averageHealthScore}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: theme.palette.grey[200],
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: healthScoreColor.background,
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Charts section */}
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Hiring Goal Status
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardMetrics.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dashboardMetrics.statusBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        statusColors[entry.name as keyof typeof statusColors] ||
                        theme.palette.grey[500]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            height: "100%",
            borderRadius: 2,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Priority Distribution
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardMetrics.priorityBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {dashboardMetrics.priorityBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        priorityColors[
                          entry.name as keyof typeof priorityColors
                        ] || theme.palette.grey[500]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </>
  );
};

export default HiringGoalsDashboard;
