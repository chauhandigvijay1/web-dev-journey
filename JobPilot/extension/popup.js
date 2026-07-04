(function () {
  'use strict';

  const WEB_APP_URL = 'https://jobpilot-client-chi.vercel.app';
  const API_BASE_URL = 'https://web-dev-journey-cnee.onrender.com/api';
  const AUTH_TOKEN_KEY = 'jobpilot_token';
  const TOKEN_EXPIRY_KEY = 'jobpilot_token_exp';
  const API_BASE_URL_KEY = 'jobpilot_api_base_url';
  const PARSE_TIMEOUT_MS = 10000;
  let cachedJobData = null;

  // ─── In-Memory Storage Fallback ──────────────────────────────────────────
  const memoryStore = new Map();

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

  function tryStorageRemove(keys) {
    return new Promise(function (resolve) {
      chrome.storage.local.remove(keys, function () {
        if (!chrome.runtime.lastError) {
          const keyArr = Array.isArray(keys) ? keys : [keys];
          for (let i = 0; i < keyArr.length; i++) {
            memoryStore.delete(keyArr[i]);
          }
        }
        resolve();
      });
    }).catch(function () {});
  }

  // ─── DOM Helpers ─────────────────────────────────────────────────────────

  const $ = function (id) { return document.getElementById(id); };

  function show(id) {
    const sections = [
      'loading-state',
      'job-detected',
      'no-job',
      'error-state',
      'signed-out',
      'save-section',
      'saved-state',
      'connection-status',
    ];
    for (let i = 0; i < sections.length; i++) {
      const el = $(sections[i]);
      if (el) el.style.display = sections[i] === id ? 'block' : 'none';
    }
  }

  function setStatus(msg, type) {
    type = type || '';
    const el = $('status-msg');
    if (el) {
      el.textContent = msg;
      el.className = 'status' + (type ? ' ' + type : '');
    }
  }

  function setConnectionStatus(connected, count) {
    const el = $('connection-status');
    if (!el) return;
    if (connected) {
      const countText =
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

  function checkAuth() {
    return tryStorageGet([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY]).then(function (result) {
      const token = result[AUTH_TOKEN_KEY];
      const exp = result[TOKEN_EXPIRY_KEY];
      if (!token) return { authed: false };
      if (exp && Date.now() >= exp) {
        return tryStorageRemove([AUTH_TOKEN_KEY, TOKEN_EXPIRY_KEY]).then(function () {
          return { authed: false };
        });
      }
      return { authed: true };
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
        function sendWithTimeout(tabId) {
          return new Promise(function (resolve, reject) {
            let timedOut = false;
            const timeoutId = setTimeout(function () {
              timedOut = true;
              reject(new Error('Parse timeout'));
            }, PARSE_TIMEOUT_MS);
            chrome.tabs.sendMessage(tabId, { action: 'PARSE_JOB' }, function (response) {
              if (timedOut) return;
              clearTimeout(timeoutId);
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
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
      try {
        chrome.runtime.sendMessage({ action: 'GET_STATUS' }, function (response) {
          if (chrome.runtime.lastError) {
            resolve({ authenticated: false, jobCount: 0 });
          } else {
            resolve(response || { authenticated: false, jobCount: 0 });
          }
        });
      } catch (e) {
        resolve({ authenticated: false, jobCount: 0 });
      }
    });
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  function init() {
    show('loading-state');

    Promise.all([checkAuth(), parseCurrentTab(), getBackgroundStatus()])
      .then(function (results) {
        const authState = results[0];
        const jobData = results[1];
        const bgStatus = results[2];
        const isAuthed = authState && authState.authed;

        cachedJobData = jobData;

        setConnectionStatus(
          bgStatus && bgStatus.authenticated,
          bgStatus ? bgStatus.jobCount : -1
        );

        if (!jobData || !jobData.title) {
          show('no-job');
          if (isAuthed) {
            const saveSection = $('save-section');
            if (saveSection) saveSection.style.display = 'none';
          } else {
            show('signed-out');
          }
          return;
        }

        const titleEl = $('job-title');
        const companyEl = $('job-company');
        const locationEl = $('job-location');
        const sourceEl = $('job-source');
        if (titleEl) titleEl.textContent = jobData.title;
        if (companyEl) companyEl.textContent = jobData.company || 'Unknown company';
        if (locationEl) locationEl.textContent = jobData.location || '';
        if (sourceEl) sourceEl.textContent = jobData.source || 'job board';

        if (!isAuthed) {
          show('job-detected');
          const signedOutEl = $('signed-out');
          if (signedOutEl) signedOutEl.style.display = 'block';
          const saveSection = $('save-section');
          if (saveSection) saveSection.style.display = 'none';
          return;
        }

        show('job-detected');
        const saveSection = $('save-section');
        if (saveSection) saveSection.style.display = 'block';
        const saveBtn = $('save-btn');
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = 'Save to JobPilot';
        }
      })
      .catch(function (err) {
        show('error-state');
        const errMsgEl = $('error-message');
        if (errMsgEl) errMsgEl.textContent = (err && err.message) || 'Could not load page data.';
        setConnectionStatus(false, -1);
      });
  }

  // ─── Event Listeners ─────────────────────────────────────────────────────

  const signInBtn = $('sign-in-btn');
  if (signInBtn) {
    signInBtn.addEventListener('click', function () {
      chrome.tabs.create({ url: WEB_APP_URL + '/login' });
      window.close();
    });
  }

  const saveBtn = $('save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async function () {
      const btn = $('save-btn');
      if (!btn) return;
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Saving...';
      setStatus('');

      try {
        let saveData = cachedJobData;
        if (!saveData || !saveData.title) {
          saveData = await parseCurrentTab();
        }
        if (!saveData || !saveData.title) {
          setStatus('Could not parse this page.', 'error');
          btn.disabled = false;
          btn.textContent = 'Save to JobPilot';
          return;
        }

        const response = await new Promise(function (resolve, reject) {
          try {
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
          } catch (e) {
            reject(e);
          }
        });

        if (response && response.success) {
          show('saved-state');
          const savedMeta = $('saved-meta');
          if (savedMeta) {
            savedMeta.textContent =
              saveData.title + ' \u00B7 ' + (saveData.company || 'Unknown');
          }
          if (response.duplicate) {
            const savedState = $('saved-state');
            if (savedState) {
              const firstText = savedState.querySelector('.card-text:first-child');
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

  const dashboardBtn = $('dashboard-btn');
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
