'use strict';

// ─── Constants ────────────────────────────────────────────────────────────────
var API_BASE_URL_DEFAULT = 'https://web-dev-journey-cnee.onrender.com/api';
var AUTH_TOKEN_KEY = 'jobpilot_token';
var API_BASE_URL_KEY = 'jobpilot_api_base_url';
var TOKEN_EXPIRY_KEY = 'jobpilot_token_exp';
var FETCH_TIMEOUT_MS = 10000;
var FETCH_RETRIES = 3;
var MAX_TOKEN_TTL_DAYS = 7;

// ─── In-Memory Storage Fallback ──────────────────────────────────────────────
var memoryStore = new Map();

function tryStorageGet(keys) {
  try {
    return Promise.resolve(chrome.storage.local.get(keys));
  } catch (e) {
    var result = {};
    var keyArr = Array.isArray(keys) ? keys : [keys];
    for (var i = 0; i < keyArr.length; i++) {
      var k = keyArr[i];
      if (typeof k === 'string') result[k] = memoryStore.get(k);
    }
    return Promise.resolve(result);
  }
}

function tryStorageSet(items) {
  for (var key in items) {
    if (Object.prototype.hasOwnProperty.call(items, key)) {
      memoryStore.set(key, items[key]);
    }
  }
  try {
    return new Promise(function (resolve) {
      chrome.storage.local.set(items, resolve);
    });
  } catch (e) {
    return Promise.resolve();
  }
}

function tryStorageRemove(keys) {
  var keyArr = Array.isArray(keys) ? keys : [keys];
  for (var i = 0; i < keyArr.length; i++) {
      memoryStore.delete(keyArr[i]);
  }
  try {
    return new Promise(function (resolve) {
      chrome.storage.local.remove(keys, resolve);
    });
  } catch (e) {
    return Promise.resolve();
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanText(value, maxLength) {
  maxLength = maxLength || 1000;
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

function isTokenExpired(token) {
  var payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  var expMs = payload.exp * 1000;
  // Also enforce hard 7d TTL from issued at
  if (payload.iat && Date.now() > (payload.iat + MAX_TOKEN_TTL_DAYS * 86400) * 1000) {
    return true;
  }
  return Date.now() >= expMs;
}

function getTokenExpiry(token) {
  var payload = decodeJwt(token);
  return payload && payload.exp ? payload.exp * 1000 : null;
}

function normalizeJobPayload(payload) {
  payload = payload || {};
  var title = cleanText(payload.title, 200);
  var company = cleanText(payload.company, 200);
  var location = cleanText(payload.location, 240);
  var description = cleanText(payload.description, 4000);
  var originalUrl = cleanText(payload.originalApplyLink || payload.originalUrl, 1000);
  var source = cleanText(payload.source, 240);
  var salary = cleanText(payload.salary, 200);
  var jobType = cleanText(payload.jobType, 100);
  var workMode = cleanText(payload.workMode, 100);

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
    originalApplyLink: originalUrl || '',
    status: 'saved',
    notes: originalUrl
      ? 'Imported from JobPilot Companion. Source: ' + originalUrl
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
  var attempt = 0;
  function doFetch() {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, Object.assign({}, options, { signal: controller.signal }))
      .then(function (response) {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        if (attempt < retries - 1) {
          attempt++;
          var delay = Math.pow(2, attempt - 1) * 1000;
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
    var token = cleanText(result[AUTH_TOKEN_KEY], 5000);
    var exp = result[TOKEN_EXPIRY_KEY];
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
  var items = {};
  items[AUTH_TOKEN_KEY] = token;
  var exp = getTokenExpiry(token);
  if (exp) items[TOKEN_EXPIRY_KEY] = exp;
  if (apiBaseUrl) items[API_BASE_URL_KEY] = apiBaseUrl;
  return tryStorageSet(items);
}

function removeToken() {
  return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]);
}

function requestTokenSync() {
  return chrome.tabs
    .query({ url: ['https://jobpilot-client-chi.vercel.app/*', 'https://*.vercel.app/*', 'http://localhost:*/*', 'https://localhost:*/*'] })
    .then(function (tabs) {
      var promises = [];
      for (var i = 0; i < tabs.length; i++) {
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
      if (!ctx.body.originalApplyLink) {
        return ctx;
      }
      return checkDuplicate(ctx.token, ctx.apiBaseUrl, ctx.body.originalApplyLink).then(function (dup) {
        if (dup) {
          return { success: true, duplicate: true };
        }
        return ctx;
      });
    })
    .then(function (ctx) {
      if (!ctx._ctx) return ctx; // duplicate or error case
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
    var token = cleanText(request.token, 5000);
    var apiBaseUrl = cleanText(request.apiBaseUrl, 1000);
    if (token && !isTokenExpired(token)) {
      saveToken(token, apiBaseUrl);
      sendResponse({ success: true });
    } else if (token) {
      // Token expired, don't save
      sendResponse({ success: false, message: 'Token expired' });
    } else {
      sendResponse({ success: false });
    }
    return false;
  }

  if (request.action === 'SAVE_JOB') {
    var dedupKey = (request.payload && (request.payload.originalApplyLink || request.payload.originalUrl || '')) || '';
    if (dedupKey && inflightSaves[dedupKey]) {
      // Duplicate in-flight request — return pending promise result
      inflightSaves[dedupKey].then(function (result) { sendResponse(result); });
      return true;
    }
    var savePromise = saveJob(request.payload)
      .then(function (result) {
        if (dedupKey) delete inflightSaves[dedupKey];
        sendResponse(result);
        return result;
      })
      .catch(function (err) {
        if (dedupKey) delete inflightSaves[dedupKey];
        sendResponse({
          success: false,
          message: (err && err.message) || 'Could not save job.',
        });
      });
    if (dedupKey) inflightSaves[dedupKey] = savePromise;
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
                // Try to get total count from response
                return res.json().catch(function () { return null; });
              })
              .then(function (data) {
                var count = 0;
                if (data && data.data && typeof data.data.total !== 'undefined') {
                  count = data.data.total;
                } else if (data && data.data && Array.isArray(data.data.jobs)) {
                  count = data.data.jobs.length;
                }
                sendResponse({
                  authenticated: true,
                  jobCount: count,
                  apiBaseUrl: apiBaseUrl,
                });
              })
              .catch(function () {
                sendResponse({
                  authenticated: true,
                  jobCount: -1,
                  apiBaseUrl: apiBaseUrl,
                });
              });
          }
          sendResponse({ authenticated: false, jobCount: 0, apiBaseUrl: apiBaseUrl });
        });
      })
      .catch(function () {
        sendResponse({ authenticated: false, jobCount: 0 });
      });
    return true;
  }

  return false;
});

// ─── Periodic Token Cleanup ──────────────────────────────────────────────────

// Use chrome.alarms for reliable periodic cleanup (service worker safe)
chrome.alarms.create('tokenCleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'tokenCleanup') {
    getStoredToken().then(function (token) {
      if (!token) {
        // Already cleaned up
      }
    });
  }
});

// ─── Storage Change Sync ─────────────────────────────────────────────────────

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (areaName !== 'local') return;
  if (changes[AUTH_TOKEN_KEY]) {
    var newValue = changes[AUTH_TOKEN_KEY].newValue;
    if (newValue) {
      memoryStore.set(AUTH_TOKEN_KEY, newValue);
    } else {
      memoryStore.delete(AUTH_TOKEN_KEY);
    }
  }
  if (changes[API_BASE_URL_KEY]) {
    var newVal = changes[API_BASE_URL_KEY].newValue;
    if (newVal) {
      memoryStore.set(API_BASE_URL_KEY, newVal);
    } else {
      memoryStore.delete(API_BASE_URL_KEY);
    }
  }
  if (changes[TOKEN_EXPIRY_KEY]) {
    var expVal = changes[TOKEN_EXPIRY_KEY].newValue;
    if (expVal) {
      memoryStore.set(TOKEN_EXPIRY_KEY, expVal);
    } else {
      memoryStore.delete(TOKEN_EXPIRY_KEY);
    }
  }
});
