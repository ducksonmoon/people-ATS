// Global type definitions for the application

declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";

// Global namespace for our application types
declare namespace PeopleATS {
  // Dashboard Data Types
  interface Candidate {
    id: number | string;
    name: string;
    avatarUrl?: string;
    role: string;
    department: string;
    status: string;
    progress: number;
    nextInterview?: string | Date;
  }

  interface JobRequisition {
    id: number | string;
    title: string;
    department: string;
    openPositions: number;
    applicationsCount: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    createdAt: string | Date;
  }

  interface UseDashboardDataResult {
    data: any;
    loading: boolean;
    error: string | null;
    refreshData: () => void;
    departmentFilter: string;
    setDepartmentFilter: (filter: string) => void;
    filteredCandidates: Candidate[];
    jobRequisitions: JobRequisition[];
  }

  interface DashboardData {
    hiringTrendsData: any[];
    recruitmentFunnelData: any[];
    departmentHiringData: any[];
    activeCandidates: Candidate[];
    jobRequisitions: JobRequisition[];
  }

  // HR Service
  interface HRService {
    getDashboardData(): Promise<DashboardData>;
  }
}
