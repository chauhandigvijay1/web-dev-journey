import { MATCH_COMPONENT_WEIGHTS } from "./constants.js";
import {
  clamp,
  extractSalaryRange,
  freshnessUrgencyLabel,
  inferSeniority,
  matchQualityLabel,
  parseExperienceYears,
  similarityScore,
  tokenize,
  uniqueStrings,
} from "./helpers.js";

function weightedScore(scores) {
  const total = Object.entries(MATCH_COMPONENT_WEIGHTS).reduce(
    (sum, [key, weight]) => sum + (scores[key] ?? 0) * weight,
    0
  );
  return Math.round(total / 100);
}

function scoreSkills(candidate, resumeProfile) {
  const userSkills = new Set(
    uniqueStrings([
      ...(resumeProfile.parsedData?.skills || []),
      ...(resumeProfile.parsedData?.techStack || []),
      ...(resumeProfile.parsedData?.keywords || []),
    ]).map((value) => value.toLowerCase())
  );

  const jobSkills = uniqueStrings(candidate.skills || []);
  if (jobSkills.length === 0) {
    return { score: 60, missingSkills: [] };
  }

  const matched = [];
  const missing = [];

  for (const skill of jobSkills) {
    if (userSkills.has(skill.toLowerCase())) matched.push(skill);
    else missing.push(skill);
  }

  return {
    score: clamp(Math.round((matched.length / jobSkills.length) * 100), 0, 100),
    missingSkills: missing.slice(0, 8),
  };
}

function scoreExperience(candidate, resumeProfile) {
  const userYears = Number(resumeProfile.parsedData?.totalYearsExperience) || 0;
  const requiredYears = parseExperienceYears(candidate.experienceText || candidate.seniorityLevel);
  const userSeniority = inferSeniority(resumeProfile.parsedData?.seniorityLevel || "");
  const jobSeniority = inferSeniority(candidate.seniorityLevel || candidate.title || "");

  if (requiredYears == null && !jobSeniority) return 60;
  if (requiredYears == null && jobSeniority && userSeniority === jobSeniority) return 90;
  if (requiredYears == null) return 55;
  if (userYears >= requiredYears) return 100;

  const diff = requiredYears - userYears;
  if (diff <= 1) return 80;
  if (diff <= 2) return 60;
  return 30;
}

function scoreRole(candidate, resumeProfile, preferences) {
  const roleTargets = uniqueStrings([
    ...(preferences.preferredRoles || []),
    ...(resumeProfile.parsedData?.preferredRoles || []),
  ]);

  if (roleTargets.length === 0) return 60;

  const haystack = [candidate.title, candidate.descriptionSummary, candidate.descriptionText].join(" ");
  const best = roleTargets.reduce((max, role) => Math.max(max, similarityScore(role, haystack)), 0);
  return best;
}

function scoreLocation(candidate, resumeProfile, preferences) {
  const preferredModes = preferences.workModes || [];
  const preferredCountries = preferences.countries || [];
  const resumeLocation = resumeProfile.parsedData?.locationPreference || "";
  const candidateLocation = [candidate.location, ...(candidate.locations || []), candidate.country].join(" ");

  let modeScore = 75;
  if (preferredModes.length > 0) {
    if (candidate.workMode && preferredModes.includes(candidate.workMode.toLowerCase())) modeScore = 100;
    else if (!candidate.workMode) modeScore = 55;
    else modeScore = 20;
  }

  let placeScore = 75;
  const locationTerms = uniqueStrings([...preferredCountries, resumeLocation]).map((value) => value.toLowerCase());
  if (locationTerms.length > 0) {
    const lowerCandidateLocation = candidateLocation.toLowerCase();
    placeScore = locationTerms.some((term) => lowerCandidateLocation.includes(term)) ? 100 : 35;
  }

  return Math.round((modeScore + placeScore) / 2);
}

function scoreSalary(candidate, preferences) {
  const expected = preferences.salaryExpectation || {};
  if (!expected.min && !expected.max && !expected.label) return 65;

  const candidateSalary =
    candidate.salaryMin || candidate.salaryMax || candidate.salaryText
      ? {
          min: candidate.salaryMin,
          max: candidate.salaryMax,
          label: candidate.salaryText,
        }
      : extractSalaryRange(candidate.salaryText);

  if (!candidateSalary.min && !candidateSalary.max) return 55;

  if (expected.min && candidateSalary.max && candidateSalary.max < expected.min) return 25;
  if (expected.max && candidateSalary.min && candidateSalary.min > expected.max * 1.3) return 70;
  if (expected.max && candidateSalary.min && candidateSalary.min > expected.max) return 85;
  return 100;
}

function scoreCompany(candidate, preferences) {
  const preferredCompanies = uniqueStrings(preferences.companyPreferences || []).map((value) => value.toLowerCase());
  if (preferredCompanies.length === 0) return 50;

  const company = String(candidate.company || "").toLowerCase();
  return preferredCompanies.some((value) => company.includes(value) || value.includes(company)) ? 100 : 30;
}

function scoreFreshness(candidate) {
  const date = candidate.postedAt || candidate.discoveredAt;
  if (!date) return 60;

  const ageHours = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
  if (ageHours <= 24) return 100;
  if (ageHours <= 72) return 85;
  if (ageHours <= 168) return 70;
  if (ageHours <= 336) return 55;
  return 35;
}

function scoreAtsKeywords(candidate, resumeProfile) {
  const resumeKeywords = uniqueStrings([
    ...(resumeProfile.parsedData?.keywords || []),
    ...(resumeProfile.parsedData?.skills || []),
  ]);
  if (resumeKeywords.length === 0) return 50;

  const jobKeywords = uniqueStrings([
    ...(candidate.keywords || []),
    ...(candidate.skills || []),
    ...tokenize(`${candidate.title} ${candidate.descriptionSummary} ${candidate.descriptionText}`),
  ]);

  if (jobKeywords.length === 0) return 50;
  return similarityScore(resumeKeywords.join(" "), jobKeywords.join(" "));
}

function buildReasons(candidate, scores, missingSkills) {
  const reasons = [];

  if (scores.skills >= 75 && candidate.skills?.length) {
    reasons.push(`Strong skill overlap with ${candidate.skills.slice(0, 3).join(", ")}`);
  }
  if (scores.role >= 80) {
    reasons.push(`Role title aligns closely with your target positions`);
  }
  if (scores.location >= 80) {
    reasons.push(`Location and work mode match your preferences`);
  }
  if (scores.freshness >= 85) {
    reasons.push(`Newly discovered posting with high urgency`);
  }
  if (scores.salary >= 85 && candidate.salaryText) {
    reasons.push(`Compensation looks aligned with your expected range`);
  }
  if (scores.company >= 90 && candidate.company) {
    reasons.push(`Company matches your preferred employer list`);
  }
  if (missingSkills.length > 0) {
    reasons.push(`Missing skills to close: ${missingSkills.slice(0, 3).join(", ")}`);
  }

  return reasons.slice(0, 5);
}

export function scoreCandidateForUser(candidate, resumeProfile, preferences) {
  const skills = scoreSkills(candidate, resumeProfile);
  const scores = {
    skills: skills.score,
    experience: scoreExperience(candidate, resumeProfile),
    role: scoreRole(candidate, resumeProfile, preferences),
    location: scoreLocation(candidate, resumeProfile, preferences),
    salary: scoreSalary(candidate, preferences),
    company: scoreCompany(candidate, preferences),
    freshness: scoreFreshness(candidate),
    atsKeywords: scoreAtsKeywords(candidate, resumeProfile),
  };

  const score = weightedScore(scores);
  const qualityLabel = matchQualityLabel(score);
  const reasons = buildReasons(candidate, scores, skills.missingSkills);

  return {
    score,
    qualityLabel,
    reasons,
    missingSkills: skills.missingSkills,
    atsKeywordSimilarity: scores.atsKeywords,
    componentScores: scores,
    urgencyLabel: freshnessUrgencyLabel(candidate.postedAt || candidate.discoveredAt),
  };
}
