import API from "./api";
import { PaginatedJobs, Job, JobCategory, JobLocation } from "../types/job";
import API_ENDPOINTS from "../constants/api";

// Job filter parameters
export interface JobFilters {
  search?: string;
  category?: string | number;
  location?: string | number;
  page?: number;
  limit?: number;
  // Add any other filter parameters
  departmentId?: number;
  employmentType?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
  remote?: boolean;
  postedAfter?: string;
}

// Job application data interface
export interface JobApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  // Other application fields
}

/**
 * Service for handling all job-related API calls
 */
class JobService {
  /**
   * Clean job filter parameters
   * @private
   */
  private cleanFilterParams(params: JobFilters): Record<string, any> {
    // Filter out undefined, null, empty string values
    return Object.entries(params)
      .filter(([_, value]) => {
        return value !== undefined && value !== null && value !== "";
      })
      .reduce((acc, [key, value]) => {
        // Convert numeric fields
        if (["page", "limit", "minSalary", "maxSalary"].includes(key)) {
          acc[key] = Number(value);
        }
        // Handle boolean fields
        else if (key === "remote" && typeof value === "string") {
          acc[key] = value === "true";
        }
        // Clean string fields
        else if (typeof value === "string") {
          acc[key] = value.trim();
        }
        // Pass other values through
        else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
  }

  /**
   * Fetch jobs with optional filters
   */
  async getJobs(params: JobFilters = {}): Promise<PaginatedJobs> {
    try {
      const cleanParams = this.cleanFilterParams(params);
      console.log("Sending job request with clean params:", cleanParams);

      return await API.get<PaginatedJobs>(API_ENDPOINTS.JOBS.BASE, {
        params: cleanParams,
      });
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      // Re-throw with additional context
      throw new Error(`Failed to fetch jobs: ${(error as Error).message}`);
    }
  }

  /**
   * Get job details by ID
   */
  async getJobById(id: number): Promise<Job> {
    try {
      return await API.get<Job>(API_ENDPOINTS.JOBS.DETAILS(id));
    } catch (error) {
      console.error(`Failed to fetch job with ID ${id}:`, error);
      throw new Error(
        `Failed to fetch job details: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get all job categories
   */
  async getCategories(): Promise<JobCategory[]> {
    try {
      return await API.get<JobCategory[]>(API_ENDPOINTS.JOBS.CATEGORIES);
    } catch (error) {
      console.error("Failed to fetch job categories:", error);
      throw new Error(
        `Failed to fetch categories: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get all job locations
   */
  async getLocations(): Promise<JobLocation[]> {
    try {
      return await API.get<JobLocation[]>(API_ENDPOINTS.JOBS.LOCATIONS);
    } catch (error) {
      console.error("Failed to fetch job locations:", error);
      throw new Error(`Failed to fetch locations: ${(error as Error).message}`);
    }
  }

  /**
   * Apply for a job
   */
  async applyForJob(jobId: number, applicationData: FormData): Promise<any> {
    try {
      return await API.post(API_ENDPOINTS.JOBS.APPLY(jobId), applicationData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      console.error(`Failed to apply for job ${jobId}:`, error);
      throw new Error(
        `Failed to submit application: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get recommended jobs based on user profile or preferences
   */
  async getRecommendedJobs(limit: number = 5): Promise<Job[]> {
    try {
      return await API.get<Job[]>(API_ENDPOINTS.JOBS.RECOMMENDED, {
        params: { limit },
      });
    } catch (error) {
      console.error("Failed to fetch recommended jobs:", error);
      throw new Error(
        `Failed to fetch recommendations: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get featured or highlighted jobs
   */
  async getFeaturedJobs(limit: number = 5): Promise<Job[]> {
    try {
      return await API.get<Job[]>(API_ENDPOINTS.JOBS.FEATURED, {
        params: { limit },
      });
    } catch (error) {
      console.error("Failed to fetch featured jobs:", error);
      throw new Error(
        `Failed to fetch featured jobs: ${(error as Error).message}`
      );
    }
  }

  /**
   * Save a job to user's favorites/bookmarks
   */
  async saveJob(jobId: number): Promise<void> {
    try {
      await API.post(API_ENDPOINTS.JOBS.SAVE(jobId));
    } catch (error) {
      console.error(`Failed to save job ${jobId}:`, error);
      throw new Error(`Failed to save job: ${(error as Error).message}`);
    }
  }

  /**
   * Remove a job from user's favorites/bookmarks
   */
  async unsaveJob(jobId: number): Promise<void> {
    try {
      await API.delete(API_ENDPOINTS.JOBS.SAVE(jobId));
    } catch (error) {
      console.error(`Failed to unsave job ${jobId}:`, error);
      throw new Error(
        `Failed to remove saved job: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get user's saved/bookmarked jobs
   */
  async getSavedJobs(): Promise<Job[]> {
    try {
      return await API.get<Job[]>(API_ENDPOINTS.JOBS.SAVED);
    } catch (error) {
      console.error("Failed to fetch saved jobs:", error);
      throw new Error(
        `Failed to fetch saved jobs: ${(error as Error).message}`
      );
    }
  }
}

// Export a singleton instance
export default new JobService();
