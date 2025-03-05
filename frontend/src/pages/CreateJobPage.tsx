import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  MenuItem,
  Grid,
  useTheme,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import RichTextEditor from "../components/RichTextEditor";
import useCompanyTheme from "../hooks/useCompanyTheme";

const CreateJobPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [locations, setLocations] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [departments, setDepartments] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [newCategory, setNewCategory] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const companyTheme = useCompanyTheme();

  const { user } = useSelector((state: RootState) => state.auth);
  const postedById: number = user?.id;

  useEffect(() => {
    const fetchFilters = async () => {
      try {
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
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };

    fetchFilters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !location || !postedById) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      let categoryId = category;
      let locationId = location;
      let departmentId = department || null;

      if (category === "other" && newCategory) {
        const categoryRes = await API.post(
          `${import.meta.env.VITE_API_URL}/jobs/categories`,
          { name: newCategory }
        );
        categoryId = categoryRes.data.id;
      }

      if (location === "other" && newLocation) {
        const locationRes = await API.post(
          `${import.meta.env.VITE_API_URL}/jobs/locations`,
          { name: newLocation }
        );
        locationId = locationRes.data.id;
      }

      if (department === "other" && newDepartment) {
        const departmentRes = await API.post(
          `${import.meta.env.VITE_API_URL}/departments`,
          { name: newDepartment }
        );
        departmentId = departmentRes.data.id;
      }

      await API.post(`${import.meta.env.VITE_API_URL}/jobs/create`, {
        title,
        description,
        categoryId,
        locationId,
        departmentId,
        postedById,
      });

      setSuccess("Job posted successfully! Redirecting to jobs page...");
      setTimeout(() => navigate("/jobs"), 2000);
    } catch (err) {
      setError("Failed to create job. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 5,
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 700,
              textAlign: "center",
              mb: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Post a New Job
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Job Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="outlined"
                  placeholder="e.g., Senior Software Engineer"
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  id="category"
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                >
                  <MenuItem value="">Select a category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">Add New Category</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  id="location"
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                >
                  <MenuItem value="">Select a location</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">Add New Location</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  id="department"
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 1.5 },
                  }}
                >
                  <MenuItem value="">Select a department (optional)</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="other">Add New Department</MenuItem>
                </TextField>
              </Grid>

              {category === "other" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="newCategory"
                    label="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
              )}

              {location === "other" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="newLocation"
                    label="New Location"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
              )}

              {department === "other" && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="newDepartment"
                    label="New Department"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 1.5 },
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <RichTextEditor
                  content={description}
                  onChange={setDescription}
                  placeholder="Describe the job, responsibilities, requirements, and benefits..."
                  maxLength={8000}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 4,
                py: 1.5,
                background:
                  companyTheme.primaryGradient ||
                  "linear-gradient(135deg, #1E3A5F, #3B4D61)",
                color: companyTheme.contrastText || "white",
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: "0 4px 10px rgba(30, 58, 95, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 15px rgba(30, 58, 95, 0.4)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Post Job"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateJobPage;
