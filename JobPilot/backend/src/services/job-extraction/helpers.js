import * as cheerio from "cheerio";

export function cleanText(value, maxLength = 1600) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function compactArray(values) {
  return values.filter(Boolean);
}

export function uniqueStrings(values) {
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const normalized = cleanText(value, 240);
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) continue;
    seen.add(key);
    output.push(normalized);
  }

  return output;
}

export function loadHtml(html) {
  return cheerio.load(html || "");
}

export function textFromSelectors($, selectors, maxLength = 500) {
  for (const selector of selectors) {
    const value = cleanText($(selector).first().text(), maxLength);
    if (value) return value;
  }
  return "";
}

export function textsFromSelectors($, selectors, maxLength = 240) {
  const values = [];
  for (const selector of selectors) {
    $(selector).each((_index, element) => {
      values.push(cleanText($(element).text(), maxLength));
    });
  }
  return uniqueStrings(values);
}

export function metaContent($, selectors) {
  for (const { attr, name } of selectors) {
    const value = cleanText($(`meta[${attr}="${name}"]`).attr("content"));
    if (value) return value;
  }
  return "";
}

export function attrFromSelectors($, selectors, attribute) {
  for (const selector of selectors) {
    const value = cleanText($(selector).first().attr(attribute));
    if (value) return value;
  }
  return "";
}

export function parseJsonLd($) {
  const items = [];

  $('script[type="application/ld+json"]').each((_index, element) => {
    const raw = $(element).contents().text();
    if (!raw?.trim()) return;

    try {
      const parsed = JSON.parse(raw);
      items.push(parsed);
    } catch {
      // Ignore malformed structured data.
    }
  });

  return items.flatMap((item) => {
    if (Array.isArray(item)) return item;
    if (Array.isArray(item?.["@graph"])) return item["@graph"];
    return [item];
  });
}

function hasType(value, target) {
  if (!value) return false;
  if (Array.isArray(value)) {
    return value.some((item) => hasType(item, target));
  }
  return String(value).toLowerCase() === target.toLowerCase();
}

export function findJobPosting(jsonLdItems) {
  return jsonLdItems.find((item) => hasType(item?.["@type"], "JobPosting")) || null;
}

export function normalizeUrl(baseUrl, candidate) {
  if (!candidate) return "";
  try {
    return new URL(candidate, baseUrl).href;
  } catch {
    return "";
  }
}

export function hostnameLabel(urlString) {
  try {
    return new URL(urlString).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function splitTokens(value) {
  return uniqueStrings(
    String(value || "")
      .split(/\||,|\/|•|\n|;|·/)
      .map((item) => item.trim())
  );
}

export function normalizeLocations(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value.flatMap((item) => normalizeLocations(item)));
  }

  if (value && typeof value === "object") {
    return uniqueStrings([
      value.addressLocality,
      value.addressRegion,
      value.addressCountry,
      value.name,
      ...normalizeLocations(value.address),
    ]);
  }

  return splitTokens(value);
}

export function normalizeSalary(value) {
  return cleanText(String(value || "").replace(/\s+/g, " "), 280);
}

export function summarizeDescription(text) {
  const cleaned = cleanText(text, 4000);
  if (!cleaned) return "";

  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  return cleanText(sentences.slice(0, 3).join(" "), 420);
}

export function regexMatch(text, expressions) {
  for (const expression of expressions) {
    const match = text.match(expression);
    if (match?.[1]) {
      return cleanText(match[1], 240);
    }
  }
  return "";
}

export function findSkillList(text) {
  const skillBlock = regexMatch(text, [
    /skills?(?: required| preferred)?[:\-\s]+([^\n]+)/i,
    /technologies[:\-\s]+([^\n]+)/i,
    /stack[:\-\s]+([^\n]+)/i,
  ]);
  if (!skillBlock) return [];
  const cleaned = skillBlock
    .split(/\b(?:experience|qualification|requirements?|responsibilities)\b/i)[0]
    .replace(/\.\s*$/, "");
  return splitTokens(cleaned);
}

export function findQualification(text) {
  return regexMatch(text, [
    /qualification(?:s)?[:\-\s]+([^.;]+)/i,
    /education(?: requirement)?[:\-\s]+([^.;]+)/i,
    /(bachelor(?:'s)?[^.;]+|master(?:'s)?[^.;]+)/i,
  ]);
}

export function findExperience(text) {
  return regexMatch(text, [
    /experience(?: level)?[:\-\s]+([^.;]+)/i,
    /((?:fresher|entry level|senior level|mid level))/i,
    /((?:\d+\+?\s*(?:to|-)?\s*\d*\+?\s*years?))/i,
  ]);
}

export function findWorkMode(text) {
  return regexMatch(text, [
    /\b(remote|hybrid|onsite|on-site|work from home)\b/i,
  ]).replace(/^on-site$/i, "Onsite");
}

export function findDeadline(text) {
  return regexMatch(text, [
    /(?:apply by|application deadline|deadline|valid through)[:\-\s]+([^.;]+)/i,
  ]);
}

export function readSchemaJobPosting(jobPosting, baseUrl) {
  if (!jobPosting) return {};

  const hiringOrganization =
    typeof jobPosting.hiringOrganization === "object"
      ? jobPosting.hiringOrganization?.name
      : jobPosting.hiringOrganization;

  const applyLink = normalizeUrl(
    baseUrl,
    jobPosting.directApply === true ? baseUrl : jobPosting.url || jobPosting.applicationUrl
  );

  const description = cleanText(
    typeof jobPosting.description === "string" ? jobPosting.description.replace(/<[^>]+>/g, " ") : "",
    6000
  );

  return {
    title: cleanText(jobPosting.title || jobPosting.name, 240),
    company: cleanText(hiringOrganization, 240),
    locations: normalizeLocations(jobPosting.jobLocation || jobPosting.applicantLocationRequirements || jobPosting.jobLocationType),
    salary: normalizeSalary(
      typeof jobPosting.baseSalary === "object"
        ? jobPosting.baseSalary?.value?.value || jobPosting.baseSalary?.value?.minValue || jobPosting.baseSalary?.currency
        : jobPosting.baseSalary
    ),
    jobType: cleanText(
      Array.isArray(jobPosting.employmentType)
        ? jobPosting.employmentType.join(", ")
        : jobPosting.employmentType,
      120
    ),
    qualification: cleanText(jobPosting.qualifications, 280),
    applyDeadline: cleanText(jobPosting.validThrough, 80),
    descriptionSummary: summarizeDescription(description),
    originalApplyLink: applyLink,
    workMode: cleanText(jobPosting.jobLocationType, 120),
  };
}

export function buildFallbackExtraction($, urlString) {
  const pageText = cleanText($("body").text(), 12000);
  const locations = uniqueStrings([
    ...textsFromSelectors($, [
      '[data-test*="location" i]',
      '[class*="location" i]',
      '[class*="job-location" i]',
      '[itemprop="jobLocation"]',
    ]),
    ...splitTokens(metaContent($, [{ attr: "name", name: "jobLocation" }])),
  ]);

  const descriptionText = cleanText(
    textFromSelectors($, [
      '[class*="description" i]',
      '[class*="job-description" i]',
      '[data-test*="description" i]',
      "main",
      "article",
    ], 6000) || pageText,
    6000
  );

  const originalApplyLink =
    attrFromSelectors($, ['a[href*="apply" i]', 'a[data-qa="btn-apply"]', 'a[aria-label*="Apply" i]'], "href") ||
    attrFromSelectors($, ['link[rel="canonical"]'], "href");

  return {
    title:
      textFromSelectors($, ["h1", '[class*="title" i]', '[data-test*="job-title" i]'], 240) ||
      metaContent($, [
        { attr: "property", name: "og:title" },
        { attr: "name", name: "twitter:title" },
      ]) ||
      cleanText($("title").first().text(), 240),
    company:
      textFromSelectors($, [
        '[class*="company" i]:not([class*="logo" i])',
        '[data-test*="company" i]',
        '[itemprop="hiringOrganization"]',
      ], 240) ||
      metaContent($, [{ attr: "property", name: "og:site_name" }]),
    locations,
    salary:
      textFromSelectors($, ['[class*="salary" i]', '[class*="compensation" i]', '[itemprop="baseSalary"]'], 240) ||
      regexMatch(descriptionText, [/((?:[$€£₹]\s?[\d,.kKmM]+(?:\s?-\s?[$€£₹]?\s?[\d,.kKmM]+)?(?:\s*(?:per|\/)\s*(?:year|month|hour))?))/i]),
    jobType:
      textFromSelectors($, ['[class*="employment-type" i]', '[class*="job-type" i]'], 120) ||
      regexMatch(descriptionText, [/\b(full[\s-]?time|part[\s-]?time|internship|contract|temporary|freelance)\b/i]),
    experience: findExperience(descriptionText),
    skills: [
      ...textsFromSelectors($, ['[class*="skill" i] li', '[data-test*="skill" i] li']),
      ...findSkillList(descriptionText),
    ],
    qualification:
      textFromSelectors($, ['[class*="qualification" i]', '[class*="education" i]'], 280) ||
      findQualification(descriptionText),
    applyDeadline: findDeadline(descriptionText),
    workMode:
      textFromSelectors($, ['[class*="remote" i]', '[class*="work-mode" i]'], 120) ||
      findWorkMode(descriptionText),
    descriptionSummary: summarizeDescription(descriptionText),
    originalApplyLink: normalizeUrl(urlString, originalApplyLink) || urlString,
    source: hostnameLabel(urlString),
  };
}
