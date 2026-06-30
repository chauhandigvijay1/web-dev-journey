import axios from "axios";
import {
  attrFromSelectors,
  buildFallbackExtraction,
  cleanText,
  compactArray,
  findJobPosting,
  hostnameLabel,
  loadHtml,
  metaContent,
  normalizeLocations,
  normalizeUrl,
  parseJsonLd,
  readSchemaJobPosting,
  textFromSelectors,
  textsFromSelectors,
  uniqueStrings,
} from "./helpers.js";

function mergeExtraction(...parts) {
  return parts.reduce(
    (accumulator, part) => {
      if (!part) return accumulator;

      const next = { ...accumulator };
      for (const [key, value] of Object.entries(part)) {
        if (Array.isArray(value)) {
          next[key] = uniqueStrings([...(next[key] || []), ...value]);
          continue;
        }

        if (typeof value === "string") {
          if (!next[key]) {
            next[key] = cleanText(value, key === "descriptionSummary" ? 420 : 280);
          }
          continue;
        }

        if (value != null && next[key] == null) {
          next[key] = value;
        }
      }

      return next;
    },
    {
      title: "",
      company: "",
      location: "",
      locations: [],
      salary: "",
      jobType: "",
      experience: "",
      skills: [],
      qualification: "",
      applyDeadline: "",
      workMode: "",
      descriptionSummary: "",
      originalApplyLink: "",
      source: "",
    }
  );
}

function parseLever($, urlString) {
  return {
    title: textFromSelectors($, [".posting-headline h2", "[data-qa='posting-name']", "h2.posting-headline"], 240),
    company: textFromSelectors($, [".main-header-text", ".posting-categories h5"], 240),
    locations: textsFromSelectors($, [".posting-categories .sort-by-time", ".posting-categories .location"]),
    jobType: textFromSelectors($, [".posting-categories .commitment"], 120),
    descriptionSummary: cleanText(textFromSelectors($, [".section-wrapper", ".posting-page"], 2000), 420),
    originalApplyLink:
      attrFromSelectors($, ['a[href*="lever.co"]', 'a[href*="apply"]'], "href") || urlString,
  };
}

function parseGreenhouse($, urlString) {
  return {
    title: textFromSelectors($, [".app-title", ".job__title", "h1"], 240),
    company: textFromSelectors($, [".company-name", ".app-title + .company-name"], 240),
    locations: textsFromSelectors($, [".location", ".opening .location"]),
    descriptionSummary: cleanText(textFromSelectors($, ["#content", ".content"], 2200), 420),
    originalApplyLink:
      attrFromSelectors($, ['a[href*="/application"]', 'a[href*="apply"]'], "href") || urlString,
  };
}

function parseLinkedIn($, urlString) {
  return {
    title: textFromSelectors($, [".top-card-layout__title", ".topcard__title", "h1"], 240),
    company: textFromSelectors($, [".topcard__org-name-link", ".topcard__flavor"], 240),
    locations: textsFromSelectors($, [".topcard__flavor--bullet", ".topcard__flavor--metadata"]),
    descriptionSummary: cleanText(textFromSelectors($, [".description__text", ".show-more-less-html"], 2200), 420),
    originalApplyLink:
      attrFromSelectors($, ['a[href*="apply"]', 'a[data-tracking-control-name*="apply"]'], "href") || urlString,
  };
}

function parseInternshala($, urlString) {
  return {
    title: textFromSelectors($, [".profile", ".heading_4_5", "h1"], 240),
    company: textFromSelectors($, [".company_name", ".company", ".company_name a"], 240),
    locations: textsFromSelectors($, [".locations a", ".location_names", ".text-container"]),
    salary: textFromSelectors($, [".salary", ".stipend"], 240),
    jobType: textFromSelectors($, [".job_type", ".other_detail_item_row"], 120),
    descriptionSummary: cleanText(textFromSelectors($, [".text-container", ".internship_details"], 2200), 420),
    originalApplyLink:
      attrFromSelectors($, ['a[href*="application"]', 'a[href*="apply"]'], "href") || urlString,
  };
}

function parseWellfound($, urlString) {
  return {
    title: textFromSelectors($, ['[data-test="job-title"]', "h1"], 240),
    company: textFromSelectors($, ['[data-test="startup-name"]', '[data-test="company-name"]'], 240),
    locations: textsFromSelectors($, ['[data-test="job-location"]', '[data-test="location"]']),
    salary: textFromSelectors($, ['[data-test="job-salary"]', '[data-test="salary"]'], 240),
    descriptionSummary: cleanText(textFromSelectors($, ['[data-test="job-description"]', "main"], 2200), 420),
    originalApplyLink:
      attrFromSelectors($, ['a[href*="apply"]', 'a[data-test="apply-button"]'], "href") || urlString,
  };
}

const DOMAIN_PARSERS = [
  { match: (hostname) => hostname.includes("lever.co"), parse: parseLever },
  { match: (hostname) => hostname.includes("greenhouse.io") || hostname.includes("boards.greenhouse.io"), parse: parseGreenhouse },
  { match: (hostname) => hostname.includes("linkedin.com"), parse: parseLinkedIn },
  { match: (hostname) => hostname.includes("internshala.com"), parse: parseInternshala },
  { match: (hostname) => hostname.includes("wellfound.com") || hostname.includes("angel.co"), parse: parseWellfound },
];

export function extractJobFieldsFromHtml(html, urlString) {
  const $ = loadHtml(html);
  const jsonLdItems = parseJsonLd($);
  const jobPosting = findJobPosting(jsonLdItems);
  const hostname = hostnameLabel(urlString);
  const parser = DOMAIN_PARSERS.find((entry) => entry.match(hostname));

  const generic = buildFallbackExtraction($, urlString);
  const schema = readSchemaJobPosting(jobPosting, urlString);
  const domain = parser ? parser.parse($, urlString) : {};
  const meta = {
    title: metaContent($, [
      { attr: "property", name: "og:title" },
      { attr: "name", name: "twitter:title" },
    ]),
    company:
      metaContent($, [{ attr: "property", name: "og:site_name" }]) ||
      textFromSelectors($, ['meta[name="author"]'], 240),
    originalApplyLink:
      attrFromSelectors($, ['link[rel="canonical"]', 'meta[property="og:url"]'], "href") || urlString,
  };

  const combined = mergeExtraction(schema, domain, meta, generic);
  const locations = uniqueStrings(
    compactArray([
      ...normalizeLocations(combined.locations),
      ...normalizeLocations(combined.location),
      ...textsFromSelectors($, ['[class*="location" i]', '[data-test*="location" i]']),
    ])
  );

  return {
    ...combined,
    locations,
    location: locations.join(", "),
    skills: uniqueStrings(combined.skills || []),
    originalApplyLink: normalizeUrl(urlString, combined.originalApplyLink) || urlString,
    source: combined.source || hostname,
  };
}

function isPrivateHostname(hostname) {
  const normalized = hostname.replace(/^www\./, "").toLowerCase();
  if (normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1") return true;
  if (/^(127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0)$/.test(normalized)) return true;
  return false;
}

export async function extractJobFieldsFromUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return {
      title: "",
      company: "",
      location: "",
      locations: [],
      salary: "",
      jobType: "",
      experience: "",
      skills: [],
      qualification: "",
      applyDeadline: "",
      workMode: "",
      descriptionSummary: "",
      originalApplyLink: urlString,
      source: "",
      warning: "Invalid URL provided.",
    };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return {
      title: "",
      company: "",
      location: "",
      locations: [],
      salary: "",
      jobType: "",
      experience: "",
      skills: [],
      qualification: "",
      applyDeadline: "",
      workMode: "",
      descriptionSummary: "",
      originalApplyLink: url.href,
      source: hostnameLabel(url.href),
      warning: "Only http and https URLs are supported.",
    };
  }

  if (isPrivateHostname(url.hostname)) {
    return {
      title: "",
      company: "",
      location: "",
      locations: [],
      salary: "",
      jobType: "",
      experience: "",
      skills: [],
      qualification: "",
      applyDeadline: "",
      workMode: "",
      descriptionSummary: "",
      originalApplyLink: url.href,
      source: hostnameLabel(url.href),
      warning: "Cannot fetch URLs from private networks.",
    };
  }

  try {
    const response = await axios.get(url.href, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JobPilotBot/2.0; +https://jobpilot.local)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      validateStatus: () => true,
    });

    if (response.status >= 200 && response.status < 400 && typeof response.data === "string") {
      const finalUrl = response.request?.res?.responseUrl || url.href;
      const data = extractJobFieldsFromHtml(response.data, finalUrl);
      const hasMeaningfulData = Boolean(
        data.title || data.company || data.locations.length || data.salary || data.descriptionSummary
      );

      return {
        ...data,
        warning: hasMeaningfulData ? "" : "Job details were only partially extracted. Review before saving.",
      };
    }

    return {
      title: "",
      company: "",
      location: "",
      locations: [],
      salary: "",
      jobType: "",
      experience: "",
      skills: [],
      qualification: "",
      applyDeadline: "",
      workMode: "",
      descriptionSummary: "",
      originalApplyLink: url.href,
      source: hostnameLabel(url.href),
      warning: `Job page returned status ${response.status}. Add details manually if needed.`,
    };
  } catch (error) {
    return {
      title: "",
      company: "",
      location: "",
      locations: [],
      salary: "",
      jobType: "",
      experience: "",
      skills: [],
      qualification: "",
      applyDeadline: "",
      workMode: "",
      descriptionSummary: "",
      originalApplyLink: url.href,
      source: hostnameLabel(url.href),
      warning: error?.message ? `Could not fetch the job page: ${error.message}` : "Could not fetch the job page.",
    };
  }
}
