import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

// Define a proper User interface instead of using 'any'
export interface User {
  id: number;
  email: string;
  name: string;
  role?: string;
  // Add other user properties as needed
  [key: string]: any; // For additional properties that might be present
}

// Define the shape of authentication state
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Storage keys for consistent reference
const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};

/**
 * Safely retrieves user data from localStorage
 * @returns User object or null if not found or invalid
 */
const getUserFromStorage = (): User | null => {
  try {
    const userString = localStorage.getItem(STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage:", error);
    return null;
  }
};

/**
 * Initial state for the auth slice
 */
const initialState: AuthState = {
  accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null,
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null,
  user: getUserFromStorage(),
  isAuthenticated: !!(
    localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) && getUserFromStorage()
  ),
  isLoading: false,
  error: null,
};

/**
 * Auth slice containing reducers for authentication state management
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
        user: User;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Persist auth data
      localStorage.setItem(
        STORAGE_KEYS.ACCESS_TOKEN,
        action.payload.accessToken
      );

      // Store refresh token if available
      if (action.payload.refreshToken) {
        localStorage.setItem(
          STORAGE_KEYS.REFRESH_TOKEN,
          action.payload.refreshToken
        );
      }

      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(action.payload.user)
      );
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      // Clear state
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear storage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

// Export actions for components to use
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearAuthError,
} = authSlice.actions;

// Selectors for accessing auth state
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUserRole = (state: RootState) => state.auth.user?.role;

export default authSlice.reducer;
