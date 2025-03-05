import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TableContainer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { Business as BusinessIcon } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { HistoricalGoal } from "../../types/hiring-goal";
import { HiringGoalStatus } from "../../types/hiring-enums";
import { useTheme } from "@mui/material/styles";

interface HistoricalGoalsSectionProps {
  historicalGoals: HistoricalGoal[];
  yearFilter: string;
  onYearFilterChange: (year: string) => void;
}

const HistoricalGoalsSection: React.FC<HistoricalGoalsSectionProps> = ({
  historicalGoals,
  yearFilter,
  onYearFilterChange,
}) => {
  const theme = useTheme();

  const getAchievementRate = (goals: HistoricalGoal[]): number => {
    if (!goals || goals.length === 0) return 0;
    const achievedGoals = goals.filter((goal) => goal.achieved).length;
    return Math.round((achievedGoals / goals.length) * 100);
  };

  const filteredGoals = historicalGoals.filter(
    (goal) => yearFilter === "all" || goal.year === yearFilter
  );

  const getYearOverYearChartData = () => {
    const years = Array.from(
      new Set(historicalGoals.map((g) => g.year))
    ).sort();
    const departments = Array.from(
      new Set(historicalGoals.map((g) => g.departmentName))
    );

    return years.map((year) => {
      const yearData: any = { year };

      departments.forEach((dept) => {
        const deptGoals = historicalGoals.filter(
          (g) => g.year === year && g.departmentName === dept
        );

        if (deptGoals.length > 0) {
          const targetSum = deptGoals.reduce(
            (sum, g) => sum + g.targetHeadcount,
            0
          );
          const actualSum = deptGoals.reduce(
            (sum, g) => sum + g.actualHeadcount,
            0
          );
          yearData[`${dept}_target`] = targetSum;
          yearData[`${dept}_actual`] = actualSum;
        }
      });

      return yearData;
    });
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" gutterBottom>
              Historical Hiring Goals Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review past hiring goals and their achievement status across
              different time periods.
            </Typography>
          </Box>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={yearFilter}
              onChange={(e) => onYearFilterChange(e.target.value)}
              label="Year"
            >
              <MenuItem value="all">All Years</MenuItem>
              {Array.from(new Set(historicalGoals.map((goal) => goal.year)))
                .sort()
                .reverse()
                .map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Goals
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 500 }}
                  >
                    {filteredGoals.length}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Across all departments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Achievement Rate
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 500 }}
                  >
                    {getAchievementRate(filteredGoals)}%
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Goals achieved on target
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Departments On Target
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 500 }}
                  >
                    {filteredGoals.filter((g) => g.achieved).length}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Departments that met goals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: "100%",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Average Completion
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 500 }}
                  >
                    {(() => {
                      if (filteredGoals.length === 0) return "0%";

                      const avgCompletion =
                        filteredGoals.reduce((acc, goal) => {
                          return (
                            acc +
                            (goal.actualHeadcount / goal.targetHeadcount) * 100
                          );
                        }, 0) / filteredGoals.length;

                      return `${Math.round(avgCompletion)}%`;
                    })()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Average goal completion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Year</TableCell>
                <TableCell align="right">Target</TableCell>
                <TableCell align="right">Actual</TableCell>
                <TableCell align="right">Time Period</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow
                  key={goal.id}
                  sx={{
                    backgroundColor: goal.achieved
                      ? "rgba(76, 175, 80, 0.05)"
                      : goal.status === HiringGoalStatus.IN_PROGRESS
                      ? "rgba(255, 152, 0, 0.05)"
                      : "rgba(244, 67, 54, 0.05)",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <BusinessIcon
                        sx={{
                          mr: 1,
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Typography variant="body1">
                        {goal.departmentName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{goal.year}</TableCell>
                  <TableCell align="right">{goal.targetHeadcount}</TableCell>
                  <TableCell align="right">{goal.actualHeadcount}</TableCell>
                  <TableCell align="right">
                    {`${goal.startDate.toLocaleDateString()} - ${goal.endDate.toLocaleDateString()}`}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={
                        goal.achieved
                          ? "Achieved"
                          : goal.status || "Not Achieved"
                      }
                      color={
                        goal.achieved
                          ? "success"
                          : goal.status === HiringGoalStatus.IN_PROGRESS
                          ? "warning"
                          : "error"
                      }
                      size="small"
                      sx={{ minWidth: 90 }}
                    />
                  </TableCell>
                  <TableCell>{goal.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {historicalGoals.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No historical goals data available.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mt: 4, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Year-over-Year Hiring Goal Achievement
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getYearOverYearChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                {Array.from(
                  new Set(historicalGoals.map((g) => g.departmentName))
                ).map((dept, index) => {
                  const colors = [
                    ["#8884d8", "#a794f0"],
                    ["#82ca9d", "#4caf50"],
                    ["#8dd1e1", "#2196f3"],
                    ["#ffc658", "#ff9800"],
                    ["#d88484", "#f44336"],
                    ["#a4de6c", "#8bc34a"],
                    ["#83a6ed", "#3f51b5"],
                    ["#e57373", "#e91e63"],
                    ["#ffb74d", "#ff5722"],
                    ["#4db6ac", "#009688"],
                  ];

                  const colorPair = colors[index % colors.length];

                  return (
                    <React.Fragment key={dept}>
                      <Bar
                        dataKey={`${dept}_target`}
                        name={`${dept} Target`}
                        fill={colorPair[0]}
                      />
                      <Bar
                        dataKey={`${dept}_actual`}
                        name={`${dept} Actual`}
                        fill={colorPair[1]}
                      />
                    </React.Fragment>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    </>
  );
};

export default HistoricalGoalsSection;
