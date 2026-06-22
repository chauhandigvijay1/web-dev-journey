export const AUTO_HUNTER_WORK_MODE_OPTIONS = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
] as const;

export const AUTO_HUNTER_JOB_TYPE_OPTIONS = [
  { value: "internship", label: "Internship" },
  { value: "full-time", label: "Full-time" },
  { value: "contract", label: "Contract" },
  { value: "part-time", label: "Part-time" },
] as const;

export const AUTO_HUNTER_SOURCE_OPTIONS = [
  { value: "linkedin.com", label: "LinkedIn" },
  { value: "wellfound.com", label: "Wellfound" },
  { value: "glassdoor.com", label: "Glassdoor" },
  { value: "naukri.com", label: "Naukri" },
  { value: "indeed.com", label: "Indeed" },
  { value: "internshala.com", label: "Internshala" },
] as const;

export type ResumeParsedData = {
  summary: string;
  skills: string[];
  experience: string[];
  techStack: string[];
  preferredRoles: string[];
  education: string[];
  certifications: string[];
  keywords: string[];
  seniorityLevel: string;
  locationPreference: string;
  totalYearsExperience: number;
  suggestedResumeImprovements: string[];
  parserModel: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  careerGoals?: string;
};

export type ResumeProfile = {
  id: string;
  resumeUrl: string;
  fileName: string;
  mimeType: string;
  parsedData: ResumeParsedData;
  lastParsedAt: string | null;
  lastScanAt: string | null;
  lastScanStatus: "idle" | "running" | "completed" | "failed";
  lastScanSummary: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobHunterAlertSettings = {
  emailEnabled: boolean;
  immediateAlertsEnabled: boolean;
  dailyDigestEnabled: boolean;
  minimumMatchScore: number;
  dailyDigestHour: number;
  maxAlertsPerDay: number;
};

export type JobHunterPreferences = {
  id: string;
  preferredRoles: string[];
  workModes: string[];
  countries: string[];
  companyPreferences: string[];
  salaryExpectation: {
    label: string;
    min: number | null;
    max: number | null;
    currency: string;
  };
  jobTypes: string[];
  searchSources: string[];
  alertSettings: JobHunterAlertSettings;
  searchEnabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AutoHunterMatch = {
  id: string;
  title: string;
  company: string;
  location: string;
  locations: string[];
  country: string;
  workMode: string;
  jobType: string;
  salaryText: string;
  source: string;
  sourceHost: string;
  applyUrl: string;
  originalUrl: string;
  descriptionSummary: string;
  skills: string[];
  status: "new" | "emailed" | "saved" | "dismissed" | "tracked";
  notifiedAt: string | null;
  postedAt: string | null;
  discoveredAt: string | null;
  trackedJob: string;
  match: {
    score: number;
    qualityLabel: string;
    reasons: string[];
    missingSkills: string[];
    atsKeywordSimilarity: number;
    urgencyLabel: string;
    componentScores: Record<string, number>;
  };
};

export type AutoHunterSavedJob = {
  id: string;
  matchedJob: string;
  externalJobId: string;
  title: string;
  company: string;
  source: string;
  applyUrl: string;
  notes: string;
  savedAt: string | null;
};

export type AutoHunterAlertLog = {
  id: string;
  matchedJob: string;
  channel: "email";
  type: "instant" | "digest";
  status: "sent" | "skipped" | "failed";
  score: number;
  reason: string;
  sentAt: string | null;
  createdAt: string | null;
  meta: Record<string, unknown>;
};

export type AutoHunterOverview = {
  profile: ResumeProfile | null;
  preferences: JobHunterPreferences;
  stats: {
    totalMatches: number;
    newMatches: number;
    savedJobs: number;
    appliedSuggestions: number;
    emailedMatches: number;
  };
  matches: AutoHunterMatch[];
  savedJobs: AutoHunterSavedJob[];
  topCompanies: Array<{ company: string; count: number }>;
  skillGaps: Array<{ skill: string; count: number }>;
  recentAlerts: AutoHunterAlertLog[];
};

export type AutoHunterHistory = {
  matches: AutoHunterMatch[];
  alerts: AutoHunterAlertLog[];
  savedJobs: AutoHunterSavedJob[];
};

export type AutoHunterSkillInsights = {
  missingSkills: Array<{ skill: string; count: number }>;
  recommendedImprovements: string[];
  topRoles: Array<{ role: string; count: number }>;
  topCompanies: Array<{ company: string; count: number }>;
  currentSkills: string[];
};

export function formatHunterLabel(value: string) {
  if (!value) return "";
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
