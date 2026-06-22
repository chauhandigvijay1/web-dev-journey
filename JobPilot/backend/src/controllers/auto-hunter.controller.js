import {
  dismissAutoHunterMatchForUser,
  getAutoHunterHistoryForUser,
  getAutoHunterOverviewForUser,
  getAutoHunterSkillInsightsForUser,
  getJobHunterPreferencesForUser,
  getResumeProfileForUser,
  listAutoHunterMatchesForUser,
  runAutoHunterForUser,
  saveAutoHunterMatchForUser,
  saveResumeProfileForUser,
  trackAutoHunterMatchForUser,
  unsaveAutoHunterMatchForUser,
  updateJobHunterPreferencesForUser,
  updateResumeProfileForUser,
} from "../services/auto-hunter/hunter.service.js";

export async function uploadResumeProfile(req, res) {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: "Resume file is required" });
  }

  const runInitialScan = req.body?.runInitialScan === true || req.body?.runInitialScan === "true";
  const result = await saveResumeProfileForUser(req.user, req.file, { runInitialScan });

  return res.status(201).json({ success: true, data: result });
}

export async function getResumeProfile(req, res) {
  const profile = await getResumeProfileForUser(req.user);
  return res.json({ success: true, data: { profile } });
}

export async function updateResumeProfile(req, res) {
  const profile = await updateResumeProfileForUser(req.user, req.body ?? {});
  return res.json({ success: true, data: { profile } });
}

export async function getJobHunterPreferences(req, res) {
  const preferences = await getJobHunterPreferencesForUser(req.user);
  return res.json({ success: true, data: { preferences } });
}

export async function updateJobHunterPreferences(req, res) {
  const preferences = await updateJobHunterPreferencesForUser(req.user, req.body ?? {});
  return res.json({ success: true, data: { preferences } });
}

export async function getAutoHunterOverview(req, res) {
  const overview = await getAutoHunterOverviewForUser(req.user);
  return res.json({ success: true, data: overview });
}

export async function listAutoHunterMatches(req, res) {
  const matches = await listAutoHunterMatchesForUser(req.user, {
    status: typeof req.query?.status === "string" ? req.query.status : "",
  });
  return res.json({ success: true, data: { matches } });
}

export async function saveAutoHunterMatch(req, res) {
  const match = await saveAutoHunterMatchForUser(req.user, req.params.id);
  return res.json({ success: true, data: { match } });
}

export async function unsaveAutoHunterMatch(req, res) {
  const match = await unsaveAutoHunterMatchForUser(req.user, req.params.id);
  return res.json({ success: true, data: { match } });
}

export async function dismissAutoHunterMatch(req, res) {
  const match = await dismissAutoHunterMatchForUser(req.user, req.params.id);
  return res.json({ success: true, data: { match } });
}

export async function trackAutoHunterMatch(req, res) {
  const result = await trackAutoHunterMatchForUser(req.user, req.params.id);
  return res.json({ success: true, data: result });
}

export async function getAutoHunterHistory(req, res) {
  const history = await getAutoHunterHistoryForUser(req.user);
  return res.json({ success: true, data: history });
}

export async function getAutoHunterSkillInsights(req, res) {
  const insights = await getAutoHunterSkillInsightsForUser(req.user);
  return res.json({ success: true, data: insights });
}

export async function runManualAutoHunterScan(req, res) {
  const result = await runAutoHunterForUser(req.user, { force: true });
  return res.json({ success: true, data: result });
}
