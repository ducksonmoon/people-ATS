import API from "./api";
import API_ENDPOINTS from "../constants/api";
import { User } from "../redux/authSlice";

/**
 * Interface for login response from API
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authenticates a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise containing access token and user data
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await API.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    // Store tokens in localStorage directly as a fallback
    if (response.access_token) {
      localStorage.setItem("access_token", response.access_token);
    }

    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token);
    }

    console.log("Login API response:", {
      hasAccessToken: !!response.access_token,
      hasRefreshToken: !!response.refresh_token,
      userProvided: !!response.user,
    });

    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Logs out the current user by calling the logout endpoint
 * Note: Local storage clearing is handled by the auth slice
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await API.post(API_ENDPOINTS.AUTH.LOGOUT, {});

    // Explicitly clear tokens from localStorage in case the auth slice fails
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Logout API call failed:", error);

    // Still clear tokens even if the API call fails
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Throw the error so the caller can handle it
    throw error;
  }
};

/**
 * Get the currently authenticated user's profile
 * @returns User profile data
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await API.get<User>(API_ENDPOINTS.AUTH.PROFILE);
    return response;
  } catch (error) {
    console.error("Get current user failed:", error);
    throw error;
  }
};

/**
 * Update the user's profile information
 * @param userData Partial user data to update
 * @returns Updated user profile
 */
export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await API.put<User>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      userData
    );
    return response;
  } catch (error) {
    console.error("Update profile failed:", error);
    throw error;
  }
};

/**
 * Change the user's password
 * @param currentPassword User's current password
 * @param newPassword User's new password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  try {
    await API.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    console.error("Password change failed:", error);
    throw error;
  }
};

/**
 * Request a password reset email
 * @param email User's email address
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    await API.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  } catch (error) {
    console.error("Password reset request failed:", error);
    throw error;
  }
};

/**
 * Refreshes the access token using a refresh token
 * @param refreshToken The refresh token
 * @returns Promise with new access and refresh tokens
 */
export const refreshAuthToken = async (
  refreshToken: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> => {
  try {
    const response = await API.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh_token: refreshToken,
    });
    return response;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
};
