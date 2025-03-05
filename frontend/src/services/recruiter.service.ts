import API from "./api";
import { Application } from "../types/application";

interface ExternalCandidateDTO {
  name: string;
  email: string;
  phone?: string;
  jobId: number;
  source: string;
  status: string;
  resumePath?: string;
  coverLetter?: string;
  note?: string;
}

export const recruiterService = {
  // Get applications managed by the recruiter
  getRecruiterApplications: async () => {
    const response = await API.get("/recruiter/job-applications");
    return response.data;
  },

  // Get dashboard data for the recruiter
  getRecruiterDashboard: async () => {
    const response = await API.get("/recruiter/dashboard");
    return response.data;
  },

  // Add an external candidate to the system
  addExternalCandidate: async (candidateData: ExternalCandidateDTO) => {
    const response = await API.post("/applications/external", candidateData);
    return response.data;
  },

  // Upload a resume file for an external candidate
  uploadExternalResume: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await API.post("/applications/upload-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Get external pipeline sources (could be fetched from backend or defined here)
  getExternalSources: async () => {
    return [
      { id: "linkedin", name: "LinkedIn" },
      { id: "indeed", name: "Indeed" },
      { id: "referral", name: "Referral" },
      { id: "agency", name: "Recruitment Agency" },
      { id: "career_fair", name: "Career Fair" },
      { id: "other", name: "Other" },
    ];
  },
};
