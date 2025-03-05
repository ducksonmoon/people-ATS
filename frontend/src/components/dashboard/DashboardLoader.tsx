import React from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Grid,
  Skeleton,
  useTheme,
} from "@mui/material";

/**
 * A loader component that displays skeleton placeholders when dashboard data is being fetched
 */
const DashboardLoader: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        py: 4,
      }}
    >
      <Grid container spacing={4}>
        {/* Header skeleton */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Skeleton variant="text" width={200} height={40} />
            <Skeleton variant="rounded" width={180} height={40} />
          </Box>
        </Grid>

        {/* Hiring Trends skeleton */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="rounded" width={150} height={32} />
            </Box>
            <Skeleton variant="rectangular" height={300} />
          </Paper>
        </Grid>

        {/* Recruitment funnel and Department hiring skeletons */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              height: "100%",
            }}
          >
            <Skeleton variant="text" width={150} height={32} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
            <Skeleton variant="text" width={120} height={20} />
            <Box sx={{ mt: 2 }}>
              {[1, 2, 3].map((i) => (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                  key={i}
                >
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="rounded" width={60} height={24} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              height: "100%",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Skeleton variant="text" width={180} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
            </Box>
            <Skeleton variant="rectangular" height={220} />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Skeleton variant="rounded" width={180} height={32} />
            </Box>
          </Paper>
        </Grid>

        {/* Active Candidates skeleton */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="rounded" width={200} height={40} />
            </Box>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Skeleton variant="text" width={150} />
                    <Skeleton variant="rounded" width={90} height={24} />
                  </Box>
                  <Skeleton variant="text" width="100%" />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Job Requisitions skeleton */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <Skeleton variant="text" width={180} height={32} />
              <Skeleton variant="rounded" width={180} height={40} />
            </Box>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  py: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    <Skeleton variant="text" width={200} />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Skeleton variant="rounded" width={60} height={24} />
                      <Skeleton variant="rounded" width={40} height={24} />
                      <Skeleton variant="rounded" width={40} height={24} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="80%" />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Loading indicator at the bottom */}
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <LinearProgress
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 2,
            maxWidth: 500,
            mx: "auto",
          }}
        />
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch the latest HR analytics...
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardLoader;
