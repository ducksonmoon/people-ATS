/**
 * Type definitions for the Recruiter module
 */

import { Application, Job, User } from '@prisma/client';

/**
 * Status count object for dashboard charts
 */
export interface StatusCount {
  name: string;
  value: number;
}

/**
 * Job performance data for dashboard charts
 */
export interface JobPerformance {
  name: string;
  applications: number;
  interviews: number;
}

/**
 * Recent activity item for dashboard timeline
 */
export interface RecentActivity {
  id: number;
  type: string;
  status: string;
  applicantName: string;
  jobTitle: string;
  timestamp: Date;
}

/**
 * Time to hire metrics for dashboard statistics
 */
export interface TimeToHireMetrics {
  averageDays: number;
  fastestDays: number;
  slowestDays: number;
}

/**
 * Dashboard data structure for the recruiter dashboard
 */
export interface RecruiterDashboardData {
  totalJobs: number;
  totalApplications: number;
  pendingReviews: number;
  interviewScheduled: number;
  offersSent: number;
  statusCounts: StatusCount[];
  jobPerformanceData: JobPerformance[];
  recentActivity: RecentActivity[];
  timeToHireMetrics: TimeToHireMetrics;
  recentApplications: any[];
  activeJobs: any[];
}

/**
 * Application with job and candidate details
 */
export type ApplicationWithDetails = Application & {
  job: Job;
  candidate: User;
};

/**
 * Application status enum
 */
export enum ApplicationStatus {
  PENDING = 'PENDING',
  INTERVIEWING = 'INTERVIEWING',
  OFFER_SENT = 'OFFER_SENT',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}
