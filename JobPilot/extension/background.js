const API_BASE_URL = "https://web-dev-journey-cnee.onrender.com/api";
const AUTH_TOKEN_KEY = "jobpilot_token";
const API_BASE_URL_KEY = "jobpilot_api_base_url";
const TOKEN_EXPIRY_KEY = "jobpilot_token_exp";

function cleanText(value, maxLength = 1000) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

function getTokenExpiry(token) {
  const payload = decodeJwt(token);
  return payload?.exp ? payload.exp * 1000 : null;
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
  const result = await chrome.storage.local.get([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
  const token = cleanText(result[AUTH_TOKEN_KEY], 2000);
  const exp = result[TOKEN_EXPIRY_KEY];
  if (token && exp && Date.now() >= exp) {
    await chrome.storage.local.remove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]);
    return "";
  }
  return token;
}

async function getApiBaseUrl() {
  const result = await chrome.storage.local.get(API_BASE_URL_KEY);
  return cleanText(result[API_BASE_URL_KEY], 1000) || API_BASE_URL;
}

async function saveToken(token, apiBaseUrl) {
  const exp = getTokenExpiry(token);
  const store = { [AUTH_TOKEN_KEY]: token };
  if (apiBaseUrl) store[API_BASE_URL_KEY] = apiBaseUrl;
  if (exp) store[TOKEN_EXPIRY_KEY] = exp;
  await chrome.storage.local.set(store);
}

async function removeToken() {
  await chrome.storage.local.remove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]);
}

async function requestTokenSync() {
  const tabs = await chrome.tabs.query({ url: [
    "https://jobpilot-client-chi.vercel.app/*",
    "http://localhost:*/*",
  ]});
  for (const tab of tabs) {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "REQUEST_TOKEN_SYNC" });
    } catch {
      // tab not ready
    }
  }
}

async function saveJob(payload) {
  let token = await getStoredToken();
  if (!token) {
    await requestTokenSync();
    token = await getStoredToken();
    if (!token) {
      return {
        success: false,
        message: "Open JobPilot while signed in, then try again.",
      };
    }
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

  if (response.status === 401) {
    await removeToken();
    await requestTokenSync();
    token = await getStoredToken();
    if (token) {
      const retry = await fetch(`${apiBaseUrl}/jobs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (retry.ok) {
        const retryData = await retry.json().catch(() => null);
        return {
          success: true,
          job: retryData?.data?.job || null,
        };
      }
      return {
        success: false,
        message: "Session expired. Please refresh JobPilot and try again.",
      };
    }
    return {
      success: false,
      message: "Session expired. Please sign in to JobPilot again.",
    };
  }

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
      saveToken(token, apiBaseUrl);
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
