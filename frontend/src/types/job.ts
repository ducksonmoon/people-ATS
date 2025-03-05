export interface Job {
  id: number;
  title: string;
  description: string;
  category?: string | { id: number; name: string };
  location?: string | { id: number; name: string };
  postedById: number;
  postedBy: {
    id: number;
    email: string;
    name?: string;
  };
  company?: {
    name: string;
    logoUrl?: string;
  };
  createdAt: string;
}

export interface PaginatedJobs {
  data: Job[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
