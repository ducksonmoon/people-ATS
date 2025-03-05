import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import CompanySettingsService from "../services/companySettingsService";
import {
  CompanySettings,
  CompanySettingsState,
} from "../types/company-settings";

const initialState: CompanySettingsState = {
  settings: null,
  loading: false,
  error: null,
};

export const fetchCompanySettings = createAsyncThunk(
  "companySettings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanySettingsService.getCompanySettings();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch settings");
    }
  }
);

export const updateCompanySettings = createAsyncThunk(
  "companySettings/updateSettings",
  async (updatedData: Partial<CompanySettings>, { rejectWithValue }) => {
    try {
      const response = await CompanySettingsService.updateCompanySettings(
        updatedData
      );
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update settings");
    }
  }
);

export const fetchPublicCompanySettings = createAsyncThunk(
  "companySettings/fetchPublicSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await CompanySettingsService.getCompanySettings();
      return response;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch settings");
    }
  }
);

const companySettingsSlice = createSlice({
  name: "companySettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCompanySettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchCompanySettings.fulfilled,
      (state, action: PayloadAction<CompanySettings>) => {
        state.loading = false;
        state.settings = action.payload;
      }
    );
    builder.addCase(fetchCompanySettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(updateCompanySettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      updateCompanySettings.fulfilled,
      (state, action: PayloadAction<CompanySettings>) => {
        state.loading = false;
        state.settings = action.payload;
      }
    );
    builder.addCase(updateCompanySettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(fetchPublicCompanySettings.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPublicCompanySettings.fulfilled,
      (state, action: PayloadAction<CompanySettings>) => {
        state.loading = false;
        state.settings = action.payload;
      }
    );
    builder.addCase(fetchPublicCompanySettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const reducer = companySettingsSlice.reducer;
export default companySettingsSlice.reducer;
