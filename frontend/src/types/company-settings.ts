/**
 * Interface representing company-wide settings
 */
export interface CompanySettings {
  id: number;
  name: string;
  description: string | null;
  logo?: string;
  growthRate: number;
  createdAt: Date;
  updatedAt: Date;

  // Additional properties used in the application
  primaryColor?: string;
  companyName?: string;
  logoUrl?: string;
  showNameInNav?: boolean;
  website?: string;
  industry?: string;
  contactEmail?: string;
}

/**
 * Interface for growth plans specific to departments
 */
export interface DepartmentGrowthPlan {
  id: number;
  departmentId: number;
  departmentName?: string;
  targetHeadcount: number;
  plannedHiringPeriod?: string;
  notes?: string;
  year: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettingsState {
  settings: CompanySettings | null;
  loading: boolean;
  error: string | null;
}
