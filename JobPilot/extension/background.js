// JobPilot Companion Background Service Worker

const API_BASE_URL = "https://web-dev-journey-cnee.onrender.com/api";
const AUTH_TOKEN_KEY = "jobpilot_token";
const API_BASE_URL_KEY = "jobpilot_api_base_url";

function cleanText(value, maxLength = 1000) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeJobPayload(payload = {}) {
  const title = cleanText(payload.title, 200);
  const company = cleanText(payload.company, 200);
  const location = cleanText(payload.location, 240);
  const description = cleanText(payload.description, 4000);
  const originalUrl = cleanText(payload.originalUrl, 1000);
  const source = cleanText(payload.source, 240);

  return {
    title,
    company,
    location,
    locations: location ? [location] : [],
    source,
    descriptionSummary: description,
    originalApplyLink: originalUrl,
    status: "saved",
    notes: originalUrl ? `Imported from JobPilot Companion. Source: ${originalUrl}` : "Imported from JobPilot Companion.",
    skills: Array.isArray(payload.skills) ? payload.skills.map((skill) => cleanText(skill, 120)).filter(Boolean) : [],
  };
}

async function getStoredToken() {
  const result = await chrome.storage.local.get(AUTH_TOKEN_KEY);
  return cleanText(result[AUTH_TOKEN_KEY], 2000);
}

async function getApiBaseUrl() {
  const result = await chrome.storage.local.get(API_BASE_URL_KEY);
  return cleanText(result[API_BASE_URL_KEY], 1000) || API_BASE_URL;
}

async function saveJob(payload) {
  const token = await getStoredToken();
  if (!token) {
    return {
      success: false,
      message: "Open JobPilot while signed in, then try again.",
    };
  }

  const body = normalizeJobPayload(payload);
  if (!body.title) {
    return {
      success: false,
      message: "Could not find a job title on this page.",
    };
  }

  const apiBaseUrl = await getApiBaseUrl();
  const response = await fetch(`${apiBaseUrl}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) {
    return {
      success: false,
      message: data?.message || `JobPilot API returned ${response.status}`,
    };
  }

  return {
    success: true,
    job: data?.data?.job || null,
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "SYNC_AUTH_TOKEN") {
    const token = cleanText(request.token, 2000);
    const apiBaseUrl = cleanText(request.apiBaseUrl, 1000);
    if (token) {
      chrome.storage.local.set({
        [AUTH_TOKEN_KEY]: token,
        ...(apiBaseUrl ? { [API_BASE_URL_KEY]: apiBaseUrl } : {}),
      });
    }
    sendResponse({ success: Boolean(token) });
    return false;
  }

  if (request.action === "SAVE_JOB") {
    saveJob(request.payload)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({
          success: false,
          message: error?.message || "Could not save job.",
        });
      });

    return true;
  }

  return false;
});
