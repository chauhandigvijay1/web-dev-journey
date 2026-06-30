(function () {
  'use strict';

  var WEB_APP_URL = 'https://jobpilot-client-chi.vercel.app';
  var API_BASE_URL = 'https://web-dev-journey-cnee.onrender.com/api';
  var AUTH_TOKEN_KEY = 'jobpilot_token';
  var TOKEN_EXPIRY_KEY = 'jobpilot_token_exp';
  var API_BASE_URL_KEY = 'jobpilot_api_base_url';
  var PARSE_TIMEOUT_MS = 10000;
  var cachedJobData = null;

  // ─── In-Memory Storage Fallback ──────────────────────────────────────────
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

  function tryStorageRemove(keys) {
    try {
      chrome.storage.local.remove(keys);
    } catch (e) {
      // in-memory fallback
    }
    var keyArr = Array.isArray(keys) ? keys : [keys];
    for (var i = 0; i < keyArr.length; i++) {
      memoryStore.delete(keyArr[i]);
    }
    return Promise.resolve();
  }

  // ─── DOM Helpers ─────────────────────────────────────────────────────────

  var $ = function (id) { return document.getElementById(id); };

  function show(id) {
    var sections = [
      'loading-state',
      'job-detected',
      'no-job',
      'error-state',
      'signed-out',
      'save-section',
      'saved-state',
      'connection-status',
    ];
    for (var i = 0; i < sections.length; i++) {
      var el = $(sections[i]);
      if (el) el.style.display = sections[i] === id ? 'block' : 'none';
    }
  }

  function setStatus(msg, type) {
    type = type || '';
    var el = $('status-msg');
    if (el) {
      el.textContent = msg;
      el.className = 'status' + (type ? ' ' + type : '');
    }
  }

  function setConnectionStatus(connected, count) {
    var el = $('connection-status');
    if (!el) return;
    if (connected) {
      var countText =
        count >= 0 ? count + ' job' + (count !== 1 ? 's' : '') + ' saved' : 'Connected';
      el.innerHTML =
        '<span class="dot connected"></span> ' + countText;
    } else {
      el.innerHTML =
        '<span class="dot disconnected"></span> Not connected';
    }
    el.style.display = 'block';
  }

  // ─── Auth Check ──────────────────────────────────────────────────────────

  function fetchWithTimeout(url, options, timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, Object.assign({}, options, { signal: controller.signal }))
      .then(function (res) {
        clearTimeout(timeoutId);
        return res;
      })
      .catch(function (err) {
        clearTimeout(timeoutId);
        throw err;
      });
  }

  function checkAuth() {
    return tryStorageGet([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]).then(function (result) {
      var token = result[AUTH_TOKEN_KEY];
      var exp = result[TOKEN_EXPIRY_KEY];
      var baseUrl = result[API_BASE_URL_KEY] || API_BASE_URL;
      if (!token) return { authed: false };
      if (exp && Date.now() >= exp) {
        return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]).then(function () {
          return { authed: false };
        });
      }
      // Verify token with server
      return fetchWithTimeout(baseUrl + '/jobs?limit=1', {
        headers: { Authorization: 'Bearer ' + token },
      }, 5000)
        .then(function (res) {
          if (res.status === 401) {
            return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY, API_BASE_URL_KEY]).then(function () {
              return { authed: false };
            });
          }
          return { authed: true };
        })
        .catch(function () {
          // Server unreachable — trust local token as cached state
          return { authed: true, offline: true };
        });
    });
  }

  // ─── Parse Current Tab ───────────────────────────────────────────────────

  function parseCurrentTab() {
    return chrome.tabs
      .query({ active: true, currentWindow: true })
      .then(function (tabs) {
        if (!tabs || !tabs[0] || !tabs[0].id) return null;
        return tabs[0].id;
      })
      .then(function (tabId) {
        if (!tabId) return null;
        // Wrapper with timeout
        function sendWithTimeout(tabId) {
          return new Promise(function (resolve, reject) {
            var timedOut = false;
            var timeoutId = setTimeout(function () {
              timedOut = true;
              reject(new Error('Parse timeout'));
            }, PARSE_TIMEOUT_MS);
            chrome.tabs.sendMessage(tabId, { action: 'PARSE_JOB' }, function (response) {
              if (timedOut) return;
              clearTimeout(timeoutId);
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else if (response && response.success && response.data) {
                resolve(response.data);
              } else {
                resolve(null);
              }
            });
          });
        }
        return sendWithTimeout(tabId)
          .catch(function () {
            // Content script not loaded; inject it
            return chrome.scripting
              .executeScript({ target: { tabId: tabId }, files: ['content.js'] })
              .then(function () {
                return sendWithTimeout(tabId);
              })
              .catch(function () { return null; });
          });
      });
  }

  // ─── Get Status from Background ──────────────────────────────────────────

  function getBackgroundStatus() {
    return new Promise(function (resolve) {
      chrome.runtime.sendMessage({ action: 'GET_STATUS' }, function (response) {
        if (chrome.runtime.lastError) {
          resolve({ authenticated: false, jobCount: 0 });
        } else {
          resolve(response || { authenticated: false, jobCount: 0 });
        }
      });
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    show('loading-state');

    Promise.all([checkAuth(), parseCurrentTab(), getBackgroundStatus()])
      .then(function (results) {
        var authState = results[0];
        var jobData = results[1];
        var bgStatus = results[2];
        var isAuthed = authState && authState.authed;

        cachedJobData = jobData;

        setConnectionStatus(
          bgStatus && bgStatus.authenticated,
          bgStatus ? bgStatus.jobCount : -1
        );

        if (!jobData || !jobData.title) {
          show('no-job');
          if (isAuthed) {
            var saveSection = $('save-section');
            if (saveSection) saveSection.style.display = 'none';
          } else {
            show('signed-out');
          }
          return;
        }

        var titleEl = $('job-title');
        var companyEl = $('job-company');
        var locationEl = $('job-location');
        var sourceEl = $('job-source');
        if (titleEl) titleEl.textContent = jobData.title;
        if (companyEl) companyEl.textContent = jobData.company || 'Unknown company';
        if (locationEl) locationEl.textContent = jobData.location || '';
        if (sourceEl) sourceEl.textContent = jobData.source || 'job board';

        if (!isAuthed) {
          show('job-detected');
          var signedOutEl = $('signed-out');
          if (signedOutEl) signedOutEl.style.display = 'block';
          var saveSection = $('save-section');
          if (saveSection) saveSection.style.display = 'none';
          return;
        }

        show('job-detected');
        var saveSection = $('save-section');
        if (saveSection) saveSection.style.display = 'block';
        var saveBtn = $('save-btn');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Save to JobPilot';
        }
      })
      .catch(function (err) {
        show('error-state');
        var errMsgEl = $('error-message');
        if (errMsgEl) errMsgEl.textContent = (err && err.message) || 'Could not load page data.';
        setConnectionStatus(false, -1);
      });
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────

  var signInBtn = $('sign-in-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', function () {
      chrome.tabs.create({ url: WEB_APP_URL + '/login' });
      window.close();
    });
  }

  var saveBtn = $('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async function () {
      var btn = $('save-btn');
      if (!btn) return;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Saving...';
      setStatus('');

      try {
        var saveData = cachedJobData;
        if (!saveData || !saveData.title) {
          saveData = await parseCurrentTab();
        }
        if (!saveData || !saveData.title) {
          setStatus('Could not parse this page.', 'error');
          btn.disabled = false;
          btn.textContent = 'Save to JobPilot';
          return;
        }

        var response = await new Promise(function (resolve, reject) {
          chrome.runtime.sendMessage(
            { action: 'SAVE_JOB', payload: saveData },
            function (resp) {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else {
                resolve(resp);
              }
            }
          );
        });

        if (response && response.success) {
          show('saved-state');
          var savedMeta = $('saved-meta');
          if (savedMeta) {
            savedMeta.textContent =
              saveData.title + ' \u00B7 ' + (saveData.company || 'Unknown');
          }
          if (response.duplicate) {
            var savedState = $('saved-state');
            if (savedState) {
              var firstText = savedState.querySelector('.card-text:first-child');
              if (firstText) firstText.textContent = '\u2713 Already saved';
            }
          }
          setStatus('');
        } else {
          setStatus(
            (response && response.message) || 'Could not save job.',
            'error'
          );
          btn.disabled = false;
          btn.textContent = 'Save to JobPilot';
        }
      } catch (err) {
        setStatus(err && err.message ? err.message : 'An error occurred.', 'error');
        btn.disabled = false;
        btn.textContent = 'Save to JobPilot';
      }
    });
  }

  var dashboardBtn = $('dashboard-btn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', function () {
      chrome.tabs.create({ url: WEB_APP_URL + '/dashboard' });
      window.close();
    });
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
