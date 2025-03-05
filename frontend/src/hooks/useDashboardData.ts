import { useState, useEffect, useCallback } from "react";
import { hrService } from "../services/hr.service";
import {
  Candidate,
  DashboardData,
  UseDashboardDataReturn,
  Department,
  HiringTrendData,
  RecruitmentFunnelData,
  JobRequisition,
} from "../types";

// Cache for dashboard data
interface DashboardCache {
  data: DashboardData | null;
  timestamp: number;
  expiresInMinutes: number;
}

// Default cache time of 5 minutes
const DEFAULT_CACHE_TIME_MINUTES = 5;
let dashboardCache: DashboardCache = {
  data: null,
  timestamp: 0,
  expiresInMinutes: DEFAULT_CACHE_TIME_MINUTES,
};

/**
 * Custom hook for fetching and managing HR dashboard data
 * @param forceRefresh Force refresh from API instead of using the cache
 * @param cacheTimeMinutes How long to cache data in minutes (default: 5 minutes)
 */
export const useDashboardData = (
  forceRefresh = false,
  cacheTimeMinutes = DEFAULT_CACHE_TIME_MINUTES
): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(dashboardCache.data);
  const [loading, setLoading] = useState<boolean>(!dashboardCache.data);
  const [error, setError] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState<
    JobRequisition[]
  >([]);

  // Check if cache is valid
  const isCacheValid = useCallback(() => {
    if (!dashboardCache.data) {
      console.log("[DEBUG] Cache is empty or invalid");
      return false;
    }

    const now = Date.now();
    const cacheAge = now - dashboardCache.timestamp;
    const cacheExpiryMs = dashboardCache.expiresInMinutes * 60 * 1000;
    const isValid = cacheAge < cacheExpiryMs;

    console.log("[DEBUG] Cache validity check:", {
      cacheAge: `${Math.round(cacheAge / 1000)}s`,
      expiryTime: `${Math.round(cacheExpiryMs / 1000)}s`,
      isValid,
    });

    return isValid;
  }, []);

  // Fetch dashboard data
  const fetchData = useCallback(
    async (skipCache = false) => {
      // Return cached data if valid and skipCache is false
      if (!skipCache && isCacheValid()) {
        console.log("[DEBUG] Using cached dashboard data");
        setData(dashboardCache.data);
        setLoading(false);
        return;
      }

      try {
        console.log("[DEBUG] Fetching fresh HR dashboard data...");
        setLoading(true);
        setError(null);
        
        // Pass skipCache parameter to the API
        const response = await hrService.getDashboardData(skipCache);

        // Validate response structure
        if (!response) {
          console.error("[DEBUG] Received empty response from server");
          throw new Error("Received empty response from server");
        }

        // More detailed debug logging
        console.log("[DEBUG] Raw dashboard API response:", response);

        // Check if the response has the expected shape
        const hasExpectedShape =
          Array.isArray(response.hiringTrendsData) &&
          Array.isArray(response.recruitmentFunnelData) &&
          Array.isArray(response.departmentHiringData) &&
          Array.isArray(response.activeCandidates) &&
          Array.isArray(response.jobRequisitions);

        if (!hasExpectedShape) {
          console.warn(
            "[DEBUG] Dashboard data response is missing expected properties:",
            {
              hasHiringTrends: Array.isArray(response.hiringTrendsData),
              hasRecruitmentFunnel: Array.isArray(
                response.recruitmentFunnelData
              ),
              hasDepartmentHiring: Array.isArray(response.departmentHiringData),
              hasActiveCandidates: Array.isArray(response.activeCandidates),
              hasJobRequisitions: Array.isArray(response.jobRequisitions),
              responseKeys: Object.keys(response),
            }
          );
        }

        // Debug logging to check response structure
        console.log("[DEBUG] Dashboard API response data structure:", {
          hiringTrendsLength: response.hiringTrendsData?.length || 0,
          recruitmentFunnelLength: response.recruitmentFunnelData?.length || 0,
          departmentHiringLength: response.departmentHiringData?.length || 0,
          activeCandidatesLength: response.activeCandidates?.length || 0,
          jobRequisitionsLength: response.jobRequisitions?.length || 0,
        });

        // Update cache and state
        dashboardCache = {
          data: response,
          timestamp: Date.now(),
          expiresInMinutes: cacheTimeMinutes,
        };

        setData(response);
        setFilteredCandidates(response.activeCandidates || []);
        setFilteredRequisitions(response.jobRequisitions || []);
        setLoading(false);
      } catch (err: any) {
        console.error("[DEBUG] Error fetching HR dashboard data:", err);

        // More specific error messages based on error type
        if (err.isNetworkError) {
          setError("Network error: Please check your internet connection");
        } else if (err.status === 401 || err.status === 403) {
          setError("Authentication error: You may need to log in again");
        } else if (err.status === 404) {
          setError("The dashboard data endpoint was not found on the server");
        } else if (err.status >= 500) {
          setError(
            "Server error: The server encountered an error. Please try again later"
          );
        } else {
          setError(
            err?.message ||
              "Failed to load dashboard data. Please try again later."
          );
        }

        // Even if there's an error, we're no longer loading
        setLoading(false);
      }
    },
    [cacheTimeMinutes, isCacheValid]
  );

  // Update filtered candidates when department filter changes
  useEffect(() => {
    const updateFilteredData = async () => {
      try {
        setLoading(true);

        if (departmentFilter === "all") {
          // If no department filter, use all candidates from the main data
          if (data?.activeCandidates) {
            setFilteredCandidates(data.activeCandidates);
          }

          // Also set all job requisitions
          if (data?.jobRequisitions) {
            setFilteredRequisitions(data.jobRequisitions);
          }
        } else {
          // Find the department ID that matches the department name
          const departmentObj = data?.departmentHiringData?.find(
            (dept) => dept.name === departmentFilter
          );

          if (departmentObj) {
            // Fetch filtered candidates and job requisitions from the backend
            const [candidates, requisitions] = await Promise.all([
              hrService.getActiveCandidates(Number(departmentObj.id)),
              hrService.getJobRequisitions(Number(departmentObj.id)),
            ]);

            setFilteredCandidates(candidates);
            setFilteredRequisitions(requisitions);
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error("[DEBUG] Error updating filtered data:", err);
        setError(
          err?.message || "Failed to update filtered data. Please try again."
        );
        setLoading(false);
      }
    };

    if (data) {
      updateFilteredData();
    }
  }, [departmentFilter, data]);

  // Initial data fetch
  useEffect(() => {
    console.log("[DEBUG] Initial data fetch, forceRefresh:", forceRefresh);
    fetchData(forceRefresh);
  }, [fetchData, forceRefresh]);

  // Refresh data function for manual retries
  const refreshData = () => {
    console.log("[DEBUG] Manual refresh triggered");
    fetchData(true); // Skip cache on manual refresh
  };

  return {
    data,
    loading,
    error,
    refreshData,
    departmentFilter,
    setDepartmentFilter,
    filteredCandidates,
    filteredRequisitions,
  };
};

// Also add a default export
export default useDashboardData;
