import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Divider,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  FilterList as FilterListIcon,
  BusinessCenter as JobIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { recruiterService } from "../services/recruiter.service";
import { useSnackbar } from "notistack";
import { Application, ApplicationStatus } from "../types/application";

const ExternalApplicationsPage = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // State for the application form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    jobId: "",
    source: "",
    status: "PENDING" as ApplicationStatus,
    note: "",
    coverLetter: "",
  });

  // State for the file upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResumePath, setUploadedResumePath] = useState<string | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);

  // State for tab management
  const [tabValue, setTabValue] = useState(0);

  // State for jobs and sources dropdown data
  const [jobs, setJobs] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [externalApplications, setExternalApplications] = useState<
    Application[]
  >([]);

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    jobId: false,
    source: false,
  });

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load jobs and sources when the component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch available jobs
        const jobsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/jobs`
        );
        const jobsData = await jobsResponse.json();
        setJobs(jobsData);

        // Fetch external sources
        const sourcesData = await recruiterService.getExternalSources();
        setSources(sourcesData);

        // Fetch existing external applications
        const applicationsResponse =
          await recruiterService.getRecruiterApplications();
        setExternalApplications(applicationsResponse);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        enqueueSnackbar("Failed to load initial data", { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [enqueueSnackbar]);

  // Handle form input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when field is edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: false,
      });
    }
  };

  // Handle select input changes
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when field is edited
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: false,
      });
    }
  };

  // Handle resume file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Upload the resume file
  const handleUploadResume = async () => {
    if (!resumeFile) {
      enqueueSnackbar("Please select a file first", { variant: "warning" });
      return;
    }

    setIsUploading(true);
    try {
      const response = await recruiterService.uploadExternalResume(resumeFile);
      setUploadedResumePath(response.file.path);
      enqueueSnackbar("Resume uploaded successfully", { variant: "success" });
    } catch (error) {
      console.error("Error uploading resume:", error);
      enqueueSnackbar("Failed to upload resume", { variant: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {
      name: !formData.name,
      email:
        !formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      jobId: !formData.jobId,
      source: !formData.source,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      enqueueSnackbar("Please correct the errors in the form", {
        variant: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const candidateData = {
        ...formData,
        jobId: parseInt(formData.jobId),
        resumePath: uploadedResumePath || undefined,
      };

      const response = await recruiterService.addExternalCandidate(
        candidateData
      );

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        phone: "",
        jobId: "",
        source: "",
        status: "PENDING" as ApplicationStatus,
        note: "",
        coverLetter: "",
      });
      setResumeFile(null);
      setUploadedResumePath(null);

      // Refresh the applications list
      const updatedApplications =
        await recruiterService.getRecruiterApplications();
      setExternalApplications(updatedApplications);

      enqueueSnackbar("External candidate added successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding external candidate:", error);
      enqueueSnackbar("Failed to add external candidate", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get status chip color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "default";
      case "INTERVIEWING":
        return "primary";
      case "OFFER_SENT":
        return "secondary";
      case "HIRED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  // Handle view application details
  const handleViewApplication = (application: Application) => {
    navigate(`/applications/${application.id}`);
  };

  // Handle text search
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle source filter change
  const handleSourceFilterChange = (e: SelectChangeEvent) => {
    setSourceFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: SelectChangeEvent) => {
    setStatusFilter(e.target.value);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSourceFilter("all");
    setStatusFilter("all");
  };

  // Filter applications based on search and filters
  const filteredApplications = externalApplications
    .filter((app) => {
      if (statusFilter === "all") return true;
      return app.status === statusFilter;
    })
    .filter((app) => {
      if (sourceFilter === "all") return true;
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          External Application Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Add and manage candidates from external recruiting pipelines
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="external applications tabs"
            sx={{ mb: 2 }}
          >
            <Tab label="Add External Candidate" />
            <Tab label="Manage External Applications" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Candidate Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      error={formErrors.name}
                      helperText={formErrors.name ? "Name is required" : ""}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      error={formErrors.email}
                      helperText={
                        formErrors.email ? "Valid email is required" : ""
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={formErrors.source}>
                      <InputLabel id="source-label">Source</InputLabel>
                      <Select
                        labelId="source-label"
                        id="source"
                        name="source"
                        value={formData.source}
                        label="Source"
                        onChange={handleSelectChange}
                      >
                        {sources.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.source && (
                        <Typography variant="caption" color="error">
                          Source is required
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required error={formErrors.jobId}>
                      <InputLabel id="job-label">Job Position</InputLabel>
                      <Select
                        labelId="job-label"
                        id="jobId"
                        name="jobId"
                        value={formData.jobId}
                        label="Job Position"
                        onChange={handleSelectChange}
                      >
                        {jobs.map((job) => (
                          <MenuItem key={job.id} value={job.id.toString()}>
                            {job.title}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.jobId && (
                        <Typography variant="caption" color="error">
                          Job position is required
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        labelId="status-label"
                        id="status"
                        name="status"
                        value={formData.status}
                        label="Status"
                        onChange={handleSelectChange}
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="INTERVIEWING">Interviewing</MenuItem>
                        <MenuItem value="OFFER_SENT">Offer Sent</MenuItem>
                        <MenuItem value="HIRED">Hired</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="note"
                      name="note"
                      label="Notes"
                      multiline
                      rows={3}
                      value={formData.note}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="coverLetter"
                      name="coverLetter"
                      label="Cover Letter"
                      multiline
                      rows={4}
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                      >
                        Select Resume
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          hidden
                          onChange={handleFileChange}
                        />
                      </Button>
                      <Typography variant="body2" color="text.secondary">
                        {resumeFile ? resumeFile.name : "No file selected"}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleUploadResume}
                        disabled={!resumeFile || isUploading}
                        startIcon={
                          isUploading ? (
                            <CircularProgress size={20} />
                          ) : undefined
                        }
                      >
                        {isUploading ? "Uploading..." : "Upload Resume"}
                      </Button>
                    </Stack>
                    {uploadedResumePath && (
                      <Alert severity="success" sx={{ mt: 2 }}>
                        Resume uploaded successfully
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddIcon />}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} /> Adding...
                  </>
                ) : (
                  "Add External Candidate"
                )}
              </Button>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
            >
              <TextField
                size="small"
                placeholder="Search applications..."
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ width: 300 }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 150 }}
                >
                  <InputLabel id="source-filter-label">Source</InputLabel>
                  <Select
                    labelId="source-filter-label"
                    id="source-filter"
                    value={sourceFilter}
                    onChange={handleSourceFilterChange}
                    label="Source"
                  >
                    <MenuItem value="all">All Sources</MenuItem>
                    {sources.map((source) => (
                      <MenuItem key={source.id} value={source.id}>
                        {source.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 150 }}
                >
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="INTERVIEWING">Interviewing</MenuItem>
                    <MenuItem value="OFFER_SENT">Offer Sent</MenuItem>
                    <MenuItem value="HIRED">Hired</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Box>
            </Box>

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : externalApplications.length === 0 ? (
              <Alert severity="info">
                No external applications found. Add candidates using the form.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.action.hover }}>
                    <TableRow>
                      <TableCell>Candidate</TableCell>
                      <TableCell>Job Position</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Added On</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow
                        key={application.id}
                        hover
                        sx={{ "&:hover": { cursor: "pointer" } }}
                        onClick={() => handleViewApplication(application)}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 32,
                                height: 32,
                                mr: 1.5,
                              }}
                            >
                              <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {application.candidate.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {application.candidate.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.info.main,
                                width: 24,
                                height: 24,
                                mr: 1,
                              }}
                            >
                              <JobIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2">
                              {application.job.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {application.source || "Not specified"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={application.status}
                            size="small"
                            color={getStatusColor(application.status) as any}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(application.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit application">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/applications/edit/${application.id}`
                                );
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ExternalApplicationsPage;
