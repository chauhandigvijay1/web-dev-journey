export const JOB_STATUSES = ["applied", "interview", "offer", "rejected"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export function isJobStatus(value: string): value is JobStatus {
  return (JOB_STATUSES as readonly string[]).includes(value);
}

export type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  jobType?: string;
  salary: string;
  companyType?: string;
  confidenceScore: number;
  status: JobStatus;
  notes?: string;
  expectedSalary?: string;
  offeredSalary?: string;
  createdAt?: string;
  updatedAt?: string;
  isPinned?: boolean;
  isImportant?: boolean;
  isGhosted?: boolean;
  resumeUrl?: string;
  experience?: string;
  joiningType?: string;
  source?: string;
  followUpDate?: string | null;
};
