import { useState, useEffect, useCallback, useRef } from "react";
import { Job, PaginatedJobs, JobCategory, JobLocation } from "../types/job";
import JobService, { JobFilters } from "../services/jobService";
import { useDebounce } from "./useDebounce";

// Typed state interface with more descriptive naming
interface JobsState {
  jobs: Job[];
  categories: JobCategory[];
  locations: JobLocation[];
  loading: boolean;
  isFilterLoading: boolean; // Separate loading state for filter options
  isFetchingJobs: boolean; // Separate loading state for job fetching
  error: string | null;
  filterOptionsError: string | null; // Separate error for filter options
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

// Enhanced job filters interface that extends from service interface
interface JobsFiltersState extends JobFilters {
  search: string;
  category: string;
  location: string;
  page: number;
  limit: number;
}

/**
 * Custom hook for managing jobs data fetching and state
 * Follows clean code principles with separation of concerns
 */
export const useJobs = () => {
  // Initial state with descriptive defaults
  const [state, setState] = useState<JobsState>({
    jobs: [],
    categories: [],
    locations: [],
    loading: true,
    isFilterLoading: true,
    isFetchingJobs: true,
    error: null,
    filterOptionsError: null,
    meta: null,
  });

  // Initial filter state
  const [filters, setFilters] = useState<JobsFiltersState>({
    search: "",
    category: "",
    location: "",
    page: 1,
    limit: 10,
  });

  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(filters.search, 300);

  // Refs for tracking mount state and preventing unnecessary API calls
  const isMounted = useRef(false);
  const initialLoadDone = useRef(false);
  const isInitialFilterChange = useRef(true);
  const previousFilters = useRef<JobsFiltersState>(filters);

  /**
   * Check if filters have meaningfully changed
   */
  const haveFiltersChanged = useCallback(
    (
      prevFilters: JobsFiltersState,
      currentFilters: JobsFiltersState
    ): boolean => {
      return (
        prevFilters.search !== currentFilters.search ||
        prevFilters.category !== currentFilters.category ||
        prevFilters.location !== currentFilters.location ||
        prevFilters.page !== currentFilters.page ||
        prevFilters.limit !== currentFilters.limit
      );
    },
    []
  );

  /**
   * Fetch jobs based on current filters
   * Implements enhanced error handling and state management
   */
  const fetchJobs = useCallback(
    async (forceRefresh = false) => {
      // Don't fetch if filters haven't changed and not forcing refresh
      if (
        !forceRefresh &&
        !haveFiltersChanged(previousFilters.current, filters) &&
        initialLoadDone.current
      ) {
        return;
      }

      // Update loading state
      setState((prev) => ({
        ...prev,
        isFetchingJobs: true,
        loading: !initialLoadDone.current,
        error: null,
      }));

      try {
        console.log("Fetching jobs with filters:", JSON.stringify(filters));

        const response = await JobService.getJobs({
          search: filters.search,
          category: filters.category,
          location: filters.location,
          page: filters.page,
          limit: filters.limit,
        });

        console.log(
          `Received ${response.data.length} jobs out of ${response.meta.total}`
        );

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            jobs: response.data,
            meta: response.meta,
            isFetchingJobs: false,
            loading: false,
          }));
        }

        // Update previous filters ref to prevent unnecessary API calls
        previousFilters.current = { ...filters };
      } catch (error) {
        console.error("Error fetching jobs:", error);

        if (isMounted.current) {
          setState((prev) => ({
            ...prev,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch jobs. Please try again later.",
            isFetchingJobs: false,
            loading: false,
          }));
        }
      }
    },
    [filters, haveFiltersChanged]
  );

  /**
   * Fetch filter options (categories and locations)
   * Implements parallel fetching with proper error handling
   */
  const fetchFilterOptions = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isFilterLoading: true,
      filterOptionsError: null,
    }));

    try {
      // Parallel fetching for better performance
      const [categories, locations] = await Promise.all([
        JobService.getCategories(),
        JobService.getLocations(),
      ]);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          categories,
          locations,
          isFilterLoading: false,
        }));
      }

      return { categories, locations };
    } catch (error) {
      console.error("Failed to fetch filter options:", error);

      if (isMounted.current) {
        setState((prev) => ({
          ...prev,
          filterOptionsError:
            error instanceof Error
              ? error.message
              : "Failed to load filter options. Some filtering may be unavailable.",
          isFilterLoading: false,
        }));
      }

      return null;
    }
  }, []);

  /**
   * Update filters and trigger job fetch
   * Handles pagination reset when search criteria changes
   */
  const updateFilters = useCallback(
    (newFilters: Partial<JobsFiltersState>) => {
      // Reset to page 1 if search criteria changes (not when just changing page)
      const shouldResetPage =
        (newFilters.search !== undefined &&
          newFilters.search !== filters.search) ||
        (newFilters.category !== undefined &&
          newFilters.category !== filters.category) ||
        (newFilters.location !== undefined &&
          newFilters.location !== filters.location);

      console.log(
        "Updating filters:",
        JSON.stringify(newFilters),
        shouldResetPage ? "- Resetting to page 1" : ""
      );

      setFilters((prev) => ({
        ...prev,
        ...newFilters,
        page: shouldResetPage ? 1 : newFilters.page || prev.page,
      }));

      // Mark that we've handled a filter change
      isInitialFilterChange.current = false;
    },
    [filters]
  );

  /**
   * Clear all filters and reset to defaults
   */
  const clearFilters = useCallback(() => {
    console.log("Clearing all filters");

    setFilters({
      search: "",
      category: "",
      location: "",
      page: 1,
      limit: filters.limit, // Preserve the current limit setting
    });

    // Mark that we've handled a filter change
    isInitialFilterChange.current = false;
  }, [filters.limit]);

  /**
   * Explicit refetch function that forces a refresh
   */
  const refetch = useCallback(() => {
    console.log("Manually triggering job refetch");
    return fetchJobs(true);
  }, [fetchJobs]);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initial data loading - runs only once on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      console.log("Loading initial data...");

      try {
        // Sequential fetching to ensure categories are available for rendering
        await fetchFilterOptions();
        await fetchJobs();
        initialLoadDone.current = true;
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter changes - only runs when filters change AND not on initial render
  useEffect(() => {
    // Skip the initial effect trigger to avoid double fetching
    if (!initialLoadDone.current || isInitialFilterChange.current) {
      return;
    }

    // Don't trigger on initial render or when only search is updating (handled by debounced effect)
    const onlySearchChanged =
      previousFilters.current.category === filters.category &&
      previousFilters.current.location === filters.location &&
      previousFilters.current.page === filters.page &&
      previousFilters.current.limit === filters.limit &&
      previousFilters.current.search !== filters.search;

    if (!onlySearchChanged) {
      console.log("Filters changed, fetching jobs...");
      fetchJobs();
    }
  }, [fetchJobs, filters]);

  // Handle debounced search changes
  useEffect(() => {
    // Skip if initial loading or no previous search
    if (!initialLoadDone.current || isInitialFilterChange.current) {
      return;
    }

    // Only fetch if the search term has changed
    if (debouncedSearch !== previousFilters.current.search) {
      console.log("Search term changed, fetching jobs...");
      fetchJobs();
    }
  }, [debouncedSearch, fetchJobs]);

  // Return state and methods with consistent naming
  return {
    // State
    jobs: state.jobs,
    categories: state.categories,
    locations: state.locations,
    loading: state.loading,
    isFilterLoading: state.isFilterLoading,
    isFetchingJobs: state.isFetchingJobs,
    error: state.error,
    filterOptionsError: state.filterOptionsError,
    meta: state.meta,

    // Filters state
    filters,

    // Methods
    updateFilters,
    clearFilters,
    refetch,
  };
};

export default useJobs;
