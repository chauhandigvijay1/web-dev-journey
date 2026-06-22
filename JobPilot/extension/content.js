// JobPilot Content Script for scraping jobs

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

function parseLinkedIn() {
  const title = extractFirstText([
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    '.top-card-layout__title',
    'h1',
  ]);
  const company = extractFirstText([
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.topcard__org-name-link',
    '.topcard__flavor',
    '[data-tracking-control-name="public_jobs_topcard-org-name"]',
  ]);
  const location = extractFirstText([
    '.job-details-jobs-unified-top-card__primary-description-container .tvm__text--low-emphasis',
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.topcard__flavor--bullet',
    '.sub-nav-cta__meta-text',
  ]);
  const description = extractFirstText([
    '#job-details',
    '.jobs-description__content',
    '.jobs-box__html-content',
    '.description__text',
    '.show-more-less-html__markup',
  ]);

  return {
    title,
    company,
    location,
    description,
    skills: []
  };
}

function parseIndeed() {
  return {
    title: extractText('.jobsearch-JobInfoHeader-title'),
    company: extractText('[data-testid="inlineHeader-companyName"]'),
    location: extractText('[data-testid="inlineHeader-companyLocation"]'),
    description: extractText('#jobDescriptionText'),
    skills: []
  };
}

function parseWellfound() {
  return {
    title: extractText('h2.styles_title__12a3X'), // Dynamic class, often changes
    company: extractText('h1.styles_name__4L_n_'),
    location: extractText('.styles_location__3y8sR'),
    description: extractText('.styles_description__3d9p_'),
    skills: []
  };
}

function parseNaukri() {
  return {
    title: extractText('.jd-header-title'),
    company: extractText('.jd-header-comp-name'),
    location: extractText('.loc'),
    description: extractText('.job-desc'),
    skills: []
  };
}

function parseGreenhouse() {
  return {
    title: extractText('.app-title h1'),
    company: extractText('.company-name'),
    location: extractText('.location'),
    description: extractText('#content'),
    skills: []
  };
}

function parseLever() {
  return {
    title: extractText('.posting-headline h2'),
    company: extractText('.main-header-logo img') ? document.querySelector('.main-header-logo img').alt : "",
    location: extractText('.sort-by-time'),
    description: extractText('.section-wrapper[data-qa="job-description"]'),
    skills: []
  };
}

function parseAshby() {
  return {
    title: extractText('h1'),
    company: extractText('.ashby-job-posting-company-name'),
    location: extractText('.ashby-job-posting-location'),
    description: extractText('.ashby-job-posting-description'),
    skills: []
  };
}

function parseWorkday() {
  return {
    title: extractText('[data-automation-id="jobPostingHeader"]'),
    company: "Workday Portal", // Often requires AI extraction for specific company
    location: extractText('[data-automation-id="locations"]'),
    description: extractText('[data-automation-id="jobPostingDescription"]'),
    skills: []
  };
}

function parseFoundit() {
  return {
    title: extractText('.job-title'),
    company: extractText('.company-name'),
    location: extractText('.loc'),
    description: extractText('.job-description-content'),
    skills: []
  };
}

function parseInternshala() {
  return {
    title: extractText('.profile_on_detail_page'),
    company: extractText('.company_name'),
    location: extractText('.location_link'),
    description: extractText('.text-container'),
    skills: []
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PARSE_JOB") {
    const hostname = window.location.hostname;
    let extracted = { title: "", company: "", location: "", description: "", skills: [] };

    if (hostname.includes("linkedin.com")) extracted = parseLinkedIn();
    else if (hostname.includes("indeed.com")) extracted = parseIndeed();
    else if (hostname.includes("wellfound.com")) extracted = parseWellfound();
    else if (hostname.includes("naukri.com")) extracted = parseNaukri();
    else if (hostname.includes("greenhouse.io")) extracted = parseGreenhouse();
    else if (hostname.includes("lever.co")) extracted = parseLever();
    else if (hostname.includes("ashbyhq.com")) extracted = parseAshby();
    else if (hostname.includes("workday.com") || hostname.includes("myworkdayjobs.com")) extracted = parseWorkday();
    else if (hostname.includes("foundit")) extracted = parseFoundit();
    else if (hostname.includes("internshala.com")) extracted = parseInternshala();

    // Fallback naive parser
    if (!extracted.title) {
      const h1 = document.querySelector("h1");
      if (h1) extracted.title = h1.innerText.trim();
    }

    const jobData = {
      ...extracted,
      source: hostname,
      originalUrl: window.location.href,
      html: document.body.innerHTML.substring(0, 50000) // For Universal AI fallback
    };

    sendResponse({ success: true, data: jobData });
  }
});
