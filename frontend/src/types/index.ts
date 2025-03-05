// Type exports

// Redux store types
export type { RootState } from "../redux/store";

// HR and Company data types
export interface Company {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
  departments: string[];
}

export interface Candidate {
  id: number | string;
  name: string;
  avatarUrl?: string;
  role: string;
  department: string;
  status: string;
  progress: number;
  nextInterview?: string | Date;
}

export interface Job {
  id: number | string;
  title: string;
  department: string;
  location?: string;
  type?: string;
  status?: string;
  applicantCount?: number;
  postedDate?: string | Date;
  openPositions?: number;
  applicationsCount?: number;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  createdAt?: string | Date;
}

// Specialized job type for requisitions that requires specific fields
export interface JobRequisition extends Job {
  openPositions: number;
  applicationsCount: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string | Date;
}

export interface Interview {
  id: number | string;
  candidateName: string;
  candidateAvatar?: string;
  position: string;
  date: string | Date;
  time: string;
  interviewers: string[];
}

export interface Department {
  name: string;
  current: number;
  target: number;
  hired: number;
}

export interface HiringTrendData {
  name: string;
  applications: number;
  interviews: number;
  offers: number;
  hires: number;
}

export interface RecruitmentFunnelData {
  name: string;
  value: number;
  color: string;
}

export interface DashboardData {
  hiringTrendsData: HiringTrendData[];
  recruitmentFunnelData: RecruitmentFunnelData[];
  departmentHiringData: Department[];
  activeCandidates: Candidate[];
  activeJobs?: Job[];
  jobRequisitions: JobRequisition[];
  upcomingInterviews?: Interview[];
  departmentHiring?: Record<string, number>;
  stageDistribution?: Record<string, number>;
  recentApplications?: Candidate[];
  departmentMetrics: DepartmentMetric[];
  timeToHireMetrics: TimeToHireMetric;
}

export interface DepartmentMetric {
  id: number;
  name: string;
  employeeCount: number;
  openPositions: number;
  turnoverRate: number;
  avgTimeToHire: number;
}

export interface TimeToHireMetric {
  avgDaysToHire: number;
  fastestHire: number;
  slowestHire: number;
}

// Theme types
export interface ThemeMode {
  mode: "light" | "dark";
}

/**
 * Return type for the useCompanyTheme hook
 * Contains company colors, theme utilities, and UI mode information
 */
export interface UseCompanyThemeReturn {
  // Main brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  contrastText: string;

  // Background colors with opacity variants
  primaryBackground: string;
  primaryBackgroundHover: string;
  primaryBackgroundActive: string;

  // Gradient for buttons and highlights
  primaryGradient: string;

  // MUI theme object for advanced customization
  theme: import("@mui/material/styles").Theme;

  // Dark mode indicator
  isDarkMode: boolean;
}

export interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  departmentFilter: string;
  setDepartmentFilter: (filter: string) => void;
  filteredCandidates: Candidate[];
  filteredRequisitions: JobRequisition[];
}
