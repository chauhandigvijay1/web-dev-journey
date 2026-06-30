const WEB_APP_URL = "https://jobpilot-client-chi.vercel.app";

const $ = (id) => document.getElementById(id);

function show(id) {
  ["loading-state", "job-detected", "no-job", "signed-out", "save-section", "saved-state"].forEach((el) => {
    $(el).style.display = el === id ? "block" : "none";
  });
}

function setStatus(msg, type = "") {
  const el = $("status-msg");
  el.textContent = msg;
  el.className = "status" + (type ? " " + type : "");
}

async function checkAuth() {
  const result = await chrome.storage.local.get(["jobpilot_token", "jobpilot_token_exp"]);
  const token = result.jobpilot_token;
  const exp = result.jobpilot_token_exp;
  if (!token) return false;
  if (exp && Date.now() >= exp) {
    await chrome.storage.local.remove(["jobpilot_token", "jobpilot_token_exp", "jobpilot_api_base_url"]);
    return false;
  }
  return true;
}

async function parseCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "PARSE_JOB" });
    if (response?.success && response.data) return response.data;
  } catch {
    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
      const retry = await chrome.tabs.sendMessage(tab.id, { action: "PARSE_JOB" });
      if (retry?.success && retry.data) return retry.data;
    } catch {
      return null;
    }
  }
  return null;
}

async function init() {
  show("loading-state");
  const isAuthed = await checkAuth();
  const jobData = await parseCurrentTab();

  if (!jobData?.title) {
    show("no-job");
    if (isAuthed) {
      $("save-section").style.display = "none";
    } else {
      show("signed-out");
    }
    return;
  }

  $("job-title").textContent = jobData.title;
  $("job-company").textContent = jobData.company || "Unknown company";
  $("job-location").textContent = jobData.location ? "📍 " + jobData.location : "";
  $("job-source").textContent = jobData.source || "job board";

  if (!isAuthed) {
    show("job-detected");
    $("signed-out").style.display = "block";
    $("save-section").style.display = "none";
    return;
  }

  show("job-detected");
  $("save-section").style.display = "block";
  $("save-btn").disabled = false;
  $("save-btn").innerHTML = "Save to JobPilot";
}

$("sign-in-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: WEB_APP_URL + "/login" });
  window.close();
});

$("save-btn").addEventListener("click", async () => {
  const btn = $("save-btn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Saving...';
  setStatus("");

  try {
    const jobData = await parseCurrentTab();
    if (!jobData?.title) {
      setStatus("Could not parse this page.", "error");
      btn.disabled = false;
      btn.textContent = "Save to JobPilot";
      return;
    }

    chrome.runtime.sendMessage({ action: "SAVE_JOB", payload: jobData }, (response) => {
      if (chrome.runtime.lastError) {
        setStatus("Extension error. Try again.", "error");
        btn.disabled = false;
        btn.textContent = "Save to JobPilot";
      } else if (response?.success) {
        show("saved-state");
        $("saved-meta").textContent = jobData.title + " · " + (jobData.company || "Unknown");
        setStatus("");
      } else if (response?.duplicate) {
        show("saved-state");
        $("saved-meta").textContent = jobData.title + " · Already in your dashboard";
        $("saved-state").querySelector(".card-text:first-child").textContent = "✓ Already saved";
        setStatus("");
      } else {
        setStatus(response?.message || "Could not save job.", "error");
        btn.disabled = false;
        btn.textContent = "Save to JobPilot";
      }
    });
  } catch {
    setStatus("An error occurred.", "error");
    btn.disabled = false;
    btn.textContent = "Save to JobPilot";
  }
});

$("dashboard-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: WEB_APP_URL + "/dashboard" });
  window.close();
});

init();
