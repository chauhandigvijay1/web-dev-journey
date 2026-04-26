export const AUTO_HUNTER_WORK_MODES = ["remote", "hybrid", "onsite"];
export const AUTO_HUNTER_JOB_TYPES = ["internship", "full-time", "contract", "part-time"];

export const MATCH_COMPONENT_WEIGHTS = {
  skills: 28,
  experience: 14,
  role: 16,
  location: 10,
  salary: 10,
  company: 8,
  freshness: 8,
  atsKeywords: 6,
};

export const HIGH_MATCH_LABELS = [
  { min: 90, label: "Exceptional" },
  { min: 80, label: "Strong" },
  { min: 70, label: "Promising" },
  { min: 55, label: "Watchlist" },
  { min: 0, label: "Low" },
];
