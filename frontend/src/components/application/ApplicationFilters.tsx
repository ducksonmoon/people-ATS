import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Chip,
  InputBase,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  alpha,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";

interface ApplicationFiltersProps {
  tabValue: number;
  statusFilter: string;
  sourceFilter?: string;
  searchTerm: string;
  applications: any[]; // Using any for simplicity
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onStatusFilterChange: (event: SelectChangeEvent) => void;
  onSourceFilterChange?: (event: SelectChangeEvent) => void;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFilters: () => void;
}

/**
 * Component for filtering and searching applications
 */
const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
  tabValue,
  statusFilter,
  sourceFilter = "all",
  searchTerm,
  applications,
  onTabChange,
  onStatusFilterChange,
  onSourceFilterChange,
  onSearchChange,
  onClearFilters,
}) => {
  const theme = useTheme();

  // Count applications by status
  const countByStatus = {
    all: applications.length,
    PENDING: applications.filter((app) => app.status === "PENDING").length,
    INTERVIEWING: applications.filter((app) => app.status === "INTERVIEWING")
      .length,
    OFFER_SENT: applications.filter((app) => app.status === "OFFER_SENT")
      .length,
    HIRED: applications.filter((app) => app.status === "HIRED").length,
    REJECTED: applications.filter((app) => app.status === "REJECTED").length,
  };

  // Get unique sources from applications
  const sources = Array.from(
    new Set(applications.filter((app) => app.source).map((app) => app.source))
  );

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={onTabChange}
          aria-label="application tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              minHeight: 64,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              px: 3,
              py: 2,
            },
          }}
        >
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography component="span" fontWeight="medium">
                  All Applications
                </Typography>
                <Chip
                  size="small"
                  label={countByStatus.all}
                  sx={{ mt: 1, height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography component="span" fontWeight="medium">
                  Pending
                </Typography>
                <Chip
                  size="small"
                  label={countByStatus.PENDING}
                  color="warning"
                  sx={{ mt: 1, height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography component="span" fontWeight="medium">
                  Interviewing
                </Typography>
                <Chip
                  size="small"
                  label={countByStatus.INTERVIEWING}
                  color="info"
                  sx={{ mt: 1, height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography component="span" fontWeight="medium">
                  Offer Sent
                </Typography>
                <Chip
                  size="small"
                  label={countByStatus.OFFER_SENT}
                  color="primary"
                  sx={{ mt: 1, height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography component="span" fontWeight="medium">
                  Hired
                </Typography>
                <Chip
                  size="small"
                  label={countByStatus.HIRED}
                  color="success"
                  sx={{ mt: 1, height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography component="span" fontWeight="medium">
                  Rejected
                </Typography>
                <Chip
                  size="small"
                  label={countByStatus.REJECTED}
                  color="error"
                  sx={{ mt: 1, height: 20, fontSize: "0.75rem" }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ position: "relative", width: 300, mr: 2 }}>
          <SearchIcon
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              color: "text.disabled",
            }}
          />
          <InputBase
            placeholder="Search by name or job title..."
            value={searchTerm}
            onChange={onSearchChange}
            sx={{
              pl: 4,
              pr: 1,
              py: 1,
              width: "100%",
              borderRadius: 1,
              backgroundColor: "background.paper",
              "&:hover": {
                backgroundColor: alpha(theme.palette.common.white, 0.95),
              },
              border: `1px solid ${theme.palette.divider}`,
            }}
            inputProps={{
              "aria-label": "search applications",
            }}
          />
        </Box>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="status-filter-label">Status Filter</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={onStatusFilterChange}
            label="Status Filter"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="INTERVIEWING">Interviewing</MenuItem>
            <MenuItem value="OFFER_SENT">Offer Sent</MenuItem>
            <MenuItem value="HIRED">Hired</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>

        {onSourceFilterChange && sources.length > 0 && (
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 200, ml: 2 }}
          >
            <InputLabel id="source-filter-label">Source Filter</InputLabel>
            <Select
              labelId="source-filter-label"
              id="source-filter"
              value={sourceFilter}
              onChange={onSourceFilterChange}
              label="Source Filter"
            >
              <MenuItem value="all">All Sources</MenuItem>
              <MenuItem value="direct">Direct</MenuItem>
              {sources.map((source) => (
                <MenuItem key={source} value={source}>
                  {source.charAt(0).toUpperCase() +
                    source.slice(1).replace("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <Button
          startIcon={<FilterListIcon />}
          sx={{ ml: "auto" }}
          onClick={onClearFilters}
        >
          Clear Filters
        </Button>
      </Box>
    </>
  );
};

export default ApplicationFilters;
