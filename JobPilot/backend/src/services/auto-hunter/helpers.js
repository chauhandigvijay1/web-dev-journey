import crypto from "crypto";
import { AUTO_HUNTER_JOB_TYPES, AUTO_HUNTER_WORK_MODES, HIGH_MATCH_LABELS } from "./constants.js";

export function cleanText(value, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function uniqueStrings(values, maxLength = 120) {
  const seen = new Set();
  const output = [];

  for (const value of values || []) {
    const normalized = cleanText(String(value || ""), maxLength);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }

  return output;
}

export function splitListValues(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return uniqueStrings(value);
  }

  return uniqueStrings(String(value).split(/\n|,|;|\||•|·|\//));
}

export function tokenize(value) {
  return uniqueStrings(
    cleanText(String(value || ""), 10000)
      .toLowerCase()
      .split(/[^a-z0-9+#.\-]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 2)
  );
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeWorkModes(value) {
  const modes = splitListValues(value)
    .map((entry) => entry.toLowerCase())
    .flatMap((entry) => {
      if (entry.includes("remote") || entry.includes("work from home")) return ["remote"];
      if (entry.includes("hybrid")) return ["hybrid"];
      if (entry.includes("onsite") || entry.includes("on-site") || entry.includes("office")) return ["onsite"];
      return [];
    });

  return uniqueStrings(modes);
}

export function normalizeJobTypes(value) {
  const types = splitListValues(value)
    .map((entry) => entry.toLowerCase())
    .flatMap((entry) => {
      if (entry.includes("intern")) return ["internship"];
      if (entry.includes("full")) return ["full-time"];
      if (entry.includes("contract")) return ["contract"];
      if (entry.includes("part")) return ["part-time"];
      return [];
    });

  return uniqueStrings(types);
}

export function normalizeCountries(value) {
  return splitListValues(value).map((entry) => cleanText(entry, 80));
}

export function normalizeSalaryExpectation(input = {}) {
  const label = cleanText(input.label || "", 120);
  const min = Number.isFinite(Number(input.min)) ? Math.max(0, Number(input.min)) : null;
  const max = Number.isFinite(Number(input.max)) ? Math.max(0, Number(input.max)) : null;
  const currency = cleanText(input.currency || "", 12).toUpperCase();

  return {
    label,
    min,
    max: max != null && min != null && max < min ? min : max,
    currency,
  };
}

export function normalizeAlertSettings(input = {}, fallback = {}) {
  return {
    emailEnabled: typeof input.emailEnabled === "boolean" ? input.emailEnabled : fallback.emailEnabled ?? true,
    immediateAlertsEnabled:
      typeof input.immediateAlertsEnabled === "boolean"
        ? input.immediateAlertsEnabled
        : fallback.immediateAlertsEnabled ?? true,
    dailyDigestEnabled:
      typeof input.dailyDigestEnabled === "boolean"
        ? input.dailyDigestEnabled
        : fallback.dailyDigestEnabled ?? false,
    minimumMatchScore: clamp(
      Number.isFinite(Number(input.minimumMatchScore))
        ? Number(input.minimumMatchScore)
        : fallback.minimumMatchScore ?? 72,
      0,
      100
    ),
    dailyDigestHour: clamp(
      Number.isFinite(Number(input.dailyDigestHour))
        ? Number(input.dailyDigestHour)
        : fallback.dailyDigestHour ?? 18,
      0,
      23
    ),
    maxAlertsPerDay: clamp(
      Number.isFinite(Number(input.maxAlertsPerDay))
        ? Number(input.maxAlertsPerDay)
        : fallback.maxAlertsPerDay ?? 5,
      1,
      100
    ),
  };
}

export function normalizeJobHunterPreferences(input = {}, fallback = {}) {
  const searchSources = splitListValues(input.searchSources ?? fallback.searchSources);

  return {
    preferredRoles: splitListValues(input.preferredRoles ?? fallback.preferredRoles),
    workModes: normalizeWorkModes(input.workModes ?? fallback.workModes).filter((value) =>
      AUTO_HUNTER_WORK_MODES.includes(value)
    ),
    countries: normalizeCountries(input.countries ?? fallback.countries),
    companyPreferences: splitListValues(input.companyPreferences ?? fallback.companyPreferences),
    salaryExpectation: normalizeSalaryExpectation(input.salaryExpectation ?? fallback.salaryExpectation),
    jobTypes: normalizeJobTypes(input.jobTypes ?? fallback.jobTypes).filter((value) =>
      AUTO_HUNTER_JOB_TYPES.includes(value)
    ),
    searchSources,
    alertSettings: normalizeAlertSettings(input.alertSettings ?? fallback.alertSettings, fallback.alertSettings),
    searchEnabled:
      typeof input.searchEnabled === "boolean" ? input.searchEnabled : fallback.searchEnabled ?? true,
  };
}

export function extractJsonObject(raw) {
  const text = cleanText(String(raw || ""), 50000);
  if (!text) {
    throw new Error("AI parser returned an empty response");
  }

  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1]);
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }

  return JSON.parse(text);
}

function normalizeNumberToken(token) {
  const normalized = token.toLowerCase().replace(/,/g, "");
  const value = Number.parseFloat(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(value)) return null;

  if (normalized.includes("crore") || normalized.includes("cr")) {
    return value * 10_000_000;
  }
  if (normalized.includes("lakh") || normalized.includes("lac") || normalized.includes("lpa")) {
    return value * 100_000;
  }
  if (normalized.endsWith("m")) {
    return value * 1_000_000;
  }
  if (normalized.endsWith("k")) {
    return value * 1_000;
  }
  return value;
}

export function extractSalaryRange(text) {
  const source = cleanText(String(text || ""), 240);
  if (!source) {
    return { min: null, max: null, currency: "", label: "" };
  }

  const tokens = source.match(/[$€£₹]?\s?\d[\d,]*(?:\.\d+)?\s?(?:k|m|cr|crore|lakh|lac|lpa)?/gi) || [];
  const numbers = tokens.map(normalizeNumberToken).filter((value) => value != null);
  const currencyMatch = source.match(/[$€£₹]|usd|eur|gbp|inr/i);
  const currency = currencyMatch
    ? currencyMatch[0].toUpperCase().replace("₹", "INR").replace("$", "USD").replace("£", "GBP").replace("€", "EUR")
    : "";

  if (numbers.length === 0) {
    return { min: null, max: null, currency, label: source };
  }

  return {
    min: Math.min(...numbers),
    max: numbers.length > 1 ? Math.max(...numbers) : numbers[0],
    currency,
    label: source,
  };
}

export function parseExperienceYears(value) {
  const text = cleanText(String(value || ""), 160).toLowerCase();
  if (!text) return null;
  if (text.includes("fresher") || text.includes("entry level")) return 0;

  const range = text.match(/(\d+(?:\.\d+)?)\s*(?:\+|plus)?\s*(?:to|-)?\s*(\d+(?:\.\d+)?)?\s*years?/i);
  if (!range) return null;

  const min = Number.parseFloat(range[1]);
  const max = range[2] ? Number.parseFloat(range[2]) : min;
  if (!Number.isFinite(min)) return null;
  if (!Number.isFinite(max)) return min;
  return (min + max) / 2;
}

export function inferSeniority(value) {
  const text = cleanText(String(value || ""), 240).toLowerCase();
  if (!text) return "";
  if (text.includes("principal") || text.includes("staff")) return "Principal";
  if (text.includes("lead")) return "Lead";
  if (text.includes("senior")) return "Senior";
  if (text.includes("mid")) return "Mid";
  if (text.includes("junior") || text.includes("entry") || text.includes("fresher") || text.includes("intern")) {
    return "Junior";
  }
  return "";
}

export function similarityScore(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let matches = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) matches += 1;
  }

  return Math.round((matches / Math.max(leftTokens.size, rightTokens.size)) * 100);
}

export function createExternalJobId({ url, title, company, source }) {
  const basis = [cleanText(url, 1000), cleanText(title, 240), cleanText(company, 240), cleanText(source, 120)]
    .filter(Boolean)
    .join("|");

  return crypto.createHash("sha1").update(basis).digest("hex");
}

export function matchQualityLabel(score) {
  const normalized = clamp(Math.round(Number(score) || 0), 0, 100);
  return HIGH_MATCH_LABELS.find((entry) => normalized >= entry.min)?.label || "Low";
}

export function freshnessUrgencyLabel(dateValue) {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) return "Standard";

  const ageHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (ageHours <= 24) return "Hot";
  if (ageHours <= 72) return "Fresh";
  if (ageHours <= 168) return "Recent";
  return "Standard";
}

export function parseRelativeDate(value, now = new Date()) {
  const text = cleanText(String(value || ""), 120).toLowerCase();
  if (!text) return null;

  if (text.includes("today")) return now;
  if (text.includes("yesterday")) return new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const relative = text.match(/(\d+)\s+(hour|day|week|month)s?\s+ago/);
  if (relative) {
    const amount = Number(relative[1]);
    const unit = relative[2];
    const factor =
      unit === "hour"
        ? 60 * 60 * 1000
        : unit === "day"
          ? 24 * 60 * 60 * 1000
          : unit === "week"
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000;

    return new Date(now.getTime() - amount * factor);
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function pickTop(values, limit = 5) {
  return uniqueStrings(values).slice(0, limit);
}
