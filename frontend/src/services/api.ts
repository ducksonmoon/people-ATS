import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import API_ENDPOINTS from "../constants/api";
import { logout } from "../redux/authSlice";

// Types for API responses
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

// Define the error response structure from our backend
export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  errorCode?: string;
  details?: any;
}

/**
 * Admin registration interfaces
 */
export interface AdminRegistrationData {
  admin: {
    name: string;
    email: string;
    password: string;
    role: string;
  };
  company: {
    name: string;
    website?: string;
  };
}

/**
 * Register an admin with company during initial setup
 * @param data Admin and company registration data
 * @returns Authentication response with token and user data
 */
export async function registerAdmin(
  data: AdminRegistrationData
): Promise<LoginResponse> {
  try {
    // Validate input data
    if (
      !data.admin?.name ||
      !data.admin?.email ||
      !data.admin?.password ||
      !data.company?.name
    ) {
      throw new Error("Missing required fields for admin registration");
    }

    // Ensure email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.admin.email)) {
      throw new Error("Invalid email format");
    }

    // Ensure password meets minimum requirements
    if (data.admin.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || "/api"}${
        API_ENDPOINTS.AUTH.REGISTER_ADMIN
      }`,
      data,
      {
        timeout: 15000, // 15 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Admin registration failed:", error);

    // Provide more specific error messages based on error response
    if (error.response) {
      // Add specific error handling for the case where company settings already exist
      if (
        error.response.data?.message?.includes("Company settings already exist")
      ) {
        console.log(
          "Company settings already exist, but we're allowing the registration to proceed"
        );
        // This error is now handled in the backend by not blocking registration
      }

      const errorMessage =
        error.response.data?.message ||
        "Registration failed. Please try again.";

      throw new Error(errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "No response from server. Please check your connection and try again."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      throw error;
    }
  }
}

/**
 * Check if an admin user exists in the system
 * Used for first-time setup detection
 */
export async function checkIfAdminExists(): Promise<{ adminExists: boolean }> {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL || "/api"}${
        API_ENDPOINTS.AUTH.CHECK_ADMIN_EXISTS
      }`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking if admin exists:", error);
    // Default to false if there's an error
    return { adminExists: false };
  }
}

/**
 * Enhanced Error interface for consistent API error handling
 */
export interface EnhancedError extends Error {
  status?: number;
  data?: any;
  isNetworkError?: boolean;
  code?: string;
}

// Fix for circular dependency without require()
let storeInstance: any = null;

// Function to get store lazily to break circular dependency
function getStore() {
  if (!storeInstance) {
    // Use a dynamic import approach that works in the browser
    try {
      // This works because by the time this function is called,
      // the module system has already resolved the circular dependency
      storeInstance = window.__REDUX_STORE__;
      if (!storeInstance) {
        console.warn("Redux store not found on window object");
        return {
          getState: () => ({ auth: { accessToken: null } }),
          dispatch: () => {},
        };
      }
    } catch (error) {
      console.error("Error accessing store:", error);
      return {
        getState: () => ({ auth: { accessToken: null } }),
        dispatch: () => {},
      };
    }
  }
  return storeInstance;
}

/**
 * API Service for handling HTTP requests
 */
export class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Set up request interceptors
    this.api.interceptors.request.use(
      this.handleRequestSuccess.bind(this),
      this.handleRequestError.bind(this)
    );

    // Set up response interceptors
    this.api.interceptors.response.use(
      this.handleResponseSuccess.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /**
   * Set authentication token for requests
   * This method is kept for backward compatibility
   */
  public setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem("access_token", token);
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("access_token");
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Process successful request config
   */
  private handleRequestSuccess(config: AxiosRequestConfig): AxiosRequestConfig {
    // Try to get the auth token directly from localStorage as a fallback
    let token = null;

    try {
      // First try to get it from the store if available
      const state = getStore().getState();
      token = state.auth?.accessToken;
    } catch (err) {
      // If that fails, get it from localStorage
      token = localStorage.getItem("access_token");
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    this.logRequest(config);
    return config;
  }

  /**
   * Process request error
   */
  private handleRequestError(error: any): Promise<any> {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }

  /**
   * Process successful response
   */
  private handleResponseSuccess(response: AxiosResponse): any {
    this.logResponse(response);
    return response.data;
  }

  /**
   * Log details of API request
   */
  private logRequest(config: AxiosRequestConfig): void {
    const method = config.method?.toUpperCase() || "GET";
    const url = `${config.baseURL}${config.url}`;
    const params = config.params
      ? `with params: ${JSON.stringify(config.params)}`
      : "";
    const data = config.data ? `with data: ${JSON.stringify(config.data)}` : "";

    if (process.env.NODE_ENV !== "production") {
      console.log(`🚀 API Request: ${method} ${url} ${params} ${data}`);
    }
  }

  /**
   * Log details of API response
   */
  private logResponse(response: AxiosResponse): void {
    const method = response.config.method?.toUpperCase() || "GET";
    const url = response.config.url || "";
    const status = response.status;

    let dataLength = "N/A";
    if (Array.isArray(response.data)) {
      dataLength = `${response.data.length}`;
    } else if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      const dataArray = response.data.data;
      if (Array.isArray(dataArray)) {
        dataLength = `${dataArray.length}`;
      }
    }

    console.log(
      `✅ API Response: ${status} ${method} ${url}`,
      `Data length: ${dataLength}`
    );
  }

  /**
   * Process response error with improved error handling
   */
  private handleResponseError(error: AxiosError): Promise<EnhancedError> {
    // Extract error details with better type safety
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase() || "";
    const url = error.config?.url || "";
    const responseData = error.response?.data as ErrorResponse | undefined;

    // Log detailed error information
    console.error(`🔴 API Error: ${status} ${method} ${url}`, {
      status,
      data: responseData,
      message: responseData?.message || error.message,
    });

    // Check if this is a token expiration error and try to refresh
    if (
      status === 401 &&
      responseData?.message !== "Invalid email or password" &&
      // Don't try to refresh if we're already trying to refresh
      !url.includes(API_ENDPOINTS.AUTH.REFRESH_TOKEN)
    ) {
      return this.handleTokenRefresh(error);
    }

    // Create a user-friendly error object
    const errorMessage =
      typeof responseData?.message === "string"
        ? responseData.message
        : Array.isArray(responseData?.message)
        ? responseData.message.join(". ")
        : error.message || "Unknown error occurred";

    // Create a user-friendly error object
    const enhancedError = new Error(errorMessage) as EnhancedError;
    enhancedError.status = status;
    enhancedError.data = responseData || null;
    enhancedError.isNetworkError = !error.response;
    enhancedError.code = responseData?.errorCode || error.code;

    return Promise.reject(enhancedError);
  }

  /**
   * Handle token refresh when receiving 401 errors
   */
  private async handleTokenRefresh(error: AxiosError): Promise<any> {
    try {
      // Get the refresh token from localStorage
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // No refresh token available, proceed to logout
        this.handleLogout();
        return Promise.reject(new Error("Session expired") as EnhancedError);
      }

      // Try to refresh the token
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "/api"}${
          API_ENDPOINTS.AUTH.REFRESH_TOKEN
        }`,
        { refresh_token: refreshToken }
      );

      const { access_token, refresh_token } = response.data;

      // Update tokens in localStorage
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // Update authorization header
      this.api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      // Update token in Redux store
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        getStore().dispatch({
          type: "auth/loginSuccess",
          payload: {
            accessToken: access_token,
            refreshToken: refresh_token,
            user,
          },
        });
      } catch (err) {
        console.error("Error updating Redux store:", err);
      }

      // Retry the original request
      const config = error.config as AxiosRequestConfig;
      if (config.headers) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
      return this.api.request(config);
    } catch (refreshError) {
      console.error("Token refresh failed:", refreshError);
      this.handleLogout();
      return Promise.reject(new Error("Session expired") as EnhancedError);
    }
  }

  /**
   * Handle logout and redirect
   */
  private handleLogout(): void {
    try {
      getStore().dispatch(logout());
    } catch (err) {
      // Fallback if store is not available
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }

    // Redirect to login page with expired session message
    window.location.href = "/login?session=expired";
  }

  /**
   * Generic API request method to reduce code duplication
   */
  private async request<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    let response;

    switch (method) {
      case "get":
      case "delete":
        response = await this.api[method]<T>(url, config);
        break;
      case "post":
      case "put":
      case "patch":
        response = await this.api[method]<T>(url, data, config);
        break;
    }

    return response;
  }

  /**
   * GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("get", url, undefined, config);
  }

  /**
   * POST request
   */
  public async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>("post", url, data, config);
  }

  /**
   * PUT request
   */
  public async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>("put", url, data, config);
  }

  /**
   * PATCH request
   */
  public async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>("patch", url, data, config);
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>("delete", url, undefined, config);
  }
}

// Create singleton instance
const API = ApiService.getInstance();

// Initialize token from storage on module load
const storedToken = localStorage.getItem("access_token");
if (storedToken) {
  API.setAuthToken(storedToken);
}

export default API;
