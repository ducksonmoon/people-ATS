import type { Department } from './user';

export type { Department };

export interface Candidate {
  id: number;
  name: string;
  email: string;
}

export interface JobCategory {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface Job {
  id: number;
  title: string;
  department?: Department;
  category?: JobCategory;
  location?: Location;
}

export interface Interviewer {
  id: number;
  name: string;
  email?: string;
  role?: string;
  department?: Department;
}

export interface Interview {
  id: number;
  scheduledAt: string;
  duration: number;
  type: string;
  location?: string;
  meetingLink?: string;
  status: string;
  feedback?: string;
  interviewer: Interviewer;
}

export interface Application {
  id: number;
  candidate: Candidate;
  job: Job;
  status: string;
  createdAt: string;
  updatedAt: string;
  resumePath?: string;
  coverLetter?: string;
  note?: string;
  interviews?: Interview[];
  nextInterviewDate?: Date;
  source?: string;
}

export interface InterviewFormState {
  date: Date | null;
  duration: number;
  type: string;
  location: string;
  meetingLink: string;
  notes: string;
  interviewer: number | null;
}

// Define application status types for type safety
export type ApplicationStatus =
  | "PENDING"
  | "INTERVIEWING"
  | "OFFER_SENT"
  | "HIRED"
  | "REJECTED";

// Define interview status types
export type InterviewStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

// Define interview types
export type InterviewType =
  | "INITIAL"
  | "TECHNICAL"
  | "MANAGER"
  | "TEAM"
  | "FINAL";
