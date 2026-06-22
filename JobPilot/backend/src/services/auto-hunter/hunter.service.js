import crypto from "crypto";
import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";
import { logger as defaultLogger } from "../../utils/logger.js";
import { normalizeSettings } from "../auth.service.js";
import { createJobForUser } from "../job.service.js";
import { sendMail } from "../mail.service.js";
import { extractJobFieldsFromUrl } from "../job-extraction/index.js";
import {
  cleanText as extractionCleanText,
  findDeadline,
  findExperience,
  findQualification,
  findSkillList,
  findWorkMode,
  splitTokens,
  summarizeDescription,
} from "../job-extraction/helpers.js";
import { AlertLog } from "../../models/AlertLog.js";
import { JobPreferences } from "../../models/JobPreferences.js";
import { MatchedJob } from "../../models/MatchedJob.js";
import { ResumeProfile } from "../../models/ResumeProfile.js";
import { SavedJob } from "../../models/SavedJob.js";
import { buildAutoHunterMatchEmail } from "./email-templates.service.js";
import { scoreCandidateForUser } from "./match-engine.service.js";
import { parseResumeProfile } from "./resume-parser.service.js";
import { fetchTinyFishPages, hasTinyFishConfig, searchTinyFish } from "./tinyfish.service.js";
import {
  cleanText,
  createExternalJobId,
  extractSalaryRange,
  freshnessUrgencyLabel,
  normalizeJobHunterPreferences,
  normalizeJobTypes,
  normalizeWorkModes,
  parseRelativeDate,
  pickTop,
  similarityScore,
  splitListValues,
  tokenize,
  uniqueStrings,
} from "./helpers.js";

function formatWorkMode(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function defaultHunterPreferences(user, profile) {
  const userSettings = normalizeSettings(user?.settings);
  const preferredLocation = userSettings.jobPreferences.preferredLocation || "";
  const preferredJobType = userSettings.jobPreferences.preferredJobType || "";
  const workModes = normalizeWorkModes(preferredLocation);
  const countries = splitListValues(preferredLocation).filter(
    (value) => !normalizeWorkModes(value).length
  );

  return normalizeJobHunterPreferences({
    preferredRoles: profile?.parsedData?.preferredRoles || [],
    workModes,
    countries,
    companyPreferences: [],
    salaryExpectation: {
      label: userSettings.jobPreferences.expectedSalaryRange || "",
    },
    jobTypes: normalizeJobTypes(preferredJobType),
    searchSources: env.autoHunterSourceBoards,
    alertSettings: {
      emailEnabled: true,
      immediateAlertsEnabled: true,
      dailyDigestEnabled: false,
      minimumMatchScore: env.autoHunterMinAlertScore,
      dailyDigestHour: 18,
      maxAlertsPerDay: 5,
    },
    searchEnabled: true,
  });
}

async function getOrCreateJobPreferences(user, profile) {
  const fallback = defaultHunterPreferences(user, profile);
  let document = await JobPreferences.findOne({ user: user._id });

  if (!document) {
    document = await JobPreferences.create({
      user: user._id,
      ...fallback,
    });
  }

  return {
    document,
    value: normalizeJobHunterPreferences(document.toObject(), fallback),
  };
}

function sanitizeResumeProfile(profile) {
  if (!profile) return null;

  return {
    id: profile._id.toString(),
    resumeUrl: profile.resumeUrl,
    fileName: profile.fileName,
    mimeType: profile.mimeType,
    parsedData: profile.parsedData,
    lastParsedAt: profile.lastParsedAt,
    lastScanAt: profile.lastScanAt,
    lastScanStatus: profile.lastScanStatus,
    lastScanSummary: profile.lastScanSummary,
    isActive: profile.isActive,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function sanitizeJobPreferences(document, value) {
  return {
    id: document?._id?.toString() || "",
    preferredRoles: value.preferredRoles,
    workModes: value.workModes,
    countries: value.countries,
    companyPreferences: value.companyPreferences,
    salaryExpectation: value.salaryExpectation,
    jobTypes: value.jobTypes,
    searchSources: value.searchSources,
    alertSettings: value.alertSettings,
    searchEnabled: value.searchEnabled,
    createdAt: document?.createdAt || null,
    updatedAt: document?.updatedAt || null,
  };
}

function runInBatches(items, size, worker) {
  const groups = [];
  for (let index = 0; index < items.length; index += size) {
    groups.push(items.slice(index, index + size));
  }

  return groups.reduce(
    (promise, group) =>
      promise.then(async () => {
        await Promise.all(group.map((item) => worker(item)));
      }),
    Promise.resolve()
  );
}

function extractHostname(urlString) {
  try {
    return new URL(urlString).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function cleanSearchTitle(title = "") {
  return cleanText(title, 240)
    .replace(/\s+\|\s+(linkedin|wellfound|glassdoor|indeed|naukri|internshala).*$/i, "")
    .trim();
}

function parseCompanyFromSearchTitle(title = "", host = "") {
  const cleaned = cleanSearchTitle(title);
  const separatorClass = "[|\\u2022-]";
  const patterns = [
    new RegExp(`\\bat\\s+([^${separatorClass.slice(1, -1)}]+)`, "i"),
    new RegExp(`-\\s*([^${separatorClass.slice(1, -1)}]+?)(?:\\s*${separatorClass}.*)?$`, "i"),
    /\|\s*([^|]+)$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    const value = cleanText(match?.[1] || "", 160);
    if (!value) continue;
    if (host && value.toLowerCase().includes(host.toLowerCase())) continue;
    return value;
  }

  return "";
}

function parseTitleFromSearchTitle(title = "") {
  const cleaned = cleanSearchTitle(title);
  const atSplit = cleaned.split(/\bat\b/i);
  if (atSplit.length > 1) {
    return cleanText(atSplit[0], 180);
  }

  return cleanText(cleaned.split("|")[0], 180);
}

function parseFetchedPage(result, seed) {
  const text = extractionCleanText(result?.text || "", 14000);
  const title = cleanText(result?.title || "", 240) || parseTitleFromSearchTitle(seed.title);
  const descriptionSummary = summarizeDescription(text);
  const descriptionText = cleanText(text, 8000);
  const skills = uniqueStrings([
    ...findSkillList(text),
    ...splitTokens(text.match(/(?:skills?|stack|technologies)[:\-\s]+([^\n]+)/i)?.[1] || ""),
  ]).slice(0, 16);
  const workMode = normalizeWorkModes([findWorkMode(text), seed.snippet])[0] || "";
  const jobType = normalizeJobTypes(text)[0] || "";
  const experienceText = cleanText(findExperience(text), 160);
  const qualification = cleanText(findQualification(text), 200);
  const salary = cleanText(
    text.match(/(?:salary|compensation|package|ctc|stipend)[:\-\s]+([^\n]+)/i)?.[1] || "",
    180
  );
  const postedAt =
    parseRelativeDate(
      text.match(/(?:posted|updated)\s+([^.:\n]+)/i)?.[1] ||
        text.match(/(\d+\s+(?:hour|day|week|month)s?\s+ago)/i)?.[1] ||
        seed.snippet
    ) || null;

  return {
    title,
    company: parseCompanyFromSearchTitle(result?.title || seed.title, seed.host),
    location: cleanText(
      text.match(/(?:location|locations?)[:\-\s]+([^\n]+)/i)?.[1] ||
        text.match(/\b(remote|hybrid|onsite|on-site)[^.\n]*/i)?.[0] ||
        "",
      180
    ),
    locations: splitListValues(
      text.match(/(?:location|locations?)[:\-\s]+([^\n]+)/i)?.[1] || ""
    ),
    workMode,
    jobType,
    salary,
    experienceText,
    qualification,
    descriptionSummary,
    descriptionText,
    skills,
    keywords: uniqueStrings([...skills, ...tokenize(`${title} ${descriptionSummary}`)]).slice(0, 20),
    postedAt,
    applyDeadline: cleanText(findDeadline(text), 80),
  };
}

function mergeCandidate(seed, extracted, fetched, preferences) {
  const originalUrl = extracted.originalApplyLink || seed.url;
  const sourceHost = extractHostname(seed.url);
  const location = cleanText(
    extracted.location || fetched.location || seed.snippet.match(/(?:Remote|Hybrid|Onsite|On-site)/i)?.[0] || "",
    180
  );
  const locations = uniqueStrings([
    ...(extracted.locations || []),
    ...(fetched.locations || []),
    ...splitListValues(location),
  ]).slice(0, 6);
  const workMode = normalizeWorkModes([
    extracted.workMode,
    fetched.workMode,
    location,
    seed.snippet,
  ])[0] || "";
  const jobType = normalizeJobTypes([
    extracted.jobType,
    fetched.jobType,
    seed.title,
    seed.snippet,
  ])[0] || cleanText(extracted.jobType || fetched.jobType || "", 80);
  const salaryText = cleanText(extracted.salary || fetched.salary || "", 180);
  const salaryRange = extractSalaryRange(salaryText);
  const descriptionText = cleanText(fetched.descriptionText || extracted.descriptionSummary || "", 8000);
  const descriptionSummary = cleanText(
    extracted.descriptionSummary || fetched.descriptionSummary || seed.snippet,
    800
  );
  const title = cleanText(
    extracted.title || fetched.title || parseTitleFromSearchTitle(seed.title),
    200
  );
  const company = cleanText(
    extracted.company || fetched.company || parseCompanyFromSearchTitle(seed.title, sourceHost),
    180
  );
  const skills = uniqueStrings([...(extracted.skills || []), ...(fetched.skills || [])]).slice(0, 18);
  const keywords = uniqueStrings([
    ...skills,
    ...tokenize(`${title} ${company} ${descriptionSummary} ${descriptionText}`),
  ]).slice(0, 24);
  const country =
    (preferences.countries || []).find((entry) => location.toLowerCase().includes(entry.toLowerCase())) || "";
  const postedAt =
    fetched.postedAt ||
    parseRelativeDate(seed.snippet) ||
    parseRelativeDate(descriptionText.match(/(\d+\s+(?:hour|day|week|month)s?\s+ago)/i)?.[1]) ||
    null;
  const seniorityLevel = cleanText(
    extracted.experience || fetched.experienceText || title,
    120
  );

  return {
    externalJobId: createExternalJobId({
      url: originalUrl || seed.url,
      title,
      company,
      source: sourceHost,
    }),
    title,
    company,
    location,
    locations,
    country,
    workMode,
    jobType,
    salaryText,
    salaryMin: salaryRange.min,
    salaryMax: salaryRange.max,
    salaryCurrency: salaryRange.currency,
    experienceText: cleanText(extracted.experience || fetched.experienceText || "", 120),
    seniorityLevel,
    skills,
    keywords,
    descriptionSummary,
    descriptionText,
    source: cleanText(extracted.source || seed.source || sourceHost, 120),
    sourceHost,
    originalUrl: seed.url,
    applyUrl: originalUrl || seed.url,
    searchQuery: seed.query,
    searchSnippet: cleanText(seed.snippet, 240),
    postedAt,
    discoveredAt: new Date(),
    lastSeenAt: new Date(),
  };
}

function buildSearchQueries(profile, preferences) {
  const roles = uniqueStrings([
    ...(preferences.preferredRoles || []),
    ...(profile.parsedData?.preferredRoles || []),
  ]).slice(0, 3);
  const countries = (preferences.countries || []).slice(0, 2);
  const workModes = (preferences.workModes || []).slice(0, 2);
  const companies = (preferences.companyPreferences || []).slice(0, 4);
  const boards = (preferences.searchSources?.length ? preferences.searchSources : env.autoHunterSourceBoards).slice(
    0,
    6
  );
  const companyDomains = env.autoHunterCompanyDomains.slice(0, 4);
  const primaryCountry = countries[0] || "";
  const primaryMode = workModes[0] || "";
  const fallbackRole = roles[0] || "software engineer";
  const queries = [];

  for (const role of roles.length ? roles : [fallbackRole]) {
    queries.push(`"${role}" jobs ${primaryCountry} ${primaryMode}`.trim());

    for (const board of boards) {
      queries.push(`site:${board} "${role}" ${primaryCountry} ${primaryMode} job`.trim());
    }

    for (const company of companies) {
      queries.push(`"${role}" "${company}" careers ${primaryCountry} ${primaryMode}`.trim());
    }

    for (const domain of companyDomains) {
      queries.push(`site:${domain} "${role}" ${primaryCountry} ${primaryMode} job`.trim());
    }
  }

  return uniqueStrings(queries, 240).slice(0, env.autoHunterMaxQueriesPerSweep);
}

async function discoverCandidates(profile, preferences, logger = defaultLogger) {
  const queries = buildSearchQueries(profile, preferences);
  const seedMap = new Map();

  for (const query of queries) {
    try {
      const response = await searchTinyFish(query);
      for (const result of response.results || []) {
        const url = cleanText(result?.url || "", 1000);
        if (!url || seedMap.size >= env.autoHunterMaxCandidatesPerSweep) continue;

        if (!seedMap.has(url)) {
          seedMap.set(url, {
            url,
            title: cleanText(result?.title || "", 240),
            snippet: cleanText(result?.snippet || "", 240),
            source: cleanText(result?.site_name || extractHostname(url), 120),
            host: extractHostname(url),
            query,
          });
        }
      }
    } catch (error) {
      logger.warn("[auto-hunter] TinyFish search query failed", { query, message: error.message });
    }
  }

  const urls = Array.from(seedMap.keys()).slice(0, env.autoHunterMaxCandidatesPerSweep);
  const fetchedPages = await runFetchBatches(urls, logger);
  const candidates = [];

  await runInBatches(urls, 4, async (url) => {
    const seed = seedMap.get(url);
    if (!seed) return;

    const extracted = await extractJobFieldsFromUrl(url);
    const fetched = parseFetchedPage(fetchedPages.get(url), seed);
    const candidate = mergeCandidate(seed, extracted, fetched, preferences);
    if (!candidate.title || !candidate.company) return;
    candidates.push(candidate);
  });

  return {
    queries,
    candidates,
  };
}

async function runFetchBatches(urls, logger) {
  const map = new Map();
  if (!hasTinyFishConfig()) return map;

  for (let index = 0; index < urls.length; index += 10) {
    const group = urls.slice(index, index + 10);
    try {
      const fetched = await fetchTinyFishPages(group);
      for (const [key, value] of fetched.entries()) {
        map.set(key, value);
      }
    } catch (error) {
      logger.warn("[auto-hunter] TinyFish fetch batch failed", { message: error.message });
    }
  }

  return map;
}

async function createAlertLog(entry) {
  try {
    return await AlertLog.create(entry);
  } catch (error) {
    if (error?.code === 11000) {
      return null;
    }
    throw error;
  }
}

async function notifyImmediateMatch(user, preferences, matchedJob) {
  const alertSettings = preferences.alertSettings || {};
  const minimumInstantScore = Math.max(
    Number(alertSettings.minimumMatchScore) || 0,
    env.autoHunterImmediateAlertThreshold
  );
  if (!user.emailNotifications || !alertSettings.emailEnabled || !alertSettings.immediateAlertsEnabled) {
    await createAlertLog({
      user: user._id,
      matchedJob: matchedJob._id,
      channel: "email",
      type: "instant",
      status: "skipped",
      score: matchedJob.match.score,
      reason: "Email alerts are disabled",
      dedupeKey: `instant:${matchedJob._id}:disabled`,
      sentAt: new Date(),
    });
    return false;
  }

  if (matchedJob.match.score < minimumInstantScore) {
    return false;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const sentToday = await AlertLog.countDocuments({
    user: user._id,
    channel: "email",
    type: "instant",
    status: "sent",
    createdAt: { $gte: todayStart },
  });

  if (sentToday >= alertSettings.maxAlertsPerDay) {
    await createAlertLog({
      user: user._id,
      matchedJob: matchedJob._id,
      channel: "email",
      type: "instant",
      status: "skipped",
      score: matchedJob.match.score,
      reason: "Daily alert limit reached",
      dedupeKey: `instant:${matchedJob._id}:daily-limit`,
      sentAt: new Date(),
    });
    return false;
  }

  const dedupeKey = `instant:${matchedJob._id}:${matchedJob.externalJobId}`;
  const existing = await AlertLog.findOne({ dedupeKey }).select("_id").lean();
  if (existing) return false;

  try {
    const email = buildAutoHunterMatchEmail({
      userName: user.name || "there",
      match: matchedJob,
    });

    await sendMail({
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    matchedJob.notifiedAt = new Date();
    if (matchedJob.status === "new") {
      matchedJob.status = "emailed";
    }
    await matchedJob.save();

    await createAlertLog({
      user: user._id,
      matchedJob: matchedJob._id,
      channel: "email",
      type: "instant",
      status: "sent",
      score: matchedJob.match.score,
      reason: freshnessUrgencyLabel(matchedJob.postedAt || matchedJob.discoveredAt),
      dedupeKey,
      sentAt: new Date(),
      meta: {
        title: matchedJob.title,
        company: matchedJob.company,
      },
    });

    return true;
  } catch (error) {
    await createAlertLog({
      user: user._id,
      matchedJob: matchedJob._id,
      channel: "email",
      type: "instant",
      status: "failed",
      score: matchedJob.match.score,
      reason: error.message,
      dedupeKey,
      sentAt: new Date(),
    });
    throw error;
  }
}

function buildStorageThreshold(preferences) {
  const minimum = Number(preferences.alertSettings?.minimumMatchScore) || env.autoHunterMinAlertScore;
  return Math.max(45, minimum - 20);
}

function scanCooldownThreshold(now = new Date()) {
  return new Date(now.getTime() - env.autoHunterMinScanIntervalMinutes * 60 * 1000);
}

function mapMatchForClient(document) {
  if (!document) return null;

  return {
    id: document._id.toString(),
    title: document.title,
    company: document.company,
    location: document.location,
    locations: document.locations || [],
    country: document.country,
    workMode: document.workMode,
    jobType: document.jobType,
    salaryText: document.salaryText,
    source: document.source,
    sourceHost: document.sourceHost,
    applyUrl: document.applyUrl,
    originalUrl: document.originalUrl,
    descriptionSummary: document.descriptionSummary,
    skills: document.skills || [],
    status: document.status,
    notifiedAt: document.notifiedAt,
    postedAt: document.postedAt,
    discoveredAt: document.discoveredAt,
    trackedJob: document.trackedJob ? String(document.trackedJob) : "",
    match: {
      score: document.match?.score || 0,
      qualityLabel: document.match?.qualityLabel || "",
      reasons: document.match?.reasons || [],
      missingSkills: document.match?.missingSkills || [],
      atsKeywordSimilarity: document.match?.atsKeywordSimilarity || 0,
      urgencyLabel: freshnessUrgencyLabel(document.postedAt || document.discoveredAt),
      componentScores: document.match?.componentScores || {},
    },
  };
}

function mapSavedJobForClient(document) {
  if (!document) return null;
  return {
    id: document._id.toString(),
    matchedJob: document.matchedJob ? String(document.matchedJob) : "",
    externalJobId: document.externalJobId,
    title: document.title,
    company: document.company,
    source: document.source,
    applyUrl: document.applyUrl,
    notes: document.notes,
    savedAt: document.savedAt,
  };
}

function mapAlertLogForClient(document) {
  if (!document) return null;
  return {
    id: document._id.toString(),
    matchedJob: document.matchedJob ? String(document.matchedJob) : "",
    channel: document.channel,
    type: document.type,
    status: document.status,
    score: document.score,
    reason: document.reason,
    sentAt: document.sentAt,
    createdAt: document.createdAt,
    meta: document.meta || {},
  };
}

export async function saveResumeProfileForUser(user, file, { runInitialScan = true, logger = defaultLogger } = {}) {
  const { extractedText, parsedData } = await parseResumeProfile({
    buffer: file.buffer,
    mimetype: file.mimetype,
    fileName: file.originalname,
  });
  const resumeUrl = await uploadToCloudinary(file.buffer, file.mimetype, file.originalname);

  const textHash = crypto.createHash("sha256").update(extractedText).digest("hex");
  const profile = await ResumeProfile.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        resumeUrl,
        fileName: cleanText(file.originalname || "", 180),
        mimeType: cleanText(file.mimetype || "", 120),
        extractedText,
        parsedData: {
          ...parsedData,
          parserModel: parsedData.parserModel || process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
          textHash,
        },
        lastParsedAt: new Date(),
        isActive: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const { document, value } = await getOrCreateJobPreferences(user, profile);
  const warnings = [];
  let initialScan = null;

  if (runInitialScan) {
    if (!hasTinyFishConfig()) {
      warnings.push("Resume parsed, but TinyFish is not configured yet, so live job discovery is waiting.");
    } else {
      initialScan = await runAutoHunterForUser(user, { logger, force: true });
    }
  }

  return {
    profile: sanitizeResumeProfile(profile),
    preferences: sanitizeJobPreferences(document, value),
    initialScan,
    warnings,
  };
}

export async function getResumeProfileForUser(user) {
  const profile = await ResumeProfile.findOne({ user: user._id }).lean();
  return sanitizeResumeProfile(profile);
}

export async function updateResumeProfileForUser(user, input) {
  const parsedDataUpdates = {};
  if (input.githubUrl !== undefined) parsedDataUpdates['parsedData.githubUrl'] = input.githubUrl;
  if (input.linkedinUrl !== undefined) parsedDataUpdates['parsedData.linkedinUrl'] = input.linkedinUrl;
  if (input.portfolioUrl !== undefined) parsedDataUpdates['parsedData.portfolioUrl'] = input.portfolioUrl;
  if (input.careerGoals !== undefined) parsedDataUpdates['parsedData.careerGoals'] = input.careerGoals;

  const profile = await ResumeProfile.findOneAndUpdate(
    { user: user._id },
    { $set: parsedDataUpdates },
    { new: true }
  ).lean();
  
  return sanitizeResumeProfile(profile);
}

export async function getJobHunterPreferencesForUser(user) {
  const profile = await ResumeProfile.findOne({ user: user._id }).lean();
  const { document, value } = await getOrCreateJobPreferences(user, profile);
  return sanitizeJobPreferences(document, value);
}

export async function updateJobHunterPreferencesForUser(user, input) {
  const profile = await ResumeProfile.findOne({ user: user._id }).lean();
  const { value: fallback } = await getOrCreateJobPreferences(user, profile);
  const next = normalizeJobHunterPreferences(input, fallback);

  const document = await JobPreferences.findOneAndUpdate(
    { user: user._id },
    { $set: next },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return sanitizeJobPreferences(document, next);
}

export async function runAutoHunterForUser(user, { logger = defaultLogger, force = false } = {}) {
  if (!hasTinyFishConfig()) {
    const error = new Error("TinyFish is not configured");
    error.statusCode = 503;
    throw error;
  }

  const profile = await ResumeProfile.findOne({ user: user._id });
  if (!profile || !profile.isActive) {
    return {
      scanned: false,
      newMatches: 0,
      alertsSent: 0,
      queries: [],
      matchesStored: 0,
    };
  }

  if (!force && profile.lastScanAt && profile.lastScanAt > scanCooldownThreshold()) {
    return {
      scanned: false,
      newMatches: 0,
      alertsSent: 0,
      queries: [],
      matchesStored: 0,
    };
  }

  const { value: preferences } = await getOrCreateJobPreferences(user, profile);
  if (!preferences.searchEnabled) {
    return {
      scanned: false,
      newMatches: 0,
      alertsSent: 0,
      queries: [],
      matchesStored: 0,
    };
  }

  profile.lastScanStatus = "running";
  await profile.save();

  try {
    const { queries, candidates } = await discoverCandidates(profile, preferences, logger);
    const externalIds = candidates.map((candidate) => candidate.externalJobId);
    const existingMatches = await MatchedJob.find({
      user: user._id,
      externalJobId: { $in: externalIds },
    });
    const existingByExternalId = new Map(
      existingMatches.map((document) => [document.externalJobId, document])
    );

    let newMatches = 0;
    let alertsSent = 0;
    let matchesStored = 0;
    const storageThreshold = buildStorageThreshold(preferences);

    for (const candidate of candidates) {
      const scored = scoreCandidateForUser(candidate, profile, preferences);
      if (scored.score < storageThreshold) continue;

      let document = existingByExternalId.get(candidate.externalJobId);
      let wasCreated = false;

      if (!document) {
        document = new MatchedJob({
          user: user._id,
          ...candidate,
          match: {
            score: scored.score,
            qualityLabel: scored.qualityLabel,
            reasons: scored.reasons,
            missingSkills: scored.missingSkills,
            atsKeywordSimilarity: scored.atsKeywordSimilarity,
            componentScores: scored.componentScores,
          },
        });
        await document.save();
        existingByExternalId.set(candidate.externalJobId, document);
        newMatches += 1;
        wasCreated = true;
      } else {
        document.title = candidate.title;
        document.company = candidate.company;
        document.location = candidate.location;
        document.locations = candidate.locations;
        document.country = candidate.country;
        document.workMode = candidate.workMode;
        document.jobType = candidate.jobType;
        document.salaryText = candidate.salaryText;
        document.salaryMin = candidate.salaryMin;
        document.salaryMax = candidate.salaryMax;
        document.salaryCurrency = candidate.salaryCurrency;
        document.experienceText = candidate.experienceText;
        document.seniorityLevel = candidate.seniorityLevel;
        document.skills = candidate.skills;
        document.keywords = candidate.keywords;
        document.descriptionSummary = candidate.descriptionSummary;
        document.descriptionText = candidate.descriptionText;
        document.source = candidate.source;
        document.sourceHost = candidate.sourceHost;
        document.originalUrl = candidate.originalUrl;
        document.applyUrl = candidate.applyUrl;
        document.searchQuery = candidate.searchQuery;
        document.searchSnippet = candidate.searchSnippet;
        document.postedAt = candidate.postedAt || document.postedAt;
        document.lastSeenAt = new Date();
        document.match = {
          score: scored.score,
          qualityLabel: scored.qualityLabel,
          reasons: scored.reasons,
          missingSkills: scored.missingSkills,
          atsKeywordSimilarity: scored.atsKeywordSimilarity,
          componentScores: scored.componentScores,
        };
        await document.save();
      }

      matchesStored += 1;

      if (wasCreated || !document.notifiedAt) {
        try {
          const notified = await notifyImmediateMatch(user, preferences, document);
          if (notified) alertsSent += 1;
        } catch (error) {
          logger.error("[auto-hunter] Match email failed", {
            matchId: document._id.toString(),
            message: error.message,
          });
        }
      }
    }

    profile.lastScanAt = new Date();
    profile.lastScanStatus = "completed";
    profile.lastScanSummary = `Stored ${matchesStored} matches across ${queries.length} queries`;
    await profile.save();

    return {
      scanned: true,
      newMatches,
      alertsSent,
      queries,
      matchesStored,
    };
  } catch (error) {
    profile.lastScanAt = new Date();
    profile.lastScanStatus = "failed";
    profile.lastScanSummary = cleanText(error.message || "Scan failed", 240);
    await profile.save();
    throw error;
  }
}

export async function getAutoHunterOverviewForUser(user) {
  const profile = await ResumeProfile.findOne({ user: user._id }).lean();
  const preferences = await getJobHunterPreferencesForUser(user);
  const matches = await MatchedJob.find({
    user: user._id,
    status: { $ne: "dismissed" },
  })
    .sort({ "match.score": -1, discoveredAt: -1 })
    .limit(16)
    .lean();
  const savedJobs = await SavedJob.find({ user: user._id }).sort({ savedAt: -1 }).limit(8).lean();
  const recentAlerts = await AlertLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(8).lean();

  const topCompaniesMap = new Map();
  const missingSkillMap = new Map();
  let trackedCount = 0;
  let emailedCount = 0;

  for (const match of matches) {
    if (match.status === "tracked") trackedCount += 1;
    if (match.notifiedAt) emailedCount += 1;
    if (match.company) {
      topCompaniesMap.set(match.company, (topCompaniesMap.get(match.company) || 0) + 1);
    }
    for (const skill of match.match?.missingSkills || []) {
      missingSkillMap.set(skill, (missingSkillMap.get(skill) || 0) + 1);
    }
  }

  const topCompanies = Array.from(topCompaniesMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([company, count]) => ({ company, count }));

  const skillGaps = Array.from(missingSkillMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  return {
    profile: sanitizeResumeProfile(profile),
    preferences,
    stats: {
      totalMatches: matches.length,
      newMatches: matches.filter((match) => match.status === "new" || match.status === "emailed").length,
      savedJobs: savedJobs.length,
      appliedSuggestions: trackedCount,
      emailedMatches: emailedCount,
    },
    matches: matches.map(mapMatchForClient),
    savedJobs: savedJobs.map(mapSavedJobForClient),
    topCompanies,
    skillGaps,
    recentAlerts: recentAlerts.map(mapAlertLogForClient),
  };
}

export async function listAutoHunterMatchesForUser(user, { status } = {}) {
  const query = { user: user._id };
  if (status && status !== "all") {
    query.status = status;
  } else {
    query.status = { $ne: "dismissed" };
  }

  const matches = await MatchedJob.find(query)
    .sort({ "match.score": -1, discoveredAt: -1 })
    .limit(100)
    .lean();

  return matches.map(mapMatchForClient);
}

export async function saveAutoHunterMatchForUser(user, matchId) {
  if (!mongoose.isValidObjectId(matchId)) {
    const error = new Error("Invalid match id");
    error.statusCode = 400;
    throw error;
  }

  const match = await MatchedJob.findOne({ _id: matchId, user: user._id });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  await SavedJob.findOneAndUpdate(
    { user: user._id, externalJobId: match.externalJobId },
    {
      $set: {
        matchedJob: match._id,
        title: match.title,
        company: match.company,
        source: match.source,
        applyUrl: match.applyUrl,
        savedAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (match.status !== "tracked") {
    match.status = "saved";
    await match.save();
  }

  return mapMatchForClient(match);
}

export async function unsaveAutoHunterMatchForUser(user, matchId) {
  if (!mongoose.isValidObjectId(matchId)) {
    const error = new Error("Invalid match id");
    error.statusCode = 400;
    throw error;
  }

  const match = await MatchedJob.findOne({ _id: matchId, user: user._id });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  await SavedJob.deleteOne({ user: user._id, externalJobId: match.externalJobId });
  if (match.status === "saved") {
    match.status = match.notifiedAt ? "emailed" : "new";
    await match.save();
  }

  return mapMatchForClient(match);
}

export async function dismissAutoHunterMatchForUser(user, matchId) {
  if (!mongoose.isValidObjectId(matchId)) {
    const error = new Error("Invalid match id");
    error.statusCode = 400;
    throw error;
  }

  const match = await MatchedJob.findOne({ _id: matchId, user: user._id });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  match.status = "dismissed";
  await match.save();
  await SavedJob.deleteOne({ user: user._id, externalJobId: match.externalJobId });

  return mapMatchForClient(match);
}

export async function trackAutoHunterMatchForUser(user, matchId) {
  if (!mongoose.isValidObjectId(matchId)) {
    const error = new Error("Invalid match id");
    error.statusCode = 400;
    throw error;
  }

  const match = await MatchedJob.findOne({ _id: matchId, user: user._id });
  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  if (match.trackedJob) {
    match.status = "tracked";
    await match.save();
    return mapMatchForClient(match);
  }

  const preferences = await getJobHunterPreferencesForUser(user);
  const createdJob = await createJobForUser(user, {
    title: match.title,
    company: match.company,
    location: match.location,
    locations: match.locations,
    jobType: match.jobType,
    salary: match.salaryText,
    expectedSalary: preferences.salaryExpectation?.label || "",
    experience: match.experienceText,
    workMode: formatWorkMode(match.workMode),
    source: match.source,
    skills: match.skills,
    descriptionSummary: match.descriptionSummary,
    originalApplyLink: match.applyUrl || match.originalUrl,
    confidenceScore: match.match.score,
    notes: `Imported from AI Resume Auto Job Hunter. Apply via ${match.applyUrl || match.originalUrl}`,
  });

  match.trackedJob = createdJob._id;
  match.status = "tracked";
  await match.save();

  return {
    match: mapMatchForClient(match),
    trackedJobId: createdJob._id.toString(),
  };
}

export async function getAutoHunterHistoryForUser(user) {
  const matches = await MatchedJob.find({ user: user._id })
    .sort({ updatedAt: -1 })
    .limit(30)
    .lean();
  const alerts = await AlertLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(30).lean();
  const savedJobs = await SavedJob.find({ user: user._id }).sort({ savedAt: -1 }).limit(20).lean();

  return {
    matches: matches.map(mapMatchForClient),
    alerts: alerts.map(mapAlertLogForClient),
    savedJobs: savedJobs.map(mapSavedJobForClient),
  };
}

export async function getAutoHunterSkillInsightsForUser(user) {
  const profile = await ResumeProfile.findOne({ user: user._id }).lean();
  const matches = await MatchedJob.find({
    user: user._id,
    status: { $ne: "dismissed" },
    "match.score": { $gte: 60 },
  }).lean();

  const skillCounts = new Map();
  const roleCounts = new Map();
  const companyCounts = new Map();

  for (const match of matches) {
    for (const skill of match.match?.missingSkills || []) {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    }

    if (match.title) {
      roleCounts.set(match.title, (roleCounts.get(match.title) || 0) + 1);
    }

    if (match.company) {
      companyCounts.set(match.company, (companyCounts.get(match.company) || 0) + 1);
    }
  }

  const missingSkills = Array.from(skillCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 12)
    .map(([skill, count]) => ({ skill, count }));

  const recommendedImprovements = uniqueStrings([
    ...(profile?.parsedData?.suggestedResumeImprovements || []),
    missingSkills.length
      ? `Add evidence around ${missingSkills
          .slice(0, 3)
          .map((item) => item.skill)
          .join(", ")} if you have relevant experience.`
      : "",
    missingSkills.length
      ? `Tune your summary and skills sections for ${missingSkills[0].skill} related roles.`
      : "",
  ]).slice(0, 6);

  const topRoles = Array.from(roleCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([role, count]) => ({ role, count }));

  const topCompanies = Array.from(companyCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([company, count]) => ({ company, count }));

  return {
    missingSkills,
    recommendedImprovements,
    topRoles,
    topCompanies,
    currentSkills: profile?.parsedData?.skills || [],
  };
}
