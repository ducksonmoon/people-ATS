import API from "./api";
import API_ENDPOINTS from "../constants/api";
import { CompanySettings } from "../types/company-settings";

/**
 * Service for handling company settings API operations
 */
class CompanySettingsService {
  private endpoints = {
    settings: API_ENDPOINTS.COMPANY.SETTINGS,
    logo: API_ENDPOINTS.COMPANY.LOGO,
    theme: API_ENDPOINTS.COMPANY.THEME,
  };

  /**
   * Generic API request handler with consistent error handling
   * @param apiCall - Function that makes the actual API call
   * @param errorContext - Context for error message
   */
  private async apiRequest<T>(
    apiCall: () => Promise<T>,
    errorContext: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`Failed to ${errorContext}:`, error);
      throw new Error(`Failed to ${errorContext}: ${(error as Error).message}`);
    }
  }

  /**
   * Fetch the company settings
   */
  async getCompanySettings(): Promise<CompanySettings> {
    return this.apiRequest(
      () => API.get<CompanySettings>(this.endpoints.settings),
      "fetch company settings"
    );
  }

  /**
   * Update company settings
   */
  async updateCompanySettings(
    data: Partial<CompanySettings>
  ): Promise<CompanySettings> {
    return this.apiRequest(
      () => API.patch<CompanySettings>(this.endpoints.settings, data),
      "update company settings"
    );
  }

  /**
   * Upload company logo
   */
  async uploadLogo(logo: File): Promise<{ logo: string }> {
    const formData = new FormData();
    formData.append("logo", logo);

    return this.apiRequest(
      () =>
        API.post<{ logo: string }>(this.endpoints.logo, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }),
      "upload logo"
    );
  }

  /**
   * Get company theme settings
   */
  async getCompanyTheme<T = Record<string, unknown>>(): Promise<T> {
    return this.apiRequest(
      () => API.get<T>(this.endpoints.theme),
      "fetch company theme"
    );
  }

  /**
   * Update company theme settings
   */
  async updateCompanyTheme<T = Record<string, unknown>>(
    themeData: T
  ): Promise<T> {
    return this.apiRequest(
      () => API.put<T>(this.endpoints.theme, themeData),
      "update company theme"
    );
  }
}

// Export a singleton instance
export default new CompanySettingsService();
