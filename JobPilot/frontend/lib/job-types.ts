export const JOB_STATUSES = ["saved", "applied", "oa", "interview", "offer", "rejected"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export function isJobStatus(value: string): value is JobStatus {
  return (JOB_STATUSES as readonly string[]).includes(value);
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  oa: "OA",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  locations?: string[];
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
  skills?: string[];
  qualification?: string;
  applyDeadline?: string | null;
  workMode?: string;
  descriptionSummary?: string;
  originalApplyLink?: string;
  priorityScore?: number;
  contacts?: Array<{
    _id?: string;
    name: string;
    role: string;
    email: string;
    linkedin: string;
    status: string;
    lastContactDate?: string;
  }>;
};
