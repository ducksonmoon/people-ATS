import React from 'react';
import { Navigate } from 'react-router-dom';

// Pages
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import JobsPage from '../pages/JobsPage';
import JobDetailPage from '../pages/JobDetailPage';
import JobManagementPage from '../pages/JobManagementPage';
import CreateJobPage from '../pages/CreateJobPage';
import RecruiterDashboardPage from '../pages/RecruiterDashboardPage';
import HRDashboardPage from '../pages/HRDashboardPage';
import ApplicationManagementPage from '../pages/ApplicationManagementPage';
import JobApplicationsPage from '../pages/JobApplicationsPage';
import CompanySettingsPage from '../pages/CompanySettingsPage';
import DepartmentHiringGoalsPage from '../pages/DepartmentHiringGoalsPage';
import ThemePreviewPage from '../pages/ThemePreviewPage';
import SetupPage from '../pages/SetupPage';
import AdminLoginPage from '../pages/AdminLoginPage';
import InterviewCalendarPage from '../pages/InterviewCalendarPage';

const appRoutes = [
  {
    path: '/',
    element: <HomePage />,
    allowedRoles: ['ALL'],
  },
  {
    path: '/login',
    element: <LoginPage />,
    allowedRoles: ['ALL'],
  },
  {
    path: '/signup',
    element: <SignupPage />,
    allowedRoles: ['ALL'],
  },
  {
    path: '/jobs',
    element: <JobsPage />,
    allowedRoles: ['ALL'],
  },
  {
    path: '/jobs/:id',
    element: <JobDetailPage />,
    allowedRoles: ['ALL'],
  },
  {
    path: '/dashboard/recruiter',
    element: <RecruiterDashboardPage />,
    allowedRoles: ['RECRUITER', 'ADMIN'],
  },
  {
    path: '/dashboard/hr',
    element: <HRDashboardPage />,
    allowedRoles: ['HR', 'ADMIN'],
  },
  {
    path: '/jobs/manage',
    element: <JobManagementPage />,
    allowedRoles: ['HR', 'RECRUITER', 'ADMIN'],
  },
  {
    path: '/jobs/create',
    element: <CreateJobPage />,
    allowedRoles: ['HR', 'RECRUITER', 'ADMIN'],
  },
  {
    path: '/applications/manage',
    element: <ApplicationManagementPage />,
    allowedRoles: ['HR', 'RECRUITER', 'ADMIN'],
  },
  {
    path: '/jobs/:id/applications',
    element: <JobApplicationsPage />,
    allowedRoles: ['HR', 'RECRUITER', 'ADMIN'],
  },
  {
    path: '/settings',
    element: <CompanySettingsPage />,
    allowedRoles: ['HR', 'ADMIN'],
  },
  {
    path: '/departments/hiring-goals',
    element: <DepartmentHiringGoalsPage />,
    allowedRoles: ['HR', 'ADMIN'],
  },
  {
    path: '/theme',
    element: <ThemePreviewPage />,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/setup',
    element: <SetupPage />,
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin',
    element: <AdminLoginPage />,
    allowedRoles: ['ALL'],
  },
  {
    path: '/interviews/calendar',
    element: <InterviewCalendarPage />,
    allowedRoles: ['HR', 'RECRUITER', 'ADMIN'],
  },
  {
    path: '*',
    element: <Navigate to="/" />,
    allowedRoles: ['ALL'],
  },
];

export default appRoutes; 