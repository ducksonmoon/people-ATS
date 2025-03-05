import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  useMediaQuery,
  Chip,
  Stack,
  Paper,
  InputAdornment,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
  Slider,
  Autocomplete,
  Fade,
  Badge,
  Menu,
} from "@mui/material";
import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  Refresh,
  LocationOn,
  BusinessCenter,
  MoreVert,
  AttachMoney,
  Close,
  CheckCircle,
  TuneRounded,
  AccessTime,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import useCompanyTheme from "../../hooks/useCompanyTheme";

interface JobFiltersProps {
  search: string;
  category: string;
  location: string;
  categories: Array<{ id: number; name: string }>;
  locations: Array<{ id: number; name: string }>;
  onFilterChange: (
    type: "search" | "category" | "location",
    value: string
  ) => void;
  onSubmit: () => void;
  onClear: () => void;
}

// Advanced filter types for future implementation
type AdvancedFilters = {
  salary?: [number, number];
  experience?: string;
  employmentType?: string[];
  datePosted?: string;
  remote?: boolean;
  skills?: string[];
};

/**
 * Enhanced component for filtering jobs with advanced options and better UX
 */
const JobFilters: React.FC<JobFiltersProps> = ({
  search,
  category,
  location,
  categories,
  locations,
  onFilterChange,
  onSubmit,
  onClear,
}) => {
  const theme = useTheme();
  const companyTheme = useCompanyTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [expanded, setExpanded] = useState(!isMobile);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // These would be initialized from props in a real implementation
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    salary: [0, 150000],
    experience: "",
    employmentType: [],
    datePosted: "",
    remote: false,
    skills: [],
  });

  // Count of active advanced filters (for badge)
  const advancedFilterCount = Object.values(advancedFilters).filter(
    (value) =>
      (Array.isArray(value) && value.length > 0) ||
      (typeof value === "boolean" && value) ||
      (typeof value === "string" && value) ||
      (Array.isArray(value) && value.length === 2 && value[0] > 0)
  ).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Filters submitted:", { search, category, location });
    onSubmit();
  };

  const handleFilterChange = (
    type: "search" | "category" | "location",
    value: string
  ) => {
    console.log(`Changing ${type} filter to:`, value);
    onFilterChange(type, value);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Determine if any filters are active
  const hasActiveFilters =
    search || category || location || advancedFilterCount > 0;

  // Job types for demo
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Remote",
  ];

  // Experience levels for demo
  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "executive", label: "Executive" },
  ];

  // Posted timeframes for demo
  const postedTimeframes = [
    { value: "1d", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "14d", label: "Last 14 days" },
    { value: "30d", label: "Last 30 days" },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        mb: 4,
        p: 0,
        borderRadius: 2,
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: hasActiveFilters
            ? "0 8px 24px rgba(0,0,0,0.15)"
            : "0 6px 20px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header with toggle button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2.5,
          borderBottom: expanded
            ? `1px solid ${theme.palette.divider}`
            : "none",
          transition: "all 0.3s ease",
          bgcolor: expanded ? "transparent" : "rgba(0,0,0,0.01)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Badge
            color="primary"
            badgeContent={
              hasActiveFilters
                ? (search ? 1 : 0) +
                  (category ? 1 : 0) +
                  (location ? 1 : 0) +
                  advancedFilterCount
                : 0
            }
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.8rem",
                height: "22px",
                minWidth: "22px",
              },
            }}
          >
            <FilterList color="primary" />
          </Badge>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              display: "flex",
              alignItems: "center",
            }}
          >
            {hasActiveFilters ? "Active Filters" : "Filter Jobs"}
          </Typography>

          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <Chip
                label="Clear All"
                size="small"
                deleteIcon={<Clear fontSize="small" />}
                onDelete={onClear}
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip
            title={
              showAdvancedFilters
                ? "Hide advanced filters"
                : "Show advanced filters"
            }
          >
            <Badge
              color="primary"
              badgeContent={advancedFilterCount}
              invisible={advancedFilterCount === 0}
            >
              <IconButton
                onClick={toggleAdvancedFilters}
                color={showAdvancedFilters ? "primary" : "default"}
                size="small"
              >
                <TuneRounded />
              </IconButton>
            </Badge>
          </Tooltip>

          <IconButton onClick={toggleExpand} size="small" sx={{ ml: 0.5 }}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Basic filters */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2.5, pt: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} alignItems="stretch">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Search Jobs"
                  placeholder="Job title, skills, keywords..."
                  variant="outlined"
                  value={search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: search ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => handleFilterChange("search", "")}
                          edge="end"
                          aria-label="clear search"
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="category-label">
                    <BusinessCenter
                      fontSize="small"
                      sx={{ mr: 0.5, verticalAlign: "middle" }}
                    />
                    Category
                  </InputLabel>
                  <Select
                    labelId="category-label"
                    value={category}
                    onChange={(e) =>
                      handleFilterChange("category", e.target.value as string)
                    }
                    label={
                      <>
                        <BusinessCenter
                          fontSize="small"
                          sx={{ mr: 0.5, verticalAlign: "middle" }}
                        />
                        Category
                      </>
                    }
                    endAdornment={
                      category ? (
                        <IconButton
                          size="small"
                          sx={{ mr: 2 }}
                          onClick={() => handleFilterChange("category", "")}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      ) : null
                    }
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
                  <InputLabel id="location-label">
                    <LocationOn
                      fontSize="small"
                      sx={{ mr: 0.5, verticalAlign: "middle" }}
                    />
                    Location
                  </InputLabel>
                  <Select
                    labelId="location-label"
                    value={location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value as string)
                    }
                    label={
                      <>
                        <LocationOn
                          fontSize="small"
                          sx={{ mr: 0.5, verticalAlign: "middle" }}
                        />
                        Location
                      </>
                    }
                    endAdornment={
                      location ? (
                        <IconButton
                          size="small"
                          sx={{ mr: 2 }}
                          onClick={() => handleFilterChange("location", "")}
                        >
                          <Clear fontSize="small" />
                        </IconButton>
                      ) : null
                    }
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
              <Grid item xs={12} md={1}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  size="large"
                  sx={{
                    height: "100%",
                    background: companyTheme.primaryGradient,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                    },
                    borderRadius: 1,
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>

            {/* Advanced filters section */}
            <Collapse in={showAdvancedFilters}>
              <Box
                sx={{
                  mt: 3,
                  pt: 3,
                  borderTop: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <TuneRounded fontSize="small" />
                  Advanced Filters
                </Typography>

                <Grid container spacing={3}>
                  {/* Salary range */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ px: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AttachMoney fontSize="small" />
                        Salary Range: $
                        {advancedFilters.salary?.[0].toLocaleString()} - $
                        {advancedFilters.salary?.[1].toLocaleString()}
                      </Typography>
                      <Slider
                        value={advancedFilters.salary}
                        onChange={(_, newValue) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            salary: newValue as [number, number],
                          })
                        }
                        min={0}
                        max={200000}
                        step={5000}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) =>
                          `$${value.toLocaleString()}`
                        }
                        sx={{
                          color: companyTheme.primary,
                          "& .MuiSlider-valueLabel": {
                            backgroundColor: companyTheme.primary,
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Experience level */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="experience-label">
                        Experience Level
                      </InputLabel>
                      <Select
                        labelId="experience-label"
                        value={advancedFilters.experience}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            experience: e.target.value as string,
                          })
                        }
                        label="Experience Level"
                      >
                        <MenuItem value="">
                          <em>Any Experience</em>
                        </MenuItem>
                        {experienceLevels.map((level) => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Date posted */}
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel id="date-posted-label">
                        Date Posted
                      </InputLabel>
                      <Select
                        labelId="date-posted-label"
                        value={advancedFilters.datePosted}
                        onChange={(e) =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            datePosted: e.target.value as string,
                          })
                        }
                        label="Date Posted"
                        startAdornment={
                          <AccessTime fontSize="small" sx={{ mr: 1, ml: 1 }} />
                        }
                      >
                        <MenuItem value="">
                          <em>Any Time</em>
                        </MenuItem>
                        {postedTimeframes.map((timeframe) => (
                          <MenuItem
                            key={timeframe.value}
                            value={timeframe.value}
                          >
                            {timeframe.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Job types */}
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="job-types"
                      options={jobTypes}
                      value={advancedFilters.employmentType || []}
                      onChange={(_, newValue) =>
                        setAdvancedFilters({
                          ...advancedFilters,
                          employmentType: newValue,
                        })
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Job Type"
                          placeholder="Select job types"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                            sx={{
                              backgroundColor: `${companyTheme.primary}15`,
                              "& .MuiChip-deleteIcon": {
                                color: companyTheme.primary,
                              },
                            }}
                          />
                        ))
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            </Collapse>

            {/* Active filters display */}
            {hasActiveFilters && (
              <Box sx={{ mt: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ gap: 1 }}
                >
                  {search && (
                    <Fade in={true}>
                      <Chip
                        label={`Search: ${search}`}
                        onDelete={() => handleFilterChange("search", "")}
                        size="small"
                        color="primary"
                        variant="outlined"
                        deleteIcon={<Close fontSize="small" />}
                        sx={{
                          borderRadius: "50px",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: `${companyTheme.primary}10`,
                          },
                        }}
                      />
                    </Fade>
                  )}

                  {category && (
                    <Fade in={true}>
                      <Chip
                        icon={<BusinessCenter fontSize="small" />}
                        label={`${
                          categories.find((c) => c.id.toString() === category)
                            ?.name || category
                        }`}
                        onDelete={() => handleFilterChange("category", "")}
                        size="small"
                        color="primary"
                        variant="outlined"
                        deleteIcon={<Close fontSize="small" />}
                        sx={{
                          borderRadius: "50px",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: `${companyTheme.primary}10`,
                          },
                        }}
                      />
                    </Fade>
                  )}

                  {location && (
                    <Fade in={true}>
                      <Chip
                        icon={<LocationOn fontSize="small" />}
                        label={`${
                          locations.find((l) => l.id.toString() === location)
                            ?.name || location
                        }`}
                        onDelete={() => handleFilterChange("location", "")}
                        size="small"
                        color="primary"
                        variant="outlined"
                        deleteIcon={<Close fontSize="small" />}
                        sx={{
                          borderRadius: "50px",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            bgcolor: `${companyTheme.primary}10`,
                          },
                        }}
                      />
                    </Fade>
                  )}

                  {/* Advanced filter chips */}
                  {advancedFilters.experience && (
                    <Fade in={true}>
                      <Chip
                        label={`Experience: ${
                          experienceLevels.find(
                            (el) => el.value === advancedFilters.experience
                          )?.label
                        }`}
                        onDelete={() =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            experience: "",
                          })
                        }
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ borderRadius: "50px" }}
                      />
                    </Fade>
                  )}

                  {advancedFilters.datePosted && (
                    <Fade in={true}>
                      <Chip
                        icon={<AccessTime fontSize="small" />}
                        label={`Posted: ${
                          postedTimeframes.find(
                            (pt) => pt.value === advancedFilters.datePosted
                          )?.label
                        }`}
                        onDelete={() =>
                          setAdvancedFilters({
                            ...advancedFilters,
                            datePosted: "",
                          })
                        }
                        size="small"
                        color="default"
                        variant="outlined"
                        sx={{ borderRadius: "50px" }}
                      />
                    </Fade>
                  )}

                  {advancedFilters.employmentType &&
                    advancedFilters.employmentType.length > 0 && (
                      <Fade in={true}>
                        <Chip
                          label={`Job Types: ${advancedFilters.employmentType.length}`}
                          onDelete={() =>
                            setAdvancedFilters({
                              ...advancedFilters,
                              employmentType: [],
                            })
                          }
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ borderRadius: "50px" }}
                        />
                      </Fade>
                    )}

                  {advancedFilters.salary &&
                    (advancedFilters.salary[0] > 0 ||
                      advancedFilters.salary[1] < 200000) && (
                      <Fade in={true}>
                        <Chip
                          icon={<AttachMoney fontSize="small" />}
                          label={`$${advancedFilters.salary[0].toLocaleString()} - $${advancedFilters.salary[1].toLocaleString()}`}
                          onDelete={() =>
                            setAdvancedFilters({
                              ...advancedFilters,
                              salary: [0, 200000],
                            })
                          }
                          size="small"
                          color="default"
                          variant="outlined"
                          sx={{ borderRadius: "50px" }}
                        />
                      </Fade>
                    )}
                </Stack>
              </Box>
            )}
          </form>
        </Box>
      </Collapse>

      {/* Decorative gradient accent */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background: companyTheme.primaryGradient,
        }}
      />
    </Paper>
  );
};

export default JobFilters;
