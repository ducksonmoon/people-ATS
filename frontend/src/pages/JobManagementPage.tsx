import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import API from "../services/api";
import RichTextEditor from "../components/RichTextEditor";
import { hrService } from "../services/hr.service";
import useCompanyTheme from "../hooks/useCompanyTheme";

// Interface for Job data
interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  openPositions: number;
  createdAt: string;
  updatedAt: string;
  filledDate?: string;
  postedBy: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  location?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

// Interfaces for other data types
interface Category {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

const JobManagementPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] =
    useState<boolean>(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Form states for editing job
  const [editJobForm, setEditJobForm] = useState<{
    title: string;
    description: string;
    status: string;
    priority: string;
    openPositions: number;
    categoryId: number | null;
    locationId: number | null;
    departmentId: number | null;
  }>({
    title: "",
    description: "",
    status: "OPEN",
    priority: "MEDIUM",
    openPositions: 1,
    categoryId: null,
    locationId: null,
    departmentId: null,
  });

  // Form state for adding/editing categories, locations, departments
  const [entityForm, setEntityForm] = useState<{
    name: string;
    description?: string;
  }>({
    name: "",
    description: "",
  });
  const companyTheme = useCompanyTheme();

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch data based on current tab
      if (tabValue === 0) {
        // Fetch jobs
        const jobsResponse = await API.get(
          `${import.meta.env.VITE_API_URL}/jobs`
        );
        setJobs(jobsResponse.data.data);

        // Also fetch related entities for job editing
        const [categoriesRes, locationsRes, departmentsRes] = await Promise.all(
          [
            API.get(`${import.meta.env.VITE_API_URL}/jobs/categories`),
            API.get(`${import.meta.env.VITE_API_URL}/jobs/locations`),
            API.get(`${import.meta.env.VITE_API_URL}/departments`),
          ]
        );

        setCategories(categoriesRes.data);
        setLocations(locationsRes.data);
        setDepartments(departmentsRes.data);
      } else if (tabValue === 1) {
        // Fetch categories
        const categoriesRes = await API.get(
          `${import.meta.env.VITE_API_URL}/jobs/categories`
        );
        setCategories(categoriesRes.data);
      } else if (tabValue === 2) {
        // Fetch locations
        const locationsRes = await API.get(
          `${import.meta.env.VITE_API_URL}/jobs/locations`
        );
        setLocations(locationsRes.data);
      } else if (tabValue === 3) {
        // Fetch departments from our new endpoint
        const departmentsRes = await API.get(
          `${import.meta.env.VITE_API_URL}/departments`
        );
        setDepartments(departmentsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleEditJob = (job: Job) => {
    setCurrentItem(job);
    setEditJobForm({
      title: job.title,
      description: job.description,
      status: job.status,
      priority: job.priority,
      openPositions: job.openPositions,
      categoryId: job.category ? job.category.id : null,
      locationId: job.location ? job.location.id : null,
      departmentId: job.department ? job.department.id : null,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditEntity = (entity: any) => {
    setCurrentItem(entity);
    setEntityForm({
      name: entity.name,
      description: entity.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleAddEntity = () => {
    setCurrentItem(null);
    setEntityForm({ name: "", description: "" });
    setIsAddDialogOpen(true);
  };

  const handleDeleteConfirmation = (item: any) => {
    setCurrentItem(item);
    setIsConfirmDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!currentItem) return;

    try {
      if (tabValue === 0) {
        // Delete job
        await hrService.deleteJobRequisition(currentItem.id);
        showSnackbar("Job deleted successfully", "success");
        fetchData();
        setIsConfirmDialogOpen(false);
        return;
      } else if (tabValue === 1) {
        // Categories
        // For now, we don't have a delete category endpoint
        showSnackbar("Category deletion not implemented yet", "error");
      } else if (tabValue === 2) {
        // Locations
        // For now, we don't have a delete location endpoint
        showSnackbar("Location deletion not implemented yet", "error");
      } else if (tabValue === 3) {
        // Departments - now we have a delete endpoint
        const endpoint = `${import.meta.env.VITE_API_URL}/departments/${
          currentItem.id
        }`;
        await API.delete(endpoint);
        showSnackbar("Department deleted successfully", "success");
        fetchData();
        setIsConfirmDialogOpen(false);
        return;
      }

      setIsConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      showSnackbar("Failed to delete item", "error");
      setIsConfirmDialogOpen(false);
    }
  };

  const handleJobFormChange = (field: string, value: any) => {
    setEditJobForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEntityFormChange = (field: string, value: string) => {
    setEntityForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveJobChanges = async () => {
    try {
      if (!editJobForm.title.trim() || !editJobForm.description.trim()) {
        showSnackbar("Title and description are required", "error");
        return;
      }

      // Prepare data for API
      const jobData = {
        title: editJobForm.title,
        description: editJobForm.description,
        status: editJobForm.status,
        priority: editJobForm.priority,
        openPositions: editJobForm.openPositions,
        categoryId: editJobForm.categoryId,
        locationId: editJobForm.locationId,
        departmentId: editJobForm.departmentId,
      };

      if (currentItem) {
        // Update existing job
        await hrService.updateJobRequisition(currentItem.id, jobData);
        showSnackbar("Job updated successfully", "success");
      } else {
        // Create new job (future functionality)
        showSnackbar("Creating new jobs is not implemented here", "info");
      }

      setIsEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating job:", error);
      showSnackbar("Failed to update job", "error");
    }
  };

  const saveEntityChanges = async () => {
    try {
      if (!entityForm.name.trim()) {
        showSnackbar("Name is required", "error");
        return;
      }

      let endpoint = "";

      // Create a base data object with just the name
      const baseData = { name: entityForm.name };

      if (tabValue === 1) {
        // Categories - only needs name
        endpoint = `${import.meta.env.VITE_API_URL}/jobs/categories`;
      } else if (tabValue === 2) {
        // Locations - only needs name
        endpoint = `${import.meta.env.VITE_API_URL}/jobs/locations`;
      } else if (tabValue === 3) {
        // Departments - can have name and description
        endpoint = `${import.meta.env.VITE_API_URL}/departments`;
      }

      if (currentItem) {
        // Update existing entity
        if (tabValue === 3) {
          // Departments can now be updated
          const deptData = {
            name: entityForm.name,
            ...(entityForm.description
              ? { description: entityForm.description }
              : {}),
          };
          await API.put(`${endpoint}/${currentItem.id}`, deptData);
          showSnackbar(`${getEntityName()} updated successfully`, "success");
        } else {
          // Categories and locations don't have update endpoints yet
          showSnackbar(
            "Update not implemented yet for this entity type",
            "info"
          );
        }
      } else {
        // Send the appropriate data based on the entity type
        if (tabValue === 3 && entityForm.description) {
          // For departments with description
          const deptData = {
            name: entityForm.name,
            description: entityForm.description,
          };
          await API.post(endpoint, deptData);
        } else {
          // For categories and locations (name only)
          await API.post(endpoint, baseData);
        }
        showSnackbar(`${getEntityName()} added successfully`, "success");
      }

      setIsEditDialogOpen(false);
      setIsAddDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving entity:", error);
      showSnackbar("Failed to save changes", "error");
    }
  };

  const getEntityName = () => {
    switch (tabValue) {
      case 1:
        return "Category";
      case 2:
        return "Location";
      case 3:
        return "Department";
      default:
        return "Item";
    }
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getFilteredData = () => {
    if (tabValue === 0 && jobs.length) {
      return jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.category?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (job.location?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    } else if (tabValue === 1 && categories.length) {
      return categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (tabValue === 2 && locations.length) {
      return locations.filter((loc) =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (tabValue === 3 && departments.length) {
      return departments.filter((dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return theme.palette.error.main;
      case "MEDIUM":
        return theme.palette.warning.main;
      case "LOW":
        return theme.palette.info.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return theme.palette.success.main;
      case "CLOSED":
        return theme.palette.error.main;
      case "FILLED":
        return theme.palette.primary.main;
      default:
        return theme.palette.info.main;
    }
  };

  const renderJobsTable = () => {
    const filteredJobs = getFilteredData() as Job[];

    return (
      <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Open Positions</TableCell>
              <TableCell>Posted By</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColor(job.status)}20`,
                        color: getStatusColor(job.status),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={job.priority}
                      size="small"
                      sx={{
                        bgcolor: `${getPriorityColor(job.priority)}20`,
                        color: getPriorityColor(job.priority),
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>{job.category?.name || "-"}</TableCell>
                  <TableCell>{job.location?.name || "-"}</TableCell>
                  <TableCell>{job.department?.name || "-"}</TableCell>
                  <TableCell>{job.openPositions}</TableCell>
                  <TableCell>{job.postedBy?.name || "-"}</TableCell>
                  <TableCell>
                    {new Date(job.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Job">
                      <IconButton
                        size="small"
                        onClick={() => handleEditJob(job)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Job">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteConfirmation(job)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No jobs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderEntitiesTable = () => {
    let data: any[] = [];
    let columns: { id: string; label: string }[] = [
      { id: "name", label: "Name" },
    ];

    if (tabValue === 1) {
      data = getFilteredData() as Category[];
      columns = [{ id: "name", label: "Category Name" }];
    } else if (tabValue === 2) {
      data = getFilteredData() as Location[];
      columns = [{ id: "name", label: "Location Name" }];
    } else if (tabValue === 3) {
      data = getFilteredData() as Department[];
      columns = [
        { id: "name", label: "Department Name" },
        { id: "description", label: "Description" },
      ];
    }

    return (
      <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>{column.label}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  {tabValue === 3 && (
                    <TableCell>{item.description || "-"}</TableCell>
                  )}
                  <TableCell align="right">
                    <Tooltip title={`Edit ${getEntityName()}`}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditEntity(item)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Delete ${getEntityName()}`}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteConfirmation(item)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  No {getEntityName().toLowerCase()}s found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box
      sx={{
        py: 4,
        minHeight: "calc(100vh - 64px)",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Job Management
        </Typography>

        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Jobs" />
            <Tab label="Categories" />
            <Tab label="Locations" />
            <Tab label="Departments" />
          </Tabs>
        </Paper>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Search field */}
          <TextField
            size="small"
            placeholder={`Search ${
              tabValue === 0 ? "jobs" : getEntityName().toLowerCase() + "s"
            }...`}
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          {/* Add button (only for categories, locations, departments) */}
          {tabValue > 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEntity}
              sx={{
                background:
                  companyTheme.primaryGradient ||
                  "linear-gradient(135deg, #1E3A5F, #3B4D61)",
                color: companyTheme.contrastText || "white",
                fontWeight: "bold",
                borderRadius: 2,
                py: 1,
                px: 2,
                boxShadow: "0 4px 10px rgba(30, 58, 95, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 15px rgba(30, 58, 95, 0.4)",
                },
              }}
            >
              Add {getEntityName()}
            </Button>
          )}
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>{tabValue === 0 ? renderJobsTable() : renderEntitiesTable()}</>
        )}

        {/* Job Edit Dialog */}
        <Dialog
          open={isEditDialogOpen && tabValue === 0}
          onClose={() => setIsEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Job</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Job Title"
                  fullWidth
                  value={editJobForm.title}
                  onChange={(e) => handleJobFormChange("title", e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={editJobForm.status}
                  onChange={(e) =>
                    handleJobFormChange("status", e.target.value)
                  }
                >
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                  <MenuItem value="FILLED">Filled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Priority"
                  fullWidth
                  value={editJobForm.priority}
                  onChange={(e) =>
                    handleJobFormChange("priority", e.target.value)
                  }
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Category"
                  fullWidth
                  value={editJobForm.categoryId || ""}
                  onChange={(e) =>
                    handleJobFormChange("categoryId", e.target.value)
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Location"
                  fullWidth
                  value={editJobForm.locationId || ""}
                  onChange={(e) =>
                    handleJobFormChange("locationId", e.target.value)
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Department"
                  fullWidth
                  value={editJobForm.departmentId || ""}
                  onChange={(e) =>
                    handleJobFormChange("departmentId", e.target.value)
                  }
                >
                  <MenuItem value="">None</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Open Positions"
                  type="number"
                  fullWidth
                  value={editJobForm.openPositions}
                  onChange={(e) =>
                    handleJobFormChange(
                      "openPositions",
                      parseInt(e.target.value, 10)
                    )
                  }
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Job Description
                </Typography>
                <RichTextEditor
                  content={editJobForm.description}
                  onChange={(value) =>
                    handleJobFormChange("description", value)
                  }
                  placeholder="Describe the job, responsibilities, requirements, and benefits..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={saveJobChanges}
              variant="contained"
              color="primary"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Entity Edit Dialog */}
        <Dialog
          open={(isEditDialogOpen || isAddDialogOpen) && tabValue > 0}
          onClose={() => {
            setIsEditDialogOpen(false);
            setIsAddDialogOpen(false);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {isEditDialogOpen
              ? `Edit ${getEntityName()}`
              : `