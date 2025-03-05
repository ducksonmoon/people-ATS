import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import API from "../services/api";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Job } from "../types/job";
import { useCompanyTheme } from "../hooks/useCompanyTheme";

// Import components
import JobHeader from "../components/job/JobHeader";
import ApplicationSidebar from "../components/job/ApplicationSidebar";
import ApplicationDialog from "../components/job/ApplicationDialog";

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const companyTheme = useCompanyTheme();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { settings } = useSelector((state: RootState) => state.companySettings);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/jobs/${id}`);
        setJob(response.data);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const handleApplyClick = () => {
    setApplyDialogOpen(true);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
      >
        <CircularProgress size={60} color="primary" />
      </Box>
    );
  }

  if (error || !job) {
    return (
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Alert severity="error">{error || "Job not found"}</Alert>
        <Link
          component="button"
          onClick={() => navigate("/jobs")}
          sx={{ display: "block", mt: 2 }}
        >
          Back to Jobs
        </Link>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 0 },
        minHeight: "calc(100vh - 64px)",
        background:
          companyTheme.primaryBackground ||
          alpha(theme.palette.primary.light, 0.05),
      }}
    >
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link
            color="inherit"
            component="button"
            onClick={() => navigate("/")}
            underline="hover"
          >
            Home
          </Link>
          <Link
            color="inherit"
            component="button"
            onClick={() => navigate("/jobs")}
            underline="hover"
          >
            Jobs
          </Link>
          <Typography color="text.primary">{job.title}</Typography>
        </Breadcrumbs>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            mb: 4,
          }}
        >
          {/* Job Header */}
          <JobHeader
            title={job.title}
            company={job.company?.name || job.postedBy.name}
            location={job.location}
            category={job.category}
            createdAt={job.createdAt}
            onApplyClick={handleApplyClick}
          />

          <Divider sx={{ my: 4 }} />

          <Grid container spacing={5}>
            {/* Job Description */}
            <Grid item xs={12} md={8}>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: companyTheme.primary || theme.palette.primary.main,
                }}
              >
                Job Description
              </Typography>

              <Box
                sx={{
                  "& h2": {
                    fontSize: "1.3rem",
                    fontWeight: 600,
                    mt: 4,
                    mb: 2,
                    color: companyTheme.primary || theme.palette.primary.main,
                  },
                  "& p": {
                    mb: 2,
                    lineHeight: 1.8,
                    color: theme.palette.text.primary,
                  },
                  "& ul, & ol": {
                    pl: 3,
                    mb: 2,
                    lineHeight: 1.7,
                  },
                  "& li": {
                    mb: 1,
                  },
                }}
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </Grid>

            {/* Application Info Sidebar */}
            <Grid item xs={12} md={4}>
              <ApplicationSidebar
                companyName={
                  settings?.companyName ||
                  job.company?.name ||
                  job.postedBy.name
                }
                onApplyClick={handleApplyClick}
                isLoggedIn={!!user}
              />
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Application Dialog */}
      <ApplicationDialog
        open={applyDialogOpen}
        onClose={() => setApplyDialogOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company?.name || job.postedBy.name}
        userId={user?.id}
      />
    </Box>
  );
};

export default JobDetailPage;
