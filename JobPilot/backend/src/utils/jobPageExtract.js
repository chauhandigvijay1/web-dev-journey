import * as cheerio from "cheerio";

function clean(text) {
  if (!text || typeof text !== "string") return "";
  return text.replace(/\s+/g, " ").trim().slice(0, 800);
}

function metaContent($, selectors) {
  for (const { attr, name } of selectors) {
    const v = $(`meta[${attr}="${name}"]`).attr("content");
    const t = clean(v);
    if (t) return t;
  }
  return "";
}

function firstText($, selectors) {
  for (const sel of selectors) {
    const t = clean($(sel).first().text());
    if (t) return t;
  }
  return "";
}

export function extractJobFieldsFromHtml(html) {
  const $ = cheerio.load(html);

  let title =
    firstText($, ['h1', '[class*="job-title" i]', '[class*="posting-title" i]', '[data-job-title]']) ||
    metaContent($, [
      { attr: "property", name: "og:title" },
      { attr: "name", name: "twitter:title" },
    ]) ||
    clean($("title").first().text());

  let company =
    metaContent($, [
      { attr: "property", name: "og:site_name" },
      { attr: "name", name: "application-name" },
    ]) ||
    firstText($, [
      "[data-company]",
      '[class*="company-name" i]',
      '[class*="company" i]:not([class*="location" i])',
      '[itemprop="hiringOrganization"]',
    ]);

  let location =
    metaContent($, [
      { attr: "name", name: "jobLocation" },
      { attr: "property", name: "og:locality" },
    ]) ||
    firstText($, [
      "[data-location]",
      "[data-job-location]",
      '[class*="job-location" i]',
      '[class*="location" i]',
      '[itemprop="jobLocation"]',
    ]);

  let jobType =
    metaContent($, [{ attr: "name", name: "employmentType" }]) ||
    firstText($, [
      '[class*="employment-type" i]',
      '[class*="job-type" i]',
      '[data-employment-type]',
    ]);

  let salary =
    metaContent($, [{ attr: "name", name: "salary" }]) ||
    firstText($, [
      '[class*="salary" i]',
      '[class*="compensation" i]',
      '[data-salary]',
      '[itemprop="baseSalary"]',
    ]);

  return {
    title: title || "",
    company: company || "",
    location: location || "",
    jobType: jobType || "",
    salary: salary || "",
  };
}
