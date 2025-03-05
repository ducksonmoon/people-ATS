import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  useTheme,
  Grid,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { TimeToHireMetric } from "../../types";

interface TimeToHireMetricsProps {
  data: TimeToHireMetric;
}

/**
 * Component that displays time to hire metrics
 * Shows average time to hire, fastest hire, and slowest hire
 */
const TimeToHireMetrics: React.FC<TimeToHireMetricsProps> = ({ data }) => {
  const theme = useTheme();

  // This component now uses a single TimeToHireMetric object
  // with avgDaysToHire, fastestHire, and slowestHire properties

  // Helper function to determine color based on days
  const getColorByDays = (days: number): string => {
    if (days <= 30) return theme.palette.success.main;
    if (days <= 45) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Card elevation={0} sx={{ height: "100%" }}>
      <CardHeader
        title="Time to Hire Metrics"
        titleTypographyProps={{ variant: "h6" }}
        sx={{ pb: 0 }}
      />
      <CardContent>
        {!data ? (
          <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
            No time to hire data available
          </Typography>
        ) : (
          <>
            <Grid container spacing={4} sx={{ mt: 2, mb: 2 }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: theme.palette.success.main }}
                  >
                    {data.fastestHire} days
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Fastest Hiring
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: getColorByDays(data.avgDaysToHire),
                    }}
                  >
                    {data.avgDaysToHire} days
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Average Time to Hire
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 600, color: theme.palette.error.main }}
                  >
                    {data.slowestHire} days
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Slowest Hiring
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Hiring Speed Indicator
              </Typography>

              <Box sx={{ mb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Average Time to Hire
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: getColorByDays(data.avgDaysToHire),
                    }}
                  >
                    {data.avgDaysToHire} days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((data.avgDaysToHire / 60) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    backgroundColor:
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.05)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getColorByDays(data.avgDaysToHire),
                    },
                  }}
                />
              </Box>

              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.success.main,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Under 30 days</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.warning.main,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">30-45 days</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.error.main,
                      mr: 1,
                    }}
                  />
                  <Typography variant="caption">Over 45 days</Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeToHireMetrics;
