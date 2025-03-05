import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Fade,
  Box,
  Paper,
  Typography,
  Divider,
  Breadcrumbs,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import useJobs from "../hooks/useJobs";
import JobsHero from "../components/job/JobsHero";
import JobFilters from "../components/job/JobFilters";
import JobsGrid from "../components/job/JobsGrid";
import { NavigateNext, Home } from "@mui/icons-material";
import useCompanyTheme from "../hooks/useCompanyTheme";

/**
 * Enhanced JobsPage - Displays all available job positions with modern UI/UX
 *
 * This component is responsible for:
 * 1. Providing an engaging search interface with direct search from hero section
 * 2. Offering advanced filtering capabilities
 * 3. Displaying jobs in both grid and list views with sorting options
 * 4. Providing smooth navigation and transitions
 */
const JobsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const companyTheme = useCompanyTheme();
  const [initialLoad, setInitialLoad] = useState(true);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Use our custom hook to manage jobs state and data fetching
  const {
    jobs,
    categories,
    locations,
    loading,
    error,
    meta,
    filters,
    updateFilters,
    clearFilters,
    refetch,
  } = useJobs();

  // Parse URL query parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters: Record<string, string> = {};
    let hasFilters = false;

    if (params.has("search")) {
      urlFilters.search = params.get("search") || "";
      hasFilters = true;
    }

    if (params.has("category")) {
      urlFilters.category = params.get("category") || "";
      hasFilters = true;
    }

    if (params.has("location")) {
      urlFilters.location = params.get("location") || "";
      hasFilters = true;
    }

    if (params.has("page")) {
      urlFilters.page = params.get("page") || "1";
      hasFilters = true;
    }

    // Only update filters if we have parameters in the URL
    if (hasFilters) {
      console.log("Initializing filters from URL parameters:", urlFilters);
      updateFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update URL when filters change
  useEffect(() => {
    // Skip during initial load
    if (initialLoad) return;

    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.location) params.set("location", filters.location);
    if (filters.page > 1) params.set("page", filters.page.toString());

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : "";

    // Replace state to avoid cluttering the browser history with filter changes
    navigate(`/jobs${newUrl}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, initialLoad]);

  // Set initial load state to false after first load
  useEffect(() => {
    if (!loading && initialLoad) {
      setInitialLoad(false);
    }
  }, [loading, initialLoad]);

  /**
   * Navigate to job details page
   */
  const handleJobClick = useCallback(
    (jobId: number) => {
      navigate(`/jobs/${jobId}`);
    },
    [navigate]
  );

  /**
   * Show notification message
   */
  const showNotification = useCallback(
    (
      message: string,
      severity: "success" | "error" | "info" | "warning" = "info"
    ) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  /**
   * Close notification
   */
  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  /**
   * Handle filter changes with improved validation and logging
   */
  const handleFilterChange = useCallback(
    (type: "search" | "category" | "location", value: string) => {
      console.log(`Changing filter: ${type} = "${value}" (${typeof value})`);

      // Handle empty values
      if (value === null || value === undefined) {
        value = "";
      }

      // Special handling for search - trim and validate
      if (type === "search") {
        value = String(value).trim();
      }

      // Validate numeric values for category and location
      if ((type === "category" || type === "location") && value) {
        // Check if it's a valid numeric ID
        if (!/^\d+$/.test(value)) {
          console.warn(`Invalid ${type} ID: ${value} - should be numeric`);
          showNotification(`Invalid ${type} ID format`, "warning");
          return;
        }
      }

      updateFilters({ [type]: value });
    },
    [updateFilters, showNotification]
  );

  /**
   * Handle page change in pagination
   */
  const handlePageChange = useCallback(
    (page: number) => {
      console.log("Changing to page:", page);
      updateFilters({ page });

      // Scroll to job listings with smooth animation
      const filterElement = document.getElementById("job-filters");
      if (filterElement) {
        filterElement.scrollIntoView({ behavior: "smooth" });
      }
    },
    [updateFilters]
  );

  /**
   * Handle filter submission - explicitly trigger refetch
   */
  const handleFilterSubmit = useCallback(() => {
    console.log("Submitting filters:", filters);
    refetch();
  }, [filters, refetch]);

  /**
   * Parse category format strings into category ID
   */
  const parseCategoryFormat = useCallback((searchValue: string) => {
    // If format is "category:123", extract ID
    const categoryMatch = searchValue.match(/^category:(\d+)$/);
    if (categoryMatch && categoryMatch[1]) {
      const categoryId = categoryMatch[1];
      console.log(`Extracted category ID: ${categoryId} from "${searchValue}"`);
      return categoryId;
    }
    return null;
  }, []);

  /**
   * Handle direct search from hero section
   */
  const handleHeroSearch = useCallback(
    (searchValue: string) => {
      console.log("Hero search initiated with term:", searchValue);

      // Safety check for null/undefined values
      if (!searchValue) {
        return;
      }

      // Check if the search is a category search (format: "category:123")
      const categoryId = parseCategoryFormat(searchValue);

      if (categoryId) {
        console.log(`Processing as category search with ID: ${categoryId}`);

        // Clear other filters and set this category
        updateFilters({
          search: "",
          category: categoryId,
          location: "",
          page: 1,
        });

        // Find category by ID to show in notification
        const categoryName = categories.find(
          (c) => c.id.toString() === categoryId
        )?.name;

        if (categoryName) {
          showNotification(`Showing jobs in category: ${categoryName}`, "info");
        }
      }
      // Regular text search
      else {
        // Clear other filters when searching from hero to provide a fresh start
        updateFilters({
          search: searchValue,
          category: "",
          location: "",
          page: 1,
        });

        showNotification(`Searching for: ${searchValue}`, "info");
      }

      // Explicitly trigger a refetch
      refetch();

      // Scroll to job listings
      const filterElement = document.getElementById("job-filters");
      if (filterElement) {
        setTimeout(() => {
          filterElement.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    },
    [categories, parseCategoryFormat, refetch, showNotification, updateFilters]
  );

  // Check if any filters are active
  const hasActiveFilters = !!(
    filters.search ||
    filters.category ||
    filters.location
  );

  // Select the top categories for quick filtering
  const popularCategories = categories.slice(0, 6);

  return (
    <Fade in={true}>
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Hero Section with Search */}
        <JobsHero
          title="Discover Your Perfect Career Path"
          subtitle="Thousands of opportunities awaiting your talent and expertise"
          onSearch={handleHeroSearch}
          popularCategories={popularCategories}
          isLoading={loading && initialLoad}
          popularSearches={[
            "Software Engineer",
            "Marketing",
            "Data Analyst",
            "Project Manager",
          ]}
        />

        {/* Breadcrumbs */}
        <Container maxWidth="lg" sx={{ mt: { xs: -2, md: 0 }, mb: 3 }}>
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ opacity: 0.7 }}
          >
            <Link
              color="inherit"
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              Home
            </Link>
            <Typography color="text.primary">Jobs</Typography>
          </Breadcrumbs>
        </Container>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mb: 8, flexGrow: 1 }}>
          {/* Job Search and Filters Section */}
          <div id="job-filters">
            <JobFilters
              search={filters.search}
              category={filters.category}
              location={filters.location}
              categories={categories}
              locations={locations}
              onFilterChange={handleFilterChange}
              onSubmit={handleFilterSubmit}
              onClear={clearFilters}
            />
          </div>

          {/* Jobs Grid */}
          <JobsGrid
            jobs={jobs}
            loading={loading}
            error={error}
            onJobClick={handleJobClick}
            totalPages={meta?.totalPages}
            currentPage={meta?.page}
            onPageChange={handlePageChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            emptyMessage="No jobs available at the moment. Please check back later."
          />

          {/* Jobs count and info */}
          {!loading && !error && jobs.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                mt: 6,
                p: 3,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: `${companyTheme.primary}08`,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                sx={{
                  fontStyle: "italic",
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <span>
                  Showing {jobs.length} out of {meta?.total || jobs.length}{" "}
                  available positions
                </span>
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", md: "block" } }}
                />
                <span>
                  Found the perfect job? Apply now and take the next step in
                  your career journey!
                </span>
              </Typography>
            </Paper>
          )}
        </Container>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={5000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default JobsPage;
