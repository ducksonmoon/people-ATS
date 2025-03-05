import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import companySettingsReducer from "./companySettingsSlice";

// Remove the problematic import temporarily
// import companySettingsReducer from "./companySettingsSlice";

// Create the store with both auth and company settings reducers
const store = configureStore({
  reducer: {
    auth: authReducer,
    companySettings: companySettingsReducer,
  },
});

// Extend Window interface to avoid TypeScript errors
declare global {
  interface Window {
    __REDUX_STORE__: typeof store;
  }
}

// Make store available globally to break circular dependencies
if (typeof window !== "undefined") {
  window.__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
