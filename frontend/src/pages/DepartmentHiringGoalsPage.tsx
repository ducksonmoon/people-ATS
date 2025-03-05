import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  LinearProgress,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { AppDispatch } from "../redux/store";
import { fetchCompanySettings } from "../redux/companySettingsSlice";
import { hrService } from "../services/hr.service";
import useCompanyTheme from "../hooks/useCompanyTheme";
import { useStateTracking } from "../hooks/useStateTracking";
import { HiringGoalStatus, HiringGoalPriority } from "../types/hiring-enums";
import {
  DepartmentWithGoal,
  DepartmentGoal,
  HistoricalGoal,
  DepartmentMetrics,
} from "../types/hiring-goal";

// Import utility functions
import {
  calculateTimeRemaining,
  calculateHealthScore,
} from "../utils/hiringGoalsUtils";

// Import components
import HiringGoalsDashboard from "../components/hiring-goals/HiringGoalsDashboard";
import HiringGoalsTable from "../components/hiring-goals/HiringGoalsTable";
import GoalEditDialog from "../components/hiring-goals/GoalEditDialog";
import GoalAddDialog from "../components/hiring-goals/GoalAddDialog";
import GoalDeleteDialog from "../components/hiring-goals/GoalDeleteDialog";
import HistoricalGoalsSection from "../components/hiring-goals/HistoricalGoalsSection";

// Archive operation result
interface ArchiveResult {
  archived: number;
  message: string;
}

// Snackbar message
interface SnackbarMessage {
  text: string;
  severity: "success" | "error" | "info";
}

const DepartmentHiringGoalsPage: React.FC = () => {
  const theme = useTheme();
  const companyTheme = useCompanyTheme();
  const { settings: companySettings } = useSelector(
    (state: RootState) => state.companySettings
  );
  const dispatch = useDispatch<AppDispatch>();

  // State tracking for department goals
  const {
    items: departmentData,
    setAllItems: setDepartmentData,
    markAsInserted,
    markAsUpdated,
    markAsDeleted,
    resetTracking,
    getChangePayload,
  } = useStateTracking<DepartmentGoal>([]);

  // Data states
  const [departments, setDepartments] = useState<DepartmentMetrics[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<
    DepartmentMetrics[]
  >([]);
  const [historicalGoals, setHistoricalGoals] = useState<HistoricalGoal[]>([]);
  const [availableRecruiters, setAvailableRecruiters] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] =
    useState<SnackbarMessage | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [archiveResult, setArchiveResult] = useState<ArchiveResult | null>(
    null
  );

  // Dialog states
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Selection states
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentGoal | null>(null);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<DepartmentGoal | null>(null);
  const [newDepartment, setNewDepartment] = useState<string>("");

  // Edit form states
  const [selectedTarget, setSelectedTarget] = useState<number>(0);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<HiringGoalPriority>(
    HiringGoalPriority.MEDIUM
  );
  const [selectedStatus, setSelectedStatus] = useState<HiringGoalStatus>(
    HiringGoalStatus.NOT_STARTED
  );
  const [selectedNotes, setSelectedNotes] = useState<string>("");
  const [selectedBudget, setSelectedBudget] = useState<number>(0);
  const [selectedRecruiters, setSelectedRecruiters] = useState<number[]>([]);

  // Fetch data from server
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch departments and hiring goals
      const departmentsData = await hrService.getDepartmentMetrics();
      const hiringGoalsData = await hrService.getHiringGoals();

      setDepartments(departmentsData);

      // Merge department and goal data
      const mergedData: DepartmentGoal[] = [];

      hiringGoalsData.forEach((goal: any) => {
        const dept = departmentsData.find(
          (d: DepartmentMetrics) => d.id === goal.departmentId
        );

        if (dept) {
          const timeRemaining = calculateTimeRemaining(goal.endDate);
          const healthScore = calculateHealthScore(goal);

          const assignedRecruiters = goal.assignedRecruiterIds
            ? goal.assignedRecruiterIds.map((id: number) => {
                const recruiter = availableRecruiters.find((r) => r.id === id);
                return { id, name: recruiter?.name || "Unknown Recruiter" };
              })
            : [];

          mergedData.push({
            id: dept.id,
            name: dept.name,
            description: goal.description || null,
            currentEmployees: dept.employeeCount || 0,
            targetHeadcount: goal.targetHeadcount,
            startDate: goal.startDate ? new Date(goal.startDate) : new Date(),
            endDate: goal.endDate
              ? new Date(goal.endDate)
              : new Date(new Date().getFullYear(), 11, 31),
            recentHires: 0,
            priority:
              (goal.priority as HiringGoalPriority) ||
              HiringGoalPriority.MEDIUM,
            status:
              (goal.status as HiringGoalStatus) || HiringGoalStatus.NOT_STARTED,
            progressMetrics: goal.progressMetrics || {
              openPositions: 0,
              activeCandidates: 0,
              interviewsScheduled: 0,
              offersExtended: 0,
            },
            notes: goal.notes || "",
            budget: goal.budget || 0,
            assignedRecruiters: assignedRecruiters,
            timeRemaining,
            healthScore,
          });
        }
      });

      setDepartmentData(mergedData);

      // Determine which departments don't have goals yet
      const depsWithoutGoals = departmentsData.filter(
        (dept) => !mergedData.some((d) => d.id === dept.id)
      );
      setAvailableDepartments(depsWithoutGoals);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load department data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [setDepartmentData, availableRecruiters]);

  // Fetch historical goals
  const fetchHistoricalGoals = useCallback(async () => {
    try {
      const historicalGoalsData = await hrService.getHistoricalHiringGoals();

      if (Array.isArray(historicalGoalsData)) {
        const processedData = historicalGoalsData.map((goal) => ({
          ...goal,
          startDate: new Date(goal.startDate),
          endDate: new Date(goal.endDate),
        }));

        setHistoricalGoals(processedData);
      } else {
        console.error(
          "Invalid historical goals data format:",
          historicalGoalsData
        );
        setError(
          "Failed to load historical hiring goals data. Invalid format received."
        );
      }
    } catch (error) {
      console.error("Error fetching historical goals:", error);
      setError(
        "Failed to load historical hiring goals. Please try again later."
      );
    }
  }, []);

  // Fetch available recruiters
  const fetchRecruiters = useCallback(async () => {
    try {
      const recruiters = await hrService.getRecruiters();
      setAvailableRecruiters(recruiters);
    } catch (error) {
      console.error("Error fetching recruiters:", error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchRecruiters();
    dispatch(fetchCompanySettings());
  }, [dispatch, fetchRecruiters]);

  // Load data after recruiters are loaded
  useEffect(() => {
    if (availableRecruiters.length > 0) {
      fetchData();
      fetchHistoricalGoals();
    }
  }, [fetchData, fetchHistoricalGoals, availableRecruiters]);

  // Handle saving changes to server
  const handleSaveChanges = async (): Promise<void> => {
    try {
      setSaveLoading(true);
      setError(null);

      const dataToSend = getChangePayload((item) => ({
        departmentId: item.id,
        targetHeadcount: item.targetHeadcount,
        startDate: item.startDate,
        endDate: item.endDate,
        priority: item.priority,
        status: item.status,
        notes: item.notes,
        budget: item.budget,
        assignedRecruiterIds: item.assignedRecruiters?.map((r) => r.id) || [],
      }));

      if (dataToSend.length === 0) {
        setSnackbarMessage({
          text: "No changes to save",
          severity: "info",
        });
        setSnackbarOpen(true);
        setSaveLoading(false);
        return;
      }

      const response = await hrService.updateHiringGoals(dataToSend);

      if (response.success) {
        setSnackbarMessage({
          text: "Hiring goals updated successfully",
          severity: "success",
        });
        setSnackbarOpen(true);

        resetTracking();
        fetchData();
      } else {
        setError(response.message || "Failed to update hiring goals");
        setSnackbarMessage({
          text: response.message || "Failed to update hiring goals",
          severity: "error",
        });
        setSnackbarOpen(true);
      }
    } catch (error: any) {
      console.error("Error saving changes:", error);
      setError("An error occurred while saving changes");
      setSnackbarMessage({
        text: error.message || "An error occurred while saving changes",
        severity: "error",
      });
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle editing a department
  const handleEditDepartment = (dept: DepartmentGoal): void => {
    setSelectedDepartment(dept);
    setSelectedTarget(dept.targetHeadcount);
    setSelectedStartDate(dept.startDate);
    setSelectedEndDate(dept.endDate);
    setSelectedPriority(dept.priority || HiringGoalPriority.MEDIUM);
    setSelectedStatus(dept.status || HiringGoalStatus.NOT_STARTED);
    setSelectedNotes(dept.notes || "");
    setSelectedBudget(dept.budget || 0);
    setOpenEditDialog(true);

    if (dept.assignedRecruiters && dept.assignedRecruiters.length > 0) {
      setSelectedRecruiters(
        dept.assignedRecruiters.map((recruiter) => recruiter.id)
      );
    } else {
      setSelectedRecruiters([]);
    }
  };

  // Handle save edit dialog
  const handleSaveEditDialog = (): void => {
    if (!selectedDepartment) return;

    const updatedDepartment: DepartmentGoal = {
      ...selectedDepartment,
      targetHeadcount: selectedTarget,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      priority: selectedPriority,
      status: selectedStatus,
      notes: selectedNotes,
      budget: selectedBudget,
      assignedRecruiters: selectedRecruiters.map((id) => {
        const recruiter = availableRecruiters.find((r) => r.id === id);
        return { id, name: recruiter?.name || "Unknown Recruiter" };
      }),
    };

    markAsUpdated(
      updatedDepartment,
      (item) => item.id === selectedDepartment.id
    );

    setOpenEditDialog(false);
    setSelectedDepartment(null);
    setSnackbarMessage({
      text: "Department changes saved. Click Save Changes to apply.",
      severity: "info",
    });
    setSnackbarOpen(true);
  };

  // Handle adding a new goal
  const handleAddNewGoal = (): void => {
    setOpenAddDialog(true);
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date(new Date().getFullYear(), 11, 31));
    setSelectedTarget(0);
    setSelectedBudget(0);
    setSelectedNotes("");
    setSelectedPriority(HiringGoalPriority.MEDIUM);
    setSelectedStatus(HiringGoalStatus.NOT_STARTED);
    setSelectedRecruiters([]);
    setNewDepartment("");
  };

  // Handle save add dialog
  const handleSaveAddDialog = (): void => {
    if (!newDepartment) return;

    const selectedDept = departments.find(
      (dept) => dept.id.toString() === newDepartment
    );
    if (!selectedDept) return;

    const newGoal: DepartmentGoal = {
      id: selectedDept.id,
      name: selectedDept.name,
      description: null,
      currentEmployees: selectedDept.employeeCount || 0,
      targetHeadcount: selectedTarget,
      startDate: selectedStartDate || new Date(),
      endDate: selectedEndDate || new Date(new Date().getFullYear(), 11, 31),
      recentHires: 0,
      priority: selectedPriority,
      status: selectedStatus,
      progressMetrics: {
        openPositions: 0,
        activeCandidates: 0,
        interviewsScheduled: 0,
        offersExtended: 0,
      },
      notes: selectedNotes,
      budget: selectedBudget,
      assignedRecruiters: selectedRecruiters.map((id) => {
        const recruiter = availableRecruiters.find((r) => r.id === id);
        return { id, name: recruiter?.name || "Unknown Recruiter" };
      }),
      timeRemaining: calculateTimeRemaining(
        selectedEndDate || new Date(new Date().getFullYear(), 11, 31)
      ),
      healthScore: calculateHealthScore({
        targetHeadcount: selectedTarget,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        progressMetrics: {
          openPositions: 0,
          activeCandidates: 0,
          interviewsScheduled: 0,
          offersExtended: 0,
        },
      }),
    };

    markAsInserted(newGoal);

    setOpenAddDialog(false);

    // Update available departments list
    setAvailableDepartments((prev) =>
      prev.filter((dept) => dept.id !== selectedDept.id)
    );

    setSnackbarMessage({
      text: "New hiring goal added. Click Save Changes to apply.",
      severity: "info",
    });
    setSnackbarOpen(true);
  };

  // Handle delete goal
  const handleDeleteGoal = (dept: DepartmentGoal): void => {
    setDepartmentToDelete(dept);
    setOpenDeleteDialog(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = (): void => {
    if (!departmentToDelete) return;

    markAsDeleted(
      departmentToDelete,
      (item) => item.id === departmentToDelete.id
    );

    // Add back to available departments
    const deptToAdd = departments.find((d) => d.id === departmentToDelete.id);
    if (deptToAdd) {
      setAvailableDepartments((prev) => [...prev, deptToAdd]);
    }

    setOpenDeleteDialog(false);
    setDepartmentToDelete(null);

    setSnackbarMessage({
      text: "Department hiring goal removed. Click Save Changes to apply.",
      severity: "info",
    });
    setSnackbarOpen(true);
  };

  // Handle archive expired goals
  const handleArchiveExpiredGoals = async (): Promise<void> => {
    try {
      setArchiveLoading(true);
      const result = await hrService.archiveExpiredHiringGoals();
      setArchiveResult(result);
      fetchData();
      fetchHistoricalGoals();

      setSnackbarMessage({
        text: result.message,
        severity: "success",
      });
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error("Error archiving goals:", error);
      setError("Failed to archive expired goals. Please try again later.");

      setSnackbarMessage({
        text: error.message || "Failed to archive expired goals",
        severity: "error",
      });
      setSnackbarOpen(true);
    } finally {
      setArchiveLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = (
    _: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Show loading indicator while data is loading
  if (loading) {
    return (
      <Box sx={{ width: "100%", mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ backgroundColor: "#f5f7fa", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                >
                  Department Hiring Goals
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchData}
                  >
                    Refresh
                  </Button>
                  <Button
                    color="primary"
                    startIcon={<ArchiveIcon />}
                    variant="outlined"
                    onClick={handleArchiveExpiredGoals}
                    disabled={archiveLoading}
                  >
                    {archiveLoading ? "Archiving..." : "Archive Expired Goals"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddNewGoal}
                    disabled={availableDepartments.length === 0}
                  >
                    Add Goal
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveChanges}
                    disabled={saveLoading}
                    sx={{
                      background:
                        companyTheme.primaryGradient ||
                        "linear-gradient(135deg, #1E3A5F, #3B4D61)",
                      color: companyTheme.contrastText || "white",
                      boxShadow: "0 2px 8px rgba(30, 58, 95, 0.2)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #15293F, #2B3B4B)",
                      },
                    }}
                  >
                    {saveLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </Box>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
            </Grid>

            {/* Dashboard */}
            <HiringGoalsDashboard departmentData={departmentData} />

            {/* Main hiring goals table */}
            <Grid item xs={12}>
              <HiringGoalsTable
                departmentData={departmentData}
                onEdit={handleEditDepartment}
                onDelete={handleDeleteGoal}
              />
            </Grid>
          </Grid>
        </Container>

        {/* Historical Goals Section */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <HistoricalGoalsSection
                historicalGoals={historicalGoals}
                yearFilter={yearFilter}
                onYearFilterChange={setYearFilter}
              />
            </Grid>
          </Grid>
        </Container>

        {/* Growth Rate Section */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Growth Rate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review the growth rate from company settings.
                  </Typography>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Default Growth Rate:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  {companySettings?.growthRate
                    ? `${(companySettings.growthRate * 100).toFixed(0)}%`
                    : "10%"}{" "}
                  (Configured in Company Settings)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Dialogs */}
      <GoalEditDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        onSave={handleSaveEditDialog}
        selectedDepartment={selectedDepartment}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        selectedStartDate={selectedStartDate}
        setSelectedStartDate={setSelectedStartDate}
        selectedEndDate={selectedEndDate}
        setSelectedEndDate={setSelectedEndDate}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedNotes={selectedNotes}
        setSelectedNotes={setSelectedNotes}
        selectedBudget={selectedBudget}
        setSelectedBudget={setSelectedBudget}
        selectedRecruiters={selectedRecruiters}
        setSelectedRecruiters={setSelectedRecruiters}
        availableRecruiters={availableRecruiters}
        companyTheme={companyTheme}
      />

      <GoalAddDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        onSave={handleSaveAddDialog}
        newDepartment={newDepartment}
        setNewDepartment={setNewDepartment}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        selectedStartDate={selectedStartDate}
        setSelectedStartDate={setSelectedStartDate}
        selectedEndDate={selectedEndDate}
        setSelectedEndDate={setSelectedEndDate}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedNotes={selectedNotes}
        setSelectedNotes={setSelectedNotes}
        selectedBudget={selectedBudget}
        setSelectedBudget={setSelectedBudget}
        selectedRecruiters={selectedRecruiters}
        setSelectedRecruiters={setSelectedRecruiters}
        availableRecruiters={availableRecruiters}
        availableDepartments={availableDepartments}
        companyTheme={companyTheme}
      />

      <GoalDeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        departmentToDelete={departmentToDelete}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarMessage?.severity || "info"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage?.text}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default DepartmentHiringGoalsPage;
