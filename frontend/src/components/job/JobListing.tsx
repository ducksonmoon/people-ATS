import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Pagination,
  InputAdornment,
  Button,
  useMediaQuery,
  Stack,
  Chip,
} from "@mui/material";
import { Search, FilterList } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { Job } from "../../types/job";
import JobCard from "../JobCard";

interface JobListingProps {
  jobs: Job[];
  categories: Array<{ id: number; name: string }>;
  locations: Array<{ id: number; name: string }>;
  loading: boolean;
  error: string | null;
  onSearch: (search: string, category: string, location: string) => void;
  onJobClick: (jobId: number) => void;
  title?: string;
  emptyMessage?: string;
}

const JobListing: React.FC<JobListingProps> = ({
  jobs,
  categories,
  locations,
  loading,
  error,
  onSearch,
  onJobClick,
  title = "Available Positions",
  emptyMessage = "No jobs available at the moment. Please check back later.",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [search, setSearch] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [jobsPerPage] = useState<number>(6);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Calculate pagination
  const indexOfLastJob = page * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  // Handle search and filter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setCategory(e.target.value as string);
  };

  const handleLocationChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setLocation(e.target.value as string);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    // Scroll to top when changing page
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search, category, location);
    setPage(1); // Reset to first page on new search
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    onSearch("", "", "");
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main,
            mb: isMobile ? 2 : 0,
          }}
        >
          {title}
        </Typography>

        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={toggleFilters}
          sx={{ display: { sm: "none" } }}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mb: 4,
          display: isMobile && !showFilters ? "none" : "block",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search Jobs"
              variant="outlined"
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                onChange={handleCategoryChange}
                label="Category"
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="location-label">Location</InputLabel>
              <Select
                labelId="location-label"
                value={location}
                onChange={handleLocationChange}
                label="Location"
              >
                <MenuItem value="">
                  <em>All Locations</em>
                </MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={1}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth={isMobile}
              sx={{ height: "100%", minWidth: isMobile ? "auto" : "120px" }}
            >
              Search
            </Button>
          </Grid>
        </Grid>

        {(search || category || location) && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              Active filters:
            </Typography>
            {search && (
              <Chip
                label={`Search: ${search}`}
                onDelete={() => {
                  setSearch("");
                  onSearch("", category, location);
                }}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {category && (
              <Chip
                label={`Category: ${
                  categories.find((c) => c.id.toString() === category)?.name ||
                  category
                }`}
                onDelete={() => {
                  setCategory("");
                  onSearch(search, "", location);
                }}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {location && (
              <Chip
                label={`Location: ${
                  locations.find((l) => l.id.toString() === location)?.name ||
                  location
                }`}
                onDelete={() => {
                  setLocation("");
                  onSearch(search, category, "");
                }}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            <Button
              variant="text"
              size="small"
              onClick={clearFilters}
              sx={{ ml: 1 }}
            >
              Clear All
            </Button>
          </Stack>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 8 }}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Box sx={{ textAlign: "center", my: 8 }}>
          <Typography variant="h6" color="textSecondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentJobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <JobCard
                  id={job.id}
                  title={job.title}
                  description={job.description}
                  company={job.company || ""}
                  companyLogo={job.companyLogo}
                  location={job.location?.name || "Remote"}
                  category={job.category?.name || "General"}
                  createdAt={job.createdAt}
                  onClick={() => onJobClick(job.id)}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default JobListing;
