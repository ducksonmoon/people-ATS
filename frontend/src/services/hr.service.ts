import api from "./api";
import { ChangeState } from "../types/state-tracking";

// Import all needed types from the types file
import {
  DashboardData,
  Interview,
  JobRequisition,
  Candidate,
  Department,
} from "../types";

// Define missing types that aren't exported from the types file
interface DepartmentMetrics {
  id: number;
  name: string;
  currentHeadcount: number;
  targetHeadcount: number;
  openRequisitions: number;
  activeRecruitment: number;
}

interface HiringGoal {
  departmentId: number;
  departmentName: string;
  targetHeadcount: number;
  startDate: string | Date;
  endDate: string | Date;
  priority: string;
  status: string;
  notes?: string;
  budget?: number;
  assignedRecruiterIds?: number[];
}

// Add interface for GraphQL response types
interface GraphQLResponse<T> {
  data: {
    data: T;
    errors?: Array<{
      message: string;
      locations: Array<{
        line: number;
        column: number;
      }>;
      path: string[];
    }>;
  };
}

/**
 * HR Service - Handles all HR related API calls
 */
const hrService = {
  /**
   * Get dashboard data for HR view
   * @param forceRefresh Whether to force refresh data from backend
   */
  getDashboardData: async (forceRefresh = false): Promise<DashboardData> => {
    try {
      console.log(
        `[DEBUG] HR Service: Sending GraphQL request for dashboard data (forceRefresh: ${forceRefresh})`
      );

      // Using GraphQL to fetch dashboard data
      const query = `
        query HRDashboardData($skipCache: Boolean) {
          hrDashboardData(skipCache: $skipCache) {
            hiringTrendsData {
              name
              applications
              interviews
              offers
              hires
            }
            recruitmentFunnelData {
              name
              value
              color
            }
            departmentHiringData {
              name
              current
              target
              hired
            }
            activeCandidates {
              id
              name
              role
              department
              status
              progress
              nextInterview
              recruiters
            }
            jobRequisitions {
              id
              title
              department
              openPositions
              applicationsCount
              status
              priority
              createdAt
            }
            departmentMetrics {
              id
              name
              employeeCount
              openPositions
              turnoverRate
              avgTimeToHire
            }
            timeToHireMetrics {
              avgDaysToHire
              fastestHire
              slowestHire
            }
          }
        }
      `;

      // Type the response with our interface and send forceRefresh as skipCache variable
      const response = await api.post<
        GraphQLResponse<{ hrDashboardData: DashboardData }>
      >("/graphql", {
        query,
        variables: { skipCache: forceRefresh },
      });

      // Extract data from GraphQL response
      if (response.data?.data?.hrDashboardData) {
        return response.data.data.hrDashboardData;
      }

      throw new Error("Invalid GraphQL response format");
    } catch (error) {
      console.error("[DEBUG] Error fetching HR dashboard data:", error);
      throw error;
    }
  },

  /**
   * Get dashboard data for Recruiter view
   * @param forceRefresh Whether to force refresh data from backend
   */
  getRecruiterDashboardData: async (forceRefresh = false) => {
    try {
      console.log(
        `[DEBUG] HR Service: Fetching recruiter dashboard data (forceRefresh: ${forceRefresh})`
      );

      // In future, update this to use GraphQL with skipCache parameter
      // For now, we always fetch fresh data from the backend REST API
      const response = await api.get<{ data: any }>("/recruiter/hr-dashboard");

      console.log("[DEBUG] Recruiter dashboard data retrieved");
      return response.data;
    } catch (error) {
      console.error("Error fetching recruiter dashboard data:", error);
      throw error;
    }
  },

  /**
   * Create a new job requisition
   */
  createJobRequisition: async (data: any) => {
    try {
      console.log("Creating job requisition:", data);
      const response = await api.post<{ data: any }>("/hr/jobs", data);
      console.log("Job requisition created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating job requisition:", error);
      throw error;
    }
  },

  /**
   * Update an existing job requisition
   */
  updateJobRequisition: async (id: number, data: Partial<JobRequisition>) => {
    try {
      console.log(`Updating job requisition ${id}:`, data);
      const response = await api.put<{ data: JobRequisition }>(
        `/hr/jobs/${id}`,
        data
      );
      console.log("Job requisition updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating job requisition ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a job requisition
   */
  deleteJobRequisition: async (id: number) => {
    try {
      console.log(`Deleting job requisition ${id}`);
      const response = await api.delete<{ data: any }>(`/hr/jobs/${id}`);
      console.log("Job requisition deleted:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting job requisition ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get a job requisition by ID
   */
  getJobRequisition: async (id: number) => {
    try {
      console.log(`Fetching job requisition ${id}`);
      const response = await api.get<{ data: JobRequisition }>(
        `/hr/jobs/${id}`
      );
      console.log("Job requisition retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job requisition ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all job requisitions
   */
  getAllJobRequisitions: async () => {
    try {
      console.log("Fetching all job requisitions");
      const response = await api.get<{ data: JobRequisition[] }>("/hr/jobs");
      console.log("Job requisitions retrieved:", response.data.length, "jobs");
      return response.data;
    } catch (error) {
      console.error("Error fetching job requisitions:", error);
      throw error;
    }
  },

  /**
   * Get department metrics
   */
  getDepartmentMetrics: async (): Promise<DepartmentMetrics[]> => {
    try {
      console.log("Fetching department metrics...");
      const response = await api.get<{ data: DepartmentMetrics[] }>(
        "/hr/departments/metrics"
      );
      console.log(
        "Department metrics retrieved:",
        response.data.length,
        "departments"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching department metrics:", error);
      throw error;
    }
  },

  /**
   * Get hiring goals for all departments
   */
  getHiringGoals: async (): Promise<HiringGoal[]> => {
    try {
      console.log("Fetching hiring goals...");
      const response = await api.get<{ data: HiringGoal[] }>(
        "/hr/hiring-goals"
      );
      console.log("Hiring goals retrieved:", response.data.length, "goals");
      return response.data;
    } catch (error) {
      console.error("Error fetching hiring goals:", error);
      throw error;
    }
  },

  /**
   * Update hiring goals
   */
  updateHiringGoals: async (data: any[]) => {
    try {
      if (!Array.isArray(data)) {
        console.error("Invalid data format, expected array:", data);
        return {
          success: false,
          message: "Invalid data format, expected array",
        };
      }

      if (data.length === 0) {
        console.warn("No hiring goal changes to update");
        return { success: true, message: "No changes to apply" };
      }

      console.log("Processing hiring goals update:", data);

      const processedData = data.map((item) => {
        // For deleted items, just send the ID and deleted flag
        if (item.changeState === ChangeState.DELETED) {
          return {
            departmentId: item.departmentId,
            deleted: true,
          };
        }

        // Format dates properly
        const startDate =
          item.startDate instanceof Date
            ? item.startDate.toISOString()
            : new Date(item.startDate).toISOString();

        const endDate =
          item.endDate instanceof Date
            ? item.endDate.toISOString()
            : new Date(item.endDate).toISOString();

        // For inserts and updates, send the full data
        return {
          departmentId: item.departmentId,
          targetHeadcount: item.targetHeadcount,
          startDate,
          endDate,
          priority: item.priority || "medium",
          status: item.status || "not_started",
          notes: item.notes || "",
          budget: item.budget || 0,
          assignedRecruiterIds: item.assignedRecruiterIds || [],
          // The backend can use this to handle different operations
          changeState: item.changeState,
        };
      });

      console.log("Sending to API:", processedData);
      const response = await api.put<{ data: any }>(
        "/hr/hiring-goals",
        processedData
      );
      console.log("Update response:", response.data);

      return {
        success: true,
        message: "Hiring goals updated successfully",
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating hiring goals:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to update hiring goals",
      };
    }
  },

  /**
   * Get hiring statistics
   */
  getHiringStatistics: async (period: string = "year") => {
    try {
      console.log(`Fetching hiring statistics for period ${period}...`);
      const response = await api.get<{ data: any }>(
        `/hr/hiring-statistics?period=${period}`
      );
      console.log("Hiring statistics retrieved");
      return response.data;
    } catch (error) {
      console.error(`Error fetching hiring statistics:`, error);
      // Return empty array to prevent UI errors
      return [];
    }
  },

  // Add other methods from hrService.ts
  getAllApplications: async () => {
    try {
      console.log("Fetching all applications...");
      const response = await api.get<{ data: Candidate[] }>("/hr/applications");
      console.log(
        "Applications data retrieved:",
        response.data.length,
        "records"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  },

  getApplicationById: async (id: number) => {
    try {
      console.log(`Fetching application details for ID: ${id}`);
      const response = await api.get<{ data: Candidate }>(
        `/hr/applications/${id}`
      );
      console.log("Application details retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching application with ID ${id}:`, error);
      throw error;
    }
  },

  updateApplicationStatus: async (id: number, status: string) => {
    try {
      console.log(`Updating application ${id} status to: ${status}`);
      const response = await api.put<{ data: any }>(
        `/hr/applications/${id}/status`,
        {
          status,
        }
      );
      console.log("Status update response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating status for application ${id}:`, error);
      throw error;
    }
  },

  addApplicationComment: async (id: number, comment: string) => {
    try {
      console.log(
        `Adding comment to application ${id}: "${comment.substring(0, 30)}..."`
      );
      const response = await api.post<{ data: any }>(
        `/hr/applications/${id}/comments`,
        {
          comment,
        }
      );
      console.log("Comment added:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to application ${id}:`, error);
      throw error;
    }
  },

  scheduleInterview: async (applicationId: number, data: any) => {
    try {
      console.log(
        `Scheduling interview for application ${applicationId}:`,
        data
      );
      const response = await api.post<{ data: any }>(
        `/hr/applications/${applicationId}/interviews`,
        data
      );
      console.log("Interview scheduled:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        `Error scheduling interview for application ${applicationId}:`,
        error
      );
      throw error;
    }
  },

  getAllInterviews: async () => {
    try {
      console.log("Calling HR interviews API endpoint");
      const response = await api.get<{ data: Interview[] }>("/hr/interviews");
      console.log("HR interviews API response:", response);
      return response.data;
    } catch (error) {
      console.error("Error in getAllInterviews:", error);
      throw error;
    }
  },

  getInterviewers: async () => {
    try {
      console.log("Fetching interviewers");
      // Use the dedicated endpoint for interviewers
      const response = await api.get<{ data: any[] }>("/users/interviewers");
      console.log("Interviewers retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching interviewers:", error);
      throw error;
    }
  },

  /**
   * Get historical hiring goals
   */
  getHistoricalHiringGoals: async () => {
    try {
      console.log("Fetching historical hiring goals...");
      const response = await api.get<{ data: HiringGoal[] }>(
        "/hr/historical-hiring-goals"
      );
      console.log("Historical hiring goals retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching historical hiring goals:", error);
      throw error;
    }
  },

  /**
   * Get recruiters
   */
  getRecruiters: async () => {
    try {
      console.log("Fetching recruiters");
      // Use the dedicated endpoint for recruiters
      const response = await api.get<{ data: any[] }>("/users/recruiters");
      console.log("Recruiters retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching recruiters:", error);
      throw error;
    }
  },

  /**
   * Archive expired hiring goals
   */
  archiveExpiredHiringGoals: async () => {
    try {
      console.log("Archiving expired hiring goals...");
      const response = await api.post<{
        data: {
          success: boolean;
          count: number;
          message: string;
        };
      }>("/hr/archive-hiring-goals");
      console.log("Archive result:", response.data);

      // Handle the new response format correctly
      return {
        success: response.data.success,
        archived: response.data.count,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Error archiving hiring goals:", error);
      return {
        success: false,
        archived: 0,
        message:
          error.response?.data?.message ||
          "Failed to archive expired hiring goals",
      };
    }
  },

  /**
   * Update interview
   */
  updateInterview: async (interviewId: number, data: any) => {
    try {
      console.log(`Updating interview ${interviewId}:`, data);
      const response = await api.patch<{ data: any }>(
        `/hr/interviews/${interviewId}`,
        data
      );
      console.log("Interview updated:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating interview ${interviewId}:`, error);
      throw error;
    }
  },

  /**
   * Cancel interview
   */
  cancelInterview: async (interviewId: number) => {
    try {
      console.log(`Cancelling interview ${interviewId}`);
      const response = await api.patch<{ data: any }>(
        `/hr/interviews/${interviewId}`,
        {
          status: "CANCELLED",
        }
      );
      console.log("Interview cancelled:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling interview ${interviewId}:`, error);
      throw error;
    }
  },

  /**
   * Get department growth plans
   */
  getDepartmentGrowthPlans: async () => {
    try {
      console.log("Fetching department growth plans...");
      const response = await api.get<{ data: any }>(
        "/hr/department-growth-plans"
      );
      console.log("Department growth plans retrieved:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching department growth plans:", error);
      throw error;
    }
  },

  /**
   * Get filtered active candidates
   * @param departmentId Optional department ID to filter by
   */
  getActiveCandidates: async (departmentId?: number): Promise<Candidate[]> => {
    try {
      const query = `
        query GetActiveCandidates($departmentId: Int) {
          activeCandidates(departmentId: $departmentId) {
            id
            name
            role
            department
            status
            progress
            nextInterview
            recruiters
          }
        }
      `;

      const variables = departmentId ? { departmentId } : {};

      // Type the response with our interface
      const response = await api.post<
        GraphQLResponse<{ activeCandidates: Candidate[] }>
      >("/graphql", { query, variables });

      if (response.data?.data?.activeCandidates) {
        return response.data.data.activeCandidates;
      }

      throw new Error("Invalid GraphQL response format");
    } catch (error) {
      console.error("[DEBUG] Error fetching active candidates:", error);
      throw error;
    }
  },

  /**
   * Get filtered job requisitions
   * @param departmentId Optional department ID to filter by
   */
  getJobRequisitions: async (
    departmentId?: number
  ): Promise<JobRequisition[]> => {
    try {
      const query = `
        query GetJobRequisitions($departmentId: Int) {
          jobRequisitions(departmentId: $departmentId) {
            id
            title
            department
            openPositions
            applicationsCount
            status
            priority
            createdAt
          }
        }
      `;

      const variables = departmentId ? { departmentId } : {};

      // Type the response with our interface
      const response = await api.post<
        GraphQLResponse<{ jobRequisitions: JobRequisition[] }>
      >("/graphql", { query, variables });

      if (response.data?.data?.jobRequisitions) {
        return response.data.data.jobRequisitions;
      }

      throw new Error("Invalid GraphQL response format");
    } catch (error) {
      console.error("[DEBUG] Error fetching job requisitions:", error);
      throw error;
    }
  },
};

// Export the service as a named export
export { hrService };

// This ensures both import styles work:
// import { hrService } from "../services/hr.service";
// import { hrService } from "../services/hrService";
