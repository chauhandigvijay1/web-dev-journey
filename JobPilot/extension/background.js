'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE_URL_DEFAULT = 'https://web-dev-journey-cnee.onrender.com/api';
const AUTH_TOKEN_KEY = 'jobpilot_token';
const API_BASE_URL_KEY = 'jobpilot_api_base_url';
const TOKEN_EXPIRY_KEY = 'jobpilot_token_exp';
const FETCH_TIMEOUT_MS = 10000;
const FETCH_RETRIES = 3;
const MAX_TOKEN_TTL_DAYS = 7;
const STORAGE_TIMEOUT = 10000;

// ─── In-Memory Storage Fallback ──────────────────────────────────────────────
const memoryStore = new Map();

// Prime memoryStore from persistent storage on cold start (MV3 service worker)
chrome.storage.local.get(null, function (items) {
  for (const key in items) {
    if (Object.prototype.hasOwnProperty.call(items, key)) {
      memoryStore.set(key, items[key]);
    }
  }
});

function tryStorageGet(keys) {
  try {
    return Promise.resolve(chrome.storage.local.get(keys));
  } catch (e) {
    const result = {};
    const keyArr = Array.isArray(keys) ? keys : [keys];
    for (let i = 0; i < keyArr.length; i++) {
      const k = keyArr[i];
      if (typeof k === 'string') result[k] = memoryStore.get(k);
    }
    return Promise.resolve(result);
  }
}

function tryStorageSet(items) {
  return new Promise(function (resolve) {
    let timedOut = false;
    const timer = setTimeout(function () { timedOut = true; resolve(); }, STORAGE_TIMEOUT);
    chrome.storage.local.set(items, function () {
      if (timedOut) return;
      clearTimeout(timer);
      if (!chrome.runtime.lastError) {
        for (const key in items) {
          if (Object.prototype.hasOwnProperty.call(items, key)) {
            memoryStore.set(key, items[key]);
          }
        }
      }
      resolve();
    });
  });
}

function tryStorageRemove(keys) {
  return new Promise(function (resolve) {
    let timedOut = false;
    const timer = setTimeout(function () { timedOut = true; resolve(); }, STORAGE_TIMEOUT);
    chrome.storage.local.remove(keys, function () {
      if (timedOut) return;
      clearTimeout(timer);
      if (!chrome.runtime.lastError) {
        const keyArr = Array.isArray(keys) ? keys : [keys];
        for (let i = 0; i < keyArr.length; i++) {
          memoryStore.delete(keyArr[i]);
        }
      }
      resolve();
    });
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanText(value, maxLength) {
  maxLength = maxLength || 1000;
  let str = String(value || '').trim().replace(/\s+/g, ' ');
  let segments = [];
  try {
    segments = [...new Intl.Segmenter().segment(str)];
  } catch (e) {
    segments = Array.from(str).map(function (c) { return { segment: c }; });
  }
  return segments.slice(0, maxLength).map(function (s) { return s.segment; }).join('');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try {
    return atob(str);
  } catch (e) {
    return null;
  }
}

function decodeJwt(token) {
  try {
    const encoded = token.split('.')[1];
    if (!encoded) return null;
    const decoded = base64UrlDecode(encoded);
    return decoded ? JSON.parse(decoded) : null;
  } catch (e) {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  const expMs = payload.exp * 1000;
  // Also enforce hard 7d TTL from issued at
  if (payload.iat && Date.now() > (payload.iat + MAX_TOKEN_TTL_DAYS * 86400) * 1000) {
    return true;
  }
  return Date.now() >= expMs;
}

function getTokenExpiry(token) {
  const payload = decodeJwt(token);
  return payload && payload.exp ? payload.exp * 1000 : null;
}

function normalizeJobPayload(payload) {
  payload = payload || {};
  const title = cleanText(payload.title, 200);
  const company = cleanText(payload.company, 200);
  const location = cleanText(payload.location, 240);
  const description = cleanText(payload.description, 4000);
  const pageUrl = cleanText(payload.originalUrl, 1000);
  const applyLink = cleanText(payload.originalApplyLink, 1000);
  const source = cleanText(payload.source, 240);
  const salary = cleanText(payload.salary, 200);
  const jobType = cleanText(payload.jobType, 100);
  const workMode = cleanText(payload.workMode, 100);

  return {
    title: title,
    company: company,
    location: location,
    locations: location ? location.split(/[,;]\s*/).filter(Boolean) : [],
    source: source,
    salary: salary,
    jobType: jobType,
    workMode: workMode,
    descriptionSummary: description,
    originalApplyLink: applyLink || pageUrl || '',
    status: 'saved',
    notes: (pageUrl || applyLink)
      ? 'Imported from JobPilot Companion. Source: ' + (pageUrl || applyLink)
      : 'Imported from JobPilot Companion.',
    skills: Array.isArray(payload.skills)
      ? payload.skills.map(function (s) { return cleanText(s, 120); }).filter(Boolean)
      : [],
  };
}

// ─── Fetch with Timeout + Retry ──────────────────────────────────────────────

function fetchWithRetry(url, options, retries, timeoutMs) {
  options = options || {};
  retries = retries || FETCH_RETRIES;
  timeoutMs = timeoutMs || FETCH_TIMEOUT_MS;
  let attempt = 0;
  function doFetch() {
    const controller = new AbortController();
    const timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, Object.assign({}, options, { signal: controller.signal }))
      .then(function (response) {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
          if (attempt < retries - 1) {
            attempt++;
            const delay = Math.pow(2, attempt - 1) * 1000;
          return new Promise(function (resolve) { setTimeout(resolve, delay); }).then(doFetch);
        }
        throw err;
      });
  }
  return doFetch();
}

// ─── Token Management ────────────────────────────────────────────────────────

function getStoredToken() {
  return tryStorageGet([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY]).then(function (result) {
    const token = cleanText(result[AUTH_TOKEN_KEY], 5000);
    const exp = result[TOKEN_EXPIRY_KEY];
    if (token && exp && Date.now() >= exp) {
      return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]).then(function () {
        return '';
      });
    }
    if (token && isTokenExpired(token)) {
      return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]).then(function () {
        return '';
      });
    }
    return token;
  });
}

function getApiBaseUrl() {
  return tryStorageGet(API_BASE_URL_KEY).then(function (result) {
    return cleanText(result[API_BASE_URL_KEY], 1000) || API_BASE_URL_DEFAULT;
  });
}

function saveToken(token, apiBaseUrl) {
  const items = {};
  items[AUTH_TOKEN_KEY] = token;
  const exp = getTokenExpiry(token);
  if (exp) items[TOKEN_EXPIRY_KEY] = exp;
  items[API_BASE_URL_KEY] = apiBaseUrl || API_BASE_URL_DEFAULT;
  return tryStorageSet(items);
}

function removeToken() {
  return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]);
}

function requestTokenSync() {
  return chrome.tabs
    .query({ url: ['https://jobpilot-client-chi.vercel.app/*', 'http://localhost:*/*', 'https://localhost:*/*'] })
    .then(function (tabs) {
      const promises = [];
      for (let i = 0; i < tabs.length; i++) {
        promises.push(
          chrome.tabs
            .sendMessage(tabs[i].id, { action: 'REQUEST_TOKEN_SYNC' })
            .catch(function () {
              /* tab not ready */
            })
        );
      }
      return Promise.all(promises);
    });
}

// ─── Duplicate Check ─────────────────────────────────────────────────────────

function checkDuplicate(token, apiBaseUrl, originalUrl) {
  if (!originalUrl) return Promise.resolve(false);
  var params = new URLSearchParams({ limit: '1', originalApplyLink: originalUrl });
  return fetchWithRetry(apiBaseUrl + '/jobs?' + params.toString(), {
    headers: { Authorization: 'Bearer ' + token },
  })
    .then(function (res) { return res.json().catch(function () { return null; }); })
    .then(function (data) {
      return !!(data && data.success && data.data && data.data.jobs && data.data.jobs.length > 0);
    })
    .catch(function () { return false; });
}

// ─── Save Job ─────────────────────────────────────────────────────────────────

function saveJob(payload) {
  return getStoredToken()
    .then(function (token) {
      if (!token) {
        return requestTokenSync().then(function () { return getStoredToken(); });
      }
      return token;
    })
    .then(function (token) {
      if (!token) {
        return { success: false, message: 'Open JobPilot while signed in, then try again.' };
      }
      var body = normalizeJobPayload(payload);
      if (!body.title) {
        return { success: false, message: 'Could not find a job title on this page.' };
      }
      return getApiBaseUrl().then(function (apiBaseUrl) {
        return { token: token, body: body, apiBaseUrl: apiBaseUrl, _ctx: true };
      });
    })
    .then(function (ctx) {
      if (!ctx._ctx) return ctx; // passthrough error
      return doSaveJob(ctx.token, ctx.body, ctx.apiBaseUrl);
    });
}

function doSaveJob(token, body, apiBaseUrl) {
  return fetchWithRetry(apiBaseUrl + '/jobs', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
    .then(function (response) {
      if (response.status === 401) {
        return handle401AndRetry(body, apiBaseUrl);
      }
      return response.json().catch(function () { return null; }).then(function (data) {
        if (!response.ok || (data && data.success === false)) {
          return {
            success: false,
            message: data && data.message
              ? data.message
              : 'JobPilot API returned ' + response.status,
          };
        }
        return {
          success: true,
          job: data && data.data && data.data.job ? data.data.job : null,
        };
      });
    })
    .catch(function (err) {
      return {
        success: false,
        message: err && err.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : err && err.message
            ? err.message
            : 'Could not save job.',
      };
    });
}

function handle401AndRetry(body, apiBaseUrl) {
  return removeToken()
    .then(function () { return requestTokenSync(); })
    .then(function () { return getStoredToken(); })
    .then(function (newToken) {
      if (!newToken) {
        return {
          success: false,
          message: 'Session expired. Please sign in to JobPilot again.',
        };
      }
      return fetchWithRetry(apiBaseUrl + '/jobs', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + newToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then(function (retryRes) {
        return retryRes.json().catch(function () { return null; }).then(function (retryData) {
          if (retryRes.ok && retryData && retryData.success !== false) {
            return {
              success: true,
              job: retryData && retryData.data && retryData.data.job
                ? retryData.data.job
                : null,
            };
          }
          return {
            success: false,
            message: (retryData && retryData.message) || 'Session expired. Please refresh JobPilot and try again.',
          };
        });
      });
    });
}

// ─── In-Flight Request Dedup ─────────────────────────────────────────────────

var inflightSaves = {};

// ─── Message Listener ────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'SYNC_AUTH_TOKEN') {
    (async function () {
      const token = cleanText(request.token, 5000);
      const apiBaseUrl = cleanText(request.apiBaseUrl, 1000);
      if (token && !isTokenExpired(token)) {
        await saveToken(token, apiBaseUrl);
        try { sendResponse({ success: true }); } catch (e) { /* Port closed */ }
      } else if (token) {
        try { sendResponse({ success: false, message: 'Token expired' }); } catch (e) { /* Port closed */ }
      } else {
        await removeToken();
        try { sendResponse({ success: true }); } catch (e) { /* Port closed */ }
      }
    })();
    return true;
  }

  if (request.action === 'SAVE_JOB') {
    const dedupKey = (request.payload && (request.payload.originalApplyLink || request.payload.originalUrl || '')) || '';
    if (dedupKey && inflightSaves[dedupKey]) {
      // Duplicate in-flight request — return pending promise result
      inflightSaves[dedupKey].then(function (result) {
        try { sendResponse(result); } catch (e) { /* Port closed */ }
      });
      return true;
    }
    const savePromise = saveJob(request.payload)
      .then(function (result) {
        if (dedupKey) delete inflightSaves[dedupKey];
        try { sendResponse(result); } catch (e) { /* Port closed */ }
        return result;
      })
      .catch(function (err) {
        if (dedupKey) delete inflightSaves[dedupKey];
        try {
          sendResponse({
            success: false,
            message: (err && err.message) || 'Could not save job.',
          });
        } catch (e) { /* Port closed */ }
      });
    // Assign sentinel synchronously before any async work completes
    if (dedupKey && !inflightSaves[dedupKey]) inflightSaves[dedupKey] = savePromise;
    return true;
  }

  if (request.action === 'GET_STATUS') {
    getStoredToken()
      .then(function (token) {
        return getApiBaseUrl().then(function (apiBaseUrl) {
          if (token) {
            return fetchWithRetry(apiBaseUrl + '/jobs?limit=1', {
              headers: { Authorization: 'Bearer ' + token },
            })
              .then(function (res) {
                return res.json().catch(function () { return null; });
              })
              .then(function (data) {
                let count = 0;
                if (data && data.data && typeof data.data.total !== 'undefined') {
                  count = data.data.total;
                } else if (data && data.data && Array.isArray(data.data.jobs)) {
                  count = data.data.jobs.length;
                }
                try {
                  sendResponse({
                    authenticated: true,
                    jobCount: count,
                    apiBaseUrl: apiBaseUrl,
                  });
                } catch (e) { /* Port closed */ }
              })
              .catch(function () {
                try {
                  sendResponse({
                    authenticated: true,
                    jobCount: -1,
                    apiBaseUrl: apiBaseUrl,
                  });
                } catch (e) { /* Port closed */ }
              });
          }
          try { sendResponse({ authenticated: false, jobCount: 0, apiBaseUrl: apiBaseUrl }); } catch (e) { /* Port closed */ }
        });
      })
      .catch(function () {
        try { sendResponse({ authenticated: false, jobCount: 0 }); } catch (e) { /* Port closed */ }
      });
    return true;
  }

  try { sendResponse({ success: false, message: 'Unknown action' }); } catch (e) { /* Port closed */ }
  return false;
});

// ─── Storage Change Sync ─────────────────────────────────────────────────────

// Tokens validated on each request — no periodic cleanup needed

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName !== 'local') return;
  if (changes[AUTH_TOKEN_KEY]) {
    const newValue = changes[AUTH_TOKEN_KEY].newValue;
    if (newValue) {
      memoryStore.set(AUTH_TOKEN_KEY, newValue);
    } else {
      memoryStore.delete(AUTH_TOKEN_KEY);
    }
  }
  if (changes[API_BASE_URL_KEY]) {
    const newVal = changes[API_BASE_URL_KEY].newValue;
    if (newVal) {
      memoryStore.set(API_BASE_URL_KEY, newVal);
    } else {
      memoryStore.delete(API_BASE_URL_KEY);
    }
  }
  if (changes[TOKEN_EXPIRY_KEY]) {
    const expVal = changes[TOKEN_EXPIRY_KEY].newValue;
    if (expVal) {
      memoryStore.set(TOKEN_EXPIRY_KEY, expVal);
    } else {
      memoryStore.delete(TOKEN_EXPIRY_KEY);
    }
  }
});
