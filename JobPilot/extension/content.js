function isJobPilotApp() {
  return window.location.hostname.includes("jobpilot-client-chi.vercel.app") || window.location.hostname === "localhost";
}

function getApiBaseUrl() {
  return window.location.hostname === "localhost"
    ? "http://localhost:5051/api"
    : "https://web-dev-journey-cnee.onrender.com/api";
}

function syncToken() {
  try {
    const token = window.localStorage?.getItem("jobpilot_token");
    if (token) {
      chrome.runtime.sendMessage({ action: "SYNC_AUTH_TOKEN", token, apiBaseUrl: getApiBaseUrl() });
    }
  } catch {
    // storage unavailable
  }
}

syncToken();

window.addEventListener("jobpilot:auth-updated", syncToken);
window.addEventListener("storage", (e) => {
  if (e.key === "jobpilot_token" && e.newValue) {
    chrome.runtime.sendMessage({ action: "SYNC_AUTH_TOKEN", token: e.newValue, apiBaseUrl: getApiBaseUrl() });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "REQUEST_TOKEN_SYNC") {
    syncToken();
    sendResponse({ synced: true });
    return false;
  }

  if (request.action === "PARSE_JOB") {
    const jobData = scrapePage();
    sendResponse({ success: true, data: jobData });
    return false;
  }
});

function t(el) {
  return el ? (el.innerText || el.textContent || "").trim() : "";
}

function $(sel) {
  const el = document.querySelector(sel);
  return el ? t(el) : "";
}

function first(selectors) {
  for (const s of selectors) {
    const v = $(s);
    if (v) return v;
  }
  return "";
}

function clean(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

function findMeta(prop) {
  return document.querySelector(`meta[property="${prop}"]`)?.getAttribute("content")
    || document.querySelector(`meta[name="${prop}"]`)?.getAttribute("content")
    || "";
}

function titleFromUrl() {
  const path = window.location.pathname;
  const segments = path.replace(/\/+$/, "").split("/").filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = decodeURIComponent(segments[i])
      .replace(/[-_]/g, " ")
      .replace(/(?:job|position|career|opening|vacancy|req|id)-\d+/gi, "")
      .trim();
    if (seg.length > 10 && seg.length < 150) {
      return seg.replace(/\b(job|position|hiring|career|opening|vacancy)\b/gi, "").trim();
    }
  }
  return "";
}

function extractFromLdJson() {
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const data = JSON.parse(script.textContent);
      for (const item of [data].flat()) {
        const type = item["@type"];
        if (!type || !type.includes("JobPosting")) continue;
        const loc = item.jobLocation;
        const address = loc?.address;
        return {
          title: clean(item.title),
          company: item.hiringOrganization?.name || clean(item.hiringOrganization?.["@id"]),
          location: address?.addressLocality || address?.streetAddress || clean(loc?.name),
          description: clean(item.description),
          skills: item.skills ? (Array.isArray(item.skills) ? item.skills.map(s => clean(s)).filter(Boolean) : [clean(item.skills)]) : [],
        };
      }
    } catch {
      // continue
    }
  }
  return null;
}

function extractFromMicrodata() {
  const container = document.querySelector('[itemtype*="JobPosting"], [itemscope][itemtype*="JobPosting"]');
  if (!container) return null;
  const g = (sel) => t(container.querySelector(sel));
  return {
    title: g('[itemprop="title"]') || g('[itemprop="name"]'),
    company: g('[itemprop="hiringOrganization"] [itemprop="name"]'),
    location: g('[itemprop="jobLocation"] [itemprop="addressLocality"]'),
    description: clean(t(container.querySelector('[itemprop="description"]'))),
    skills: [],
  };
}

function findCompanyFromPage() {
  const text = document.body.innerText.slice(0, 5000);
  const patterns = [
    new RegExp("(?:at|for|with)\\s+([A-Z][A-Za-z0-9&.\\s]{2,50}?)\\s+(?:is\\s+(?:hiring|looking|seeking)|has\\s+(?:an?|the)\\s+(?:open|opportunity|position)|are\\s+hiring)", "i"),
    new RegExp("([A-Z][A-Za-z0-9&.\\s]{2,40}?)\\s+(?:is|are)\\s+hiring", "i"),
    new RegExp("(?:company|organization|firm|startup)\\s*[:\\-]?\\s*([A-Z][A-Za-z0-9&.\\s]{2,40})", "i"),
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return clean(m[1]);
  }
  return "";
}

function findLocationFromPage() {
  const text = document.body.innerText;
  const patterns = [
    /(?:location|locality|place|office|based)\s*[:\\-]?\s*([A-Z][A-Za-z\s,]{2,60}?)(?:\d|remote|hybrid|on.?site|in\s+office)/i,
    /(?:remote|hybrid|on.?site|in\s+office)\s*[:\\-]?\s*([A-Z][A-Za-z\s,]{2,60})/i,
    /\b(in|at)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2})\b/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return clean(m[1] || m[2]);
  }
  return "";
}

function findDescriptionFromPage() {
  const selectors = [
    '[itemprop="description"]',
    '[data-testid*="description"]',
    '[data-qa*="description"]',
    '[class*="description"]',
    '[class*="job-description"]',
    '[class*="job-desc"]',
    '[class*="posting-description"]',
    'article',
    '[role="main"]',
    'main',
    '#content',
    '#job-content',
    '#job-description',
  ];
  for (const sel of selectors) {
    const v = $(sel);
    if (v && v.length > 50) return v;
  }
  const allText = document.body.innerText;
  const idx = allText.search(/(?:about|description|responsibilities|requirements|qualifications|what you'll do|what we're looking for)/i);
  if (idx > 0) return allText.slice(idx, idx + 4000).trim();
  return allText.slice(0, 4000).trim();
}

function scrapePage() {
  const jsonld = extractFromLdJson();
  if (jsonld && jsonld.title && jsonld.company) {
    return { ...jsonld, source: window.location.hostname, originalUrl: window.location.href };
  }

  const microdata = extractFromMicrodata();
  if (microdata && microdata.title) {
    return { ...microdata, source: window.location.hostname, originalUrl: window.location.href };
  }

  const result = { title: "", company: "", location: "", description: "", skills: [] };

  result.title = first([
    'h1[class*="title"]',
    'h1[data-testid*="title"]',
    'h1',
    'h2[class*="title"]',
    '[class*="job-title"]',
    '[class*="posting-title"]',
    '[data-testid*="jobTitle"]',
    '[itemprop="title"]',
  ]);

  if (!result.title) {
    result.title = findMeta("og:title") || findMeta("twitter:title");
  }

  if (!result.title) {
    result.title = titleFromUrl();
  }

  result.company = first([
    '[class*="company-name"]',
    '[class*="company"]',
    '[data-testid*="companyName"]',
    '[data-testid*="company"]',
    '[itemprop="hiringOrganization"] [itemprop="name"]',
    '[itemprop="name"][class*="company"]',
  ]);

  if (!result.company) {
    result.company = findCompanyFromPage();
  }

  result.location = first([
    '[class*="location"]',
    '[data-testid*="location"]',
    '[itemprop="jobLocation"]',
    '[itemprop="addressLocality"]',
  ]);
  if (!result.location) {
    result.location = findLocationFromPage();
  }

  result.description = findDescriptionFromPage();

  return {
    ...result,
    source: window.location.hostname,
    originalUrl: window.location.href,
  };
}
