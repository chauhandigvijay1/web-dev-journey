function syncJobPilotToken() {
  if (!window.location.hostname.includes("jobpilot-client-chi.vercel.app") && window.location.hostname !== "localhost") {
    return;
  }
  try {
    const token = window.localStorage?.getItem("jobpilot_token");
    if (token) {
      const apiBaseUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:5051/api"
          : "https://web-dev-journey-cnee.onrender.com/api";
      chrome.runtime.sendMessage({ action: "SYNC_AUTH_TOKEN", token, apiBaseUrl });
    }
  } catch {
    // Ignore pages where storage access is unavailable.
  }
}

syncJobPilotToken();

function extractText(selector) {
  const el = document.querySelector(selector);
  return el ? (el.innerText || el.textContent || "").trim() : "";
}

function extractFirstText(selectors) {
  for (const selector of selectors) {
    const value = extractText(selector);
    if (value) return value;
  }
  return "";
}

function extractAllText(selectors) {
  for (const selector of selectors) {
    const els = document.querySelectorAll(selector);
    if (els.length > 0) {
      return Array.from(els).map(el => (el.innerText || el.textContent || "").trim()).filter(Boolean).join(", ");
    }
  }
  return "";
}

function parseJsonLd() {
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent);
      const jobs = Array.isArray(data) ? data : [data];
      for (const item of jobs) {
        if (item["@type"] === "JobPosting" || (item["@type"] && item["@type"].includes("JobPosting"))) {
          return {
            title: clean(item.title),
            company: item.hiringOrganization?.name || clean(item.hiringOrganization?.["@id"]),
            location: item.jobLocation?.address?.addressLocality || item.jobLocation?.address?.streetAddress || clean(item.jobLocation?.name),
            description: clean(item.description),
            skills: item.skills ? (Array.isArray(item.skills) ? item.skills.map(s => clean(s)).filter(Boolean) : [clean(item.skills)]) : [],
          };
        }
      }
    } catch {
      // continue
    }
  }
  return null;
}

function parseMetaTags() {
  const title = document.querySelector('meta[property="og:title"]')?.getAttribute("content")
    || document.querySelector('meta[name="twitter:title"]')?.getAttribute("content")
    || "";
  const description = document.querySelector('meta[property="og:description"]')?.getAttribute("content")
    || document.querySelector('meta[name="description"]')?.getAttribute("content")
    || "";
  const url = document.querySelector('meta[property="og:url"]')?.getAttribute("content")
    || window.location.href;
  return { title: clean(title), description: clean(description), originalUrl: url };
}

function clean(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}

function scrapePage() {
  const jsonld = parseJsonLd();
  if (jsonld && jsonld.title && jsonld.company) {
    return { ...jsonld, source: window.location.hostname, originalUrl: window.location.href };
  }

  const hostname = window.location.hostname;
  let extracted = { title: "", company: "", location: "", description: "", skills: [] };

  if (hostname.includes("linkedin.com")) {
    extracted.title = extractFirstText([
      '.job-details-jobs-unified-top-card__job-title',
      '.jobs-unified-top-card__job-title',
      '.top-card-layout__title',
      '.job-title',
      'h1.job-title',
      'h1',
    ]);
    extracted.company = extractFirstText([
      '.job-details-jobs-unified-top-card__company-name',
      '.jobs-unified-top-card__company-name',
      '.topcard__org-name-link',
      '.topcard__flavor',
      '[data-tracking-control-name="public_jobs_topcard-org-name"]',
      '.job-company-name',
      '[data-anonymize="company-name"]',
    ]);
    extracted.location = extractFirstText([
      '.job-details-jobs-unified-top-card__primary-description-container .tvm__text--low-emphasis',
      '.job-details-jobs-unified-top-card__bullet',
      '.jobs-unified-top-card__bullet',
      '.topcard__flavor--bullet',
      '.sub-nav-cta__meta-text',
      '[data-anonymize="location"]',
    ]);
    extracted.description = extractFirstText([
      '#job-details',
      '.jobs-description__content',
      '.jobs-box__html-content',
      '.description__text',
      '.show-more-less-html__markup',
      '[data-anonymize="description"]',
    ]);
  } else if (hostname.includes("indeed.com")) {
    extracted.title = extractFirstText([
      '.jobsearch-JobInfoHeader-title',
      'h1[data-testid="jobsearch-JobInfoHeader-title"]',
      'h1',
      '[data-testid="jobTitle"]',
    ]);
    extracted.company = extractFirstText([
      '[data-testid="inlineHeader-companyName"]',
      '[data-company-name]',
      '.jobsearch-InlineCompanyRating div',
    ]);
    extracted.location = extractFirstText([
      '[data-testid="inlineHeader-companyLocation"]',
      '[data-testid="job-location"]',
    ]);
    extracted.description = extractFirstText([
      '#jobDescriptionText',
      '[data-testid="jobDescriptionText"]',
      '#job-content',
    ]);
  } else if (hostname.includes("wellfound.com") || hostname.includes("angellist.com")) {
    extracted.title = extractFirstText([
      'h2[class*="title"]',
      '[class*="title"][class*="styles"]',
      'h1',
    ]);
    extracted.company = extractFirstText([
      'h1[class*="name"]',
      '[class*="company-name"]',
      '[class*="styles_name"]',
    ]);
    extracted.location = extractFirstText([
      '[class*="location"]',
      '[class*="styles_location"]',
    ]);
    extracted.description = extractFirstText([
      '[class*="description"]',
      '[class*="styles_description"]',
      '[data-test="job-description"]',
    ]);
  } else if (hostname.includes("naukri.com")) {
    extracted.title = extractFirstText([
      '.jd-header-title',
      '[class*="title"]',
      'h1',
    ]);
    extracted.company = extractFirstText([
      '.jd-header-comp-name',
      '[class*="company-name"]',
      '.companyInfo',
    ]);
    extracted.location = extractFirstText([
      '.loc',
      '[class*="location"]',
    ]);
    extracted.description = extractFirstText([
      '.job-desc',
      '[class*="description"]',
      '#jobDescription',
    ]);
  } else if (hostname.includes("greenhouse.io")) {
    extracted.title = extractFirstText([
      '.app-title h1',
      '.posting-title h1',
      'h1',
    ]);
    extracted.company = extractFirstText([
      '.company-name',
      '[class*="company"]',
    ]);
    extracted.location = extractFirstText([
      '.location',
      '[class*="location"]',
    ]);
    extracted.description = extractFirstText([
      '#content',
      '[data-qa="job-description"]',
      '.posting-description',
    ]);
  } else if (hostname.includes("lever.co")) {
    extracted.title = extractFirstText([
      '.posting-headline h2',
      '.posting-title h2',
      'h1',
    ]);
    const logoImg = document.querySelector('.main-header-logo img');
    extracted.company = logoImg ? (logoImg.alt || "") : extractFirstText(['[class*="company"]']);
    extracted.location = extractFirstText([
      '.sort-by-time',
      '[class*="location"]',
    ]);
    extracted.description = extractFirstText([
      '.section-wrapper[data-qa="job-description"]',
      '[data-qa="job-description"]',
    ]);
  } else if (hostname.includes("ashbyhq.com")) {
    extracted.title = extractFirstText(['h1', 'h2']);
    extracted.company = extractFirstText([
      '.ashby-job-posting-company-name',
      '[class*="company"]',
    ]);
    extracted.location = extractFirstText([
      '.ashby-job-posting-location',
      '[class*="location"]',
    ]);
    extracted.description = extractFirstText([
      '.ashby-job-posting-description',
      '[class*="description"]',
    ]);
  } else if (hostname.includes("workday.com") || hostname.includes("myworkdayjobs.com")) {
    extracted.title = extractFirstText([
      '[data-automation-id="jobPostingHeader"]',
      '[data-automation-id="jobTitle"]',
      'h1',
      '[data-automation-id="title"]',
    ]);
    extracted.company = extractFirstText([
      '[data-automation-id="companyName"]',
      '[data-automation-id="jobPostingHeader"] span',
    ]);
    extracted.location = extractFirstText([
      '[data-automation-id="locations"]',
      '[data-automation-id="location"]',
    ]);
    extracted.description = extractFirstText([
      '[data-automation-id="jobPostingDescription"]',
      '[data-automation-id="description"]',
    ]);
  } else if (hostname.includes("foundit")) {
    extracted.title = extractFirstText([
      '.job-title',
      'h1',
      '[class*="title"]',
    ]);
    extracted.company = extractFirstText([
      '.company-name',
      '[class*="company"]',
    ]);
    extracted.location = extractFirstText([
      '.loc',
      '[class*="location"]',
    ]);
    extracted.description = extractFirstText([
      '.job-description-content',
      '[class*="description"]',
    ]);
  } else if (hostname.includes("internshala.com")) {
    extracted.title = extractFirstText([
      '.profile_on_detail_page',
      '[class*="profile"]',
      'h1',
    ]);
    extracted.company = extractFirstText([
      '.company_name',
      '[class*="company"]',
    ]);
    extracted.location = extractFirstText([
      '.location_link',
      '[class*="location"]',
    ]);
    extracted.description = extractFirstText([
      '.text-container',
      '[class*="description"]',
    ]);
  }

  const meta = parseMetaTags();
  if (!extracted.title) {
    extracted.title = meta.title;
  }
  if (!extracted.description && meta.description) {
    extracted.description = meta.description;
  }

  if (!extracted.title) {
    const h1 = document.querySelector("h1");
    if (h1) extracted.title = h1.innerText.trim();
  }

  if (!extracted.company) {
    const text = document.body.innerText;
    const match = text.match(/(?:at|for|with)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*(?:is|are|has|was)\s|[.,!?]|\s+(?:in|on|at)\s+(?:[A-Z][a-z]|the|our))/);
    if (match) extracted.company = clean(match[1]);
  }

  return {
    ...extracted,
    source: hostname,
    originalUrl: window.location.href,
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PARSE_JOB") {
    const jobData = scrapePage();
    sendResponse({ success: true, data: jobData });
  }
});
