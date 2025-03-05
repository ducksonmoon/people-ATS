import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme,
  tableCellClasses,
  OutlinedInput,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { DepartmentGoal } from "../../types/hiring-goal";
import { HiringGoalStatus, HiringGoalPriority } from "../../types/hiring-enums";
import { getHealthScoreColor } from "../../utils/hiringGoalsUtils";

// Define type for sort order
type Order = "asc" | "desc";

// Define the props interface
interface HiringGoalsTableProps {
  departmentData: DepartmentGoal[];
  onEdit: (dept: DepartmentGoal) => void;
  onDelete: (dept: DepartmentGoal) => void;
}

// Styled table cells for a nicer appearance
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.grey[100],
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

// Table component
const HiringGoalsTable: React.FC<HiringGoalsTableProps> = ({
  departmentData,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();

  // State for sorting
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof DepartmentGoal>("name");

  // State for filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Handle request sort
  const handleRequestSort = (property: keyof DepartmentGoal) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Create sort handler
  const createSortHandler = (property: keyof DepartmentGoal) => () => {
    handleRequestSort(property);
  };

  // Filter the data based on search and filters
  const filteredData = useMemo(() => {
    return departmentData.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description &&
          dept.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || dept.status === statusFilter;
      const matchesPriority =
        priorityFilter === "ALL" || dept.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [departmentData, searchQuery, statusFilter, priorityFilter]);

  // Sort the data
  const sortedData = useMemo(() => {
    const comparator = (a: DepartmentGoal, b: DepartmentGoal) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle comparing dates
      if (orderBy === "startDate" || orderBy === "endDate") {
        aValue = new Date(aValue as Date).getTime();
        bValue = new Date(bValue as Date).getTime();
      }

      // Convert to strings for string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Compare numbers
      return order === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    };

    return [...filteredData].sort(comparator);
  }, [filteredData, order, orderBy]);

  // Get color for status chip
  const getStatusColor = (status: HiringGoalStatus) => {
    switch (status) {
      case HiringGoalStatus.NOT_STARTED:
        return theme.palette.grey[500];
      case HiringGoalStatus.IN_PROGRESS:
        return theme.palette.primary.main;
      case HiringGoalStatus.ON_TRACK:
        return theme.palette.success.light;
      case HiringGoalStatus.AT_RISK:
        return theme.palette.error.main;
      case HiringGoalStatus.COMPLETED:
        return theme.palette.success.main;
      case HiringGoalStatus.ON_HOLD:
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get color for priority chip
  const getPriorityColor = (priority: HiringGoalPriority) => {
    switch (priority) {
      case HiringGoalPriority.HIGH:
        return theme.palette.error.main;
      case HiringGoalPriority.MEDIUM:
        return theme.palette.warning.main;
      case HiringGoalPriority.LOW:
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format date as locale string
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
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
        <Typography variant="h6">Department Hiring Goals</Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon fontSize="small" sx={{ ml: -0.5 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <Divider />
              {Object.values(HiringGoalStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="priority-filter-label">Priority</InputLabel>
            <Select
              labelId="priority-filter-label"
              value={priorityFilter}
              label="Priority"
              onChange={(e) => setPriorityFilter(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <FilterIcon fontSize="small" sx={{ ml: -0.5 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="ALL">All Priorities</MenuItem>
              <Divider />
              {Object.values(HiringGoalPriority).map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {sortedData.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No hiring goals match your filters. Try adjusting your search
            criteria.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Box}>
          <Table aria-label="hiring goals table" size="medium">
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={createSortHandler("name")}
                  >
                    Department
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel
                    active={orderBy === "currentEmployees"}
                    direction={orderBy === "currentEmployees" ? order : "asc"}
                    onClick={createSortHandler("currentEmployees")}
                  >
                    Current
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel
                    active={orderBy === "targetHeadcount"}
                    direction={orderBy === "targetHeadcount" ? order : "asc"}
                    onClick={createSortHandler("targetHeadcount")}
                  >
                    Target
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">Gap</StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "endDate"}
                    direction={orderBy === "endDate" ? order : "asc"}
                    onClick={createSortHandler("endDate")}
                  >
                    Deadline
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={createSortHandler("status")}
                  >
                    Status
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "priority"}
                    direction={orderBy === "priority" ? order : "asc"}
                    onClick={createSortHandler("priority")}
                  >
                    Priority
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="right">
                  <TableSortLabel
                    active={orderBy === "budget"}
                    direction={orderBy === "budget" ? order : "asc"}
                    onClick={createSortHandler("budget")}
                  >
                    Budget
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell>
                  <TableSortLabel
                    active={orderBy === "healthScore"}
                    direction={orderBy === "healthScore" ? order : "asc"}
                    onClick={createSortHandler("healthScore")}
                  >
                    Health
                  </TableSortLabel>
                </StyledTableCell>
                <StyledTableCell align="center">Actions</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row) => {
                const gap = Math.max(
                  0,
                  row.targetHeadcount - row.currentEmployees
                );
                const healthColor = getHealthScoreColor(row.healthScore);

                return (
                  <StyledTableRow key={row.id}>
                    <StyledTableCell component="th" scope="row">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {row.name}
                        </Typography>
                        {row.description && (
                          <Typography variant="caption" color="text.secondary">
                            {row.description}
                          </Typography>
                        )}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {row.currentEmployees}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {row.targetHeadcount}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {gap > 0 && (
                        <Chip
                          label={gap}
                          size="small"
                          sx={{
                            backgroundColor:
                              gap > 5
                                ? theme.palette.error.light
                                : theme.palette.warning.light,
                            color:
                              gap > 5
                                ? theme.palette.error.contrastText
                                : theme.palette.warning.contrastText,
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2">
                          {formatDate(row.endDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.timeRemaining}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label={row.status.replace(/_/g, " ")}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(row.status),
                          color: "white",
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label={row.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(row.priority),
                          color: "white",
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      ${row.budget ? row.budget.toLocaleString() : 0}
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label={Math.round(row.healthScore)}
                        size="small"
                        sx={{
                          backgroundColor: healthColor.background,
                          color: healthColor.text,
                          fontWeight: "bold",
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEdit(row)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(row)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default HiringGoalsTable;
