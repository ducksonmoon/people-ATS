import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Pagination,
  Alert,
  Button,
  Paper,
  Fade,
  Skeleton,
  Menu,
  MenuItem,
  Chip,
  Tooltip,
  IconButton,
  useMediaQuery,
  Zoom,
  LinearProgress,
  Divider,
  Card,
  CardActionArea,
  CardContent,
  CardActions,
  Avatar,
  CardHeader,
  ButtonBase,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Job } from "../../types/job";
import JobCard from "../JobCard";
import {
  WorkOutline,
  SearchOff,
  ViewList,
  ViewModule,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  FilterAlt,
  Timer,
  List,
  Speed,
  Settings,
  SettingsApplications,
} from "@mui/icons-material";
import useCompanyTheme from "../../hooks/useCompanyTheme";
import { useTheme } from "@mui/material/styles";

interface JobsGridProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  emptyMessage?: string;
  onJobClick: (jobId: number) => void;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

// Sort options for jobs display
type SortOption = {
  label: string;
  value: string;
  icon: React.ReactNode;
};

// View mode for jobs display (grid or list)
type ViewMode = "grid" | "list";

/**
 * Enhanced grid/list view for displaying job listings with advanced UI features
 */
const JobsGrid: React.FC<JobsGridProps> = ({
  jobs,
  loading,
  error,
  emptyMessage = "No jobs available at the moment. Please check back later.",
  onJobClick,
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  hasActiveFilters = false,
  onClearFilters,
}) => {
  const theme = useTheme();
  const companyTheme = useCompanyTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for sort menu
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [sortOption, setSortOption] = useState<string>("recent");

  // State for view mode (grid or list)
  const [viewMode, setViewMode] = useState<ViewMode>(
    isMobile ? "list" : "grid"
  );

  // Sort options for the sort menu
  const sortOptions: SortOption[] = [
    {
      label: "Most Recent",
      value: "recent",
      icon: <Timer fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
    },
    {
      label: "Alphabetical (A-Z)",
      value: "alpha-asc",
      icon: <ArrowUpward fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
    },
    {
      label: "Alphabetical (Z-A)",
      value: "alpha-desc",
      icon: <ArrowDownward fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
    },
    {
      label: "Relevance",
      value: "relevance",
      icon: <Speed fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />,
    },
  ];

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    console.log("Pagination click - changing to page:", value);
    if (onPageChange) {
      onPageChange(value);
      // Scroll to top when changing page
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleSortMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchor(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortMenuAnchor(null);
  };

  const handleSortOptionSelect = (value: string) => {
    setSortOption(value);
    handleSortMenuClose();
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: ViewMode | null
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Sort jobs based on the selected sort option
  const sortedJobs = [...jobs].sort((a, b) => {
    switch (sortOption) {
      case "alpha-asc":
        return a.title.localeCompare(b.title);
      case "alpha-desc":
        return b.title.localeCompare(a.title);
      case "recent":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "relevance":
        // In a real app, this would use a relevance score
        return 0;
      default:
        return 0;
    }
  });

  // Render loading skeletons - enhanced with staggered animation
  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Skeleton
            variant="rectangular"
            width={200}
            height={40}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={40}
            sx={{ borderRadius: 1 }}
          />
        </Box>

        <LinearProgress
          sx={{
            mb: 4,
            borderRadius: 5,
            height: 6,
            backgroundColor: `${companyTheme.primary}15`,
            ".MuiLinearProgress-bar": {
              backgroundColor: companyTheme.primary,
            },
          }}
        />

        <Grid container spacing={3}>
          {Array.from(new Array(viewMode === "grid" ? 6 : 3)).map(
            (_, index) => (
              <Grid
                item
                xs={12}
                sm={viewMode === "list" ? 12 : 6}
                md={viewMode === "list" ? 12 : 4}
                key={index}
              >
                <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      height: "100%",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Box sx={{ display: "flex", mb: 2, gap: 2 }}>
                      <Skeleton variant="circular" width={50} height={50} />
                      <Box width="100%">
                        <Skeleton width="80%" height={32} />
                        <Skeleton width="60%" height={24} />
                      </Box>
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      height={80}
                      sx={{ mb: 2 }}
                    />
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}
                    >
                      <Skeleton width={100} height={32} />
                      <Skeleton width={100} height={32} />
                      <Skeleton width={150} height={32} />
                    </Box>
                    <Skeleton width={120} height={40} />
                  </Paper>
                </Zoom>
              </Grid>
            )
          )}
        </Grid>
      </Box>
    );
  }

  // Render error message
  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}
        action={
          <Button
            color="inherit"
            onClick={() => onPageChange && onPageChange(1)}
            startIcon={<Refresh />}
          >
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // Render empty state
  if (jobs.length === 0) {
    return (
      <Fade in={true}>
        <Paper
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 2,
            border: "1px dashed #ccc",
            backgroundColor: "rgba(0,0,0,0.02)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <SearchOff sx={{ fontSize: 80, color: "#aaa" }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {hasActiveFilters
                ? "No jobs match your search criteria"
                : emptyMessage}
            </Typography>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                color="primary"
                onClick={onClearFilters}
                startIcon={<FilterAlt />}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Paper>
      </Fade>
    );
  }

  const sortLabel =
    sortOptions.find((option) => option.value === sortOption)?.label || "Sort";

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header with job count, view mode toggle, and sort options */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WorkOutline sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              color: theme.palette.text.primary,
            }}
          >
            {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Found
          </Typography>

          {hasActiveFilters && (
            <Chip
              label="Filtered"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ ml: 1.5 }}
              icon={<FilterAlt fontSize="small" />}
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {/* View mode toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
            sx={{
              mr: 1,
              ".MuiToggleButton-root.Mui-selected": {
                backgroundColor: `${companyTheme.primary}20`,
                color: companyTheme.primary,
              },
            }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <ViewModule fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewList fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Sort button */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleSortMenuOpen}
            endIcon={<Sort fontSize="small" />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: `${theme.palette.primary.main}05`,
              },
            }}
          >
            {sortOptions.find((opt) => opt.value === sortOption)?.icon}
            {!isMobile && sortLabel}
          </Button>

          <Menu
            anchorEl={sortMenuAnchor}
            open={Boolean(sortMenuAnchor)}
            onClose={handleSortMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 200,

                borderRadius: 2,
                "& .MuiMenuItem-root": {
                  py: 1,
                },
              },
            }}
          >
            {sortOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => handleSortOptionSelect(option.value)}
                selected={sortOption === option.value}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  "&.Mui-selected": {
                    backgroundColor: `${companyTheme.primary}15`,
                    "&:hover": {
                      backgroundColor: `${companyTheme.primary}25`,
                    },
                  },
                }}
              >
                {option.icon}
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Jobs grid or list */}
      <Fade in={true}>
        <Grid container spacing={3}>
          {sortedJobs.map((job, index) => (
            <Grid
              item
              xs={12}
              sm={viewMode === "list" ? 12 : 6}
              md={viewMode === "list" ? 12 : 4}
              key={job.id}
            >
              <Zoom
                in={true}
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <Box>
                  {viewMode === "grid" ? (
                    <JobCard
                      id={job.id}
                      title={job.title}
                      description={job.description}
                      company={job.company?.name || ""}
                      companyLogo={job.company?.logoUrl}
                      location={
                        typeof job.location === "object"
                          ? job.location?.name || ""
                          : job.location || ""
                      }
                      category={
                        typeof job.category === "object"
                          ? job.category?.name || ""
                          : job.category || ""
                      }
                      createdAt={job.createdAt}
                    />
                  ) : (
                    // List view layout
                    <ListJobCard
                      job={job}
                      onClick={() => onJobClick(job.id)}
                      companyTheme={companyTheme}
                    />
                  )}
                </Box>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5,
            pt: 3,
            borderTop: "1px solid #eee",
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                color: companyTheme.primary,
              },
              "& .Mui-selected": {
                backgroundColor: `${companyTheme.primaryBackground} !important`,
                fontWeight: "bold",
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

// List view job card component
interface ListJobCardProps {
  job: Job;
  onClick: () => void;
  companyTheme: any;
}

const ListJobCard: React.FC<ListJobCardProps> = ({
  job,
  onClick,
  companyTheme,
}) => {
  const theme = useTheme();

  // Create a short description for preview
  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const shortDescription = stripHtml(job.description).substring(0, 200) + "...";

  return (
    <Card
      elevation={1}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: "hidden",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateX(5px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderLeft: `4px solid ${companyTheme.primary}`,
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <Box sx={{ display: "flex", p: 2 }}>
          {/* Company logo */}
          <Box sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>
            <Avatar
              src={job.company?.logoUrl}
              alt={job.company?.name || ""}
              sx={{
                width: 60,
                height: 60,
                bgcolor: theme.palette.primary.main,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {job.company?.name?.charAt(0).toUpperCase() || "J"}
            </Avatar>
          </Box>

          {/* Job info */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {job.title}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {job.company?.name || ""}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, display: { xs: "none", md: "block" } }}
            >
              {shortDescription}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mt: 1,
              }}
            >
              {job.location && (
                <Chip
                  size="small"
                  label={
                    typeof job.location === "object"
                      ? job.location?.name
                      : job.location
                  }
                  sx={{
                    borderRadius: "50px",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    height: "24px",
                  }}
                />
              )}

              {job.category && (
                <Chip
                  size="small"
                  label={
                    typeof job.category === "object"
                      ? job.category?.name
                      : job.category
                  }
                  sx={{
                    borderRadius: "50px",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    height: "24px",
                  }}
                />
              )}

              <Chip
                size="small"
                label={formatDate(job.createdAt)}
                sx={{
                  borderRadius: "50px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  height: "24px",
                }}
              />
            </Box>
          </Box>

          {/* View job button on larger screens */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              ml: 2,
            }}
          >
            <Chip
              label="View Job"
              color="primary"
              sx={{
                borderRadius: "50px",
                px: 1,
                bgcolor: companyTheme.primary,
                "&:hover": {
                  bgcolor: companyTheme.primaryDark,
                },
              }}
            />
          </Box>
        </Box>
      </CardActionArea>
    </Card>
  );
};

// Helper function to format date for display
const formatDate = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

export default JobsGrid;
