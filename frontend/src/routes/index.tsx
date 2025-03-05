import React, { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import { checkIfAdminExists } from "../services/api";

// Lazy loaded pages
const HomePage = lazy(() => import("../pages/HomePage"));
const JobsPage = lazy(() => import("../pages/JobsPage"));
const JobDetailPage = lazy(() => import("../pages/JobDetailPage"));
const CreateJobPage = lazy(() => import("../pages/CreateJobPage"));
const CompanySettingsPage = lazy(() => import("../pages/CompanySettingsPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const RecruiterDashboardPage = lazy(
  () => import("../pages/RecruiterDashboardPage")
);
const HRDashboardPage = lazy(() => import("../pages/HRDashboardPage"));
const JobApplicationsPage = lazy(() => import("../pages/JobApplicationsPage"));
const SetupPage = lazy(() => import("../pages/SetupPage"));
const ApplicationManagementPage = lazy(
  () => import("../pages/ApplicationManagementPage")
);
const ExternalApplicationsPage = lazy(
  () => import("../pages/ExternalApplicationsPage")
);
const JobManagementPage = lazy(() => import("../pages/JobManagementPage"));
const ThemePreviewPage = lazy(() => import("../pages/ThemePreviewPage"));
const DepartmentHiringGoalsPage = lazy(
  () => import("../pages/DepartmentHiringGoalsPage")
);
const InterviewCalendarPage = lazy(
  () => import("../pages/InterviewCalendarPage")
);
const UserManagementPage = lazy(() => import("../pages/UserManagementPage"));

const AppRoutes = () => {
  const [isFirstSetup, setIsFirstSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminExistence = async () => {
      try {
        const result = await checkIfAdminExists();
        setIsFirstSetup(!result.adminExists);
      } catch (error) {
        console.error("Error checking admin existence:", error);
        // If there's an error, assume we need setup (safer default)
        setIsFirstSetup(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminExistence();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* First-time setup route - only accessible if no admin exists */}
          {isFirstSetup && <Route path="/setup" element={<SetupPage />} />}

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* Main application routes */}
          <Route path="/" element={<Layout />}>
            {/* Redirect to setup if needed */}
            {isFirstSetup && (
              <Route index element={<Navigate to="/setup" replace />} />
            )}

            {/* Regular routes */}
            {!isFirstSetup && <Route index element={<HomePage />} />}
            <Route path="jobs" element={<JobsPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />

            {/* Admin Portal - redirect to login */}
            <Route path="admin" element={<Navigate to="/login" replace />} />

            <Route
              path="create-job"
              element={
                <ProtectedRoute roles={["ADMIN", "RECRUITER"]}>
                  <CreateJobPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <CompanySettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/recruiter"
              element={
                <ProtectedRoute roles={["ADMIN", "RECRUITER"]}>
                  <RecruiterDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/hr"
              element={
                <ProtectedRoute roles={["ADMIN", "HR"]}>
                  <HRDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="jobs/:id/applications"
              element={
                <ProtectedRoute roles={["ADMIN", "RECRUITER"]}>
                  <JobApplicationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="applications/manage"
              element={
                <ProtectedRoute roles={["ADMIN", "RECRUITER", "HR"]}>
                  <ApplicationManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="applications/external"
              element={
                <ProtectedRoute roles={["ADMIN", "RECRUITER"]}>
                  <ExternalApplicationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="jobs/manage"
              element={
                <ProtectedRoute roles={["ADMIN", "HR"]}>
                  <JobManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="departments/hiring-goals"
              element={
                <ProtectedRoute roles={["ADMIN", "HR"]}>
                  <DepartmentHiringGoalsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="interviews/calendar"
              element={
                <ProtectedRoute roles={["ADMIN", "RECRUITER", "HR"]}>
                  <InterviewCalendarPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="users/manage"
              element={
                <ProtectedRoute roles={["ADMIN", "HR"]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="theme"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <ThemePreviewPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
