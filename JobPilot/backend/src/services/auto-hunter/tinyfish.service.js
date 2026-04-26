import axios from "axios";
import { env } from "../../config/env.js";

function tinyfishHeaders() {
  return {
    "X-API-Key": env.tinyfishApiKey,
    "Content-Type": "application/json",
  };
}

export function hasTinyFishConfig() {
  return Boolean(env.tinyfishApiKey);
}

export async function searchTinyFish(query, options = {}) {
  if (!hasTinyFishConfig()) {
    const error = new Error("TinyFish is not configured");
    error.statusCode = 503;
    throw error;
  }

  const params = {
    query,
    language: options.language || env.autoHunterSearchLanguage,
  };

  if (options.location && /^[A-Za-z]{2}$/.test(options.location)) {
    params.location = options.location.toUpperCase();
  }

  const response = await axios.get(env.tinyfishSearchUrl, {
    params,
    headers: tinyfishHeaders(),
    timeout: 15_000,
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    const error = new Error(response.data?.error?.message || response.data?.message || "TinyFish search failed");
    error.statusCode = 502;
    throw error;
  }

  return {
    query: response.data?.query || query,
    results: Array.isArray(response.data?.results) ? response.data.results : [],
    totalResults: Number(response.data?.total_results) || 0,
  };
}

export async function fetchTinyFishPages(urls, options = {}) {
  if (!hasTinyFishConfig()) {
    return new Map();
  }

  const safeUrls = Array.from(new Set((urls || []).filter(Boolean))).slice(0, 10);
  if (safeUrls.length === 0) return new Map();

  const body = {
    urls: safeUrls,
    format: options.format || "markdown",
  };

  if (options.countryCode && /^[A-Za-z]{2}$/.test(options.countryCode)) {
    body.proxy_config = { country_code: options.countryCode.toUpperCase() };
  }

  const response = await axios.post(env.tinyfishFetchUrl, body, {
    headers: tinyfishHeaders(),
    timeout: 120_000,
    validateStatus: () => true,
  });

  if (response.status >= 400) {
    const error = new Error(response.data?.error?.message || response.data?.message || "TinyFish fetch failed");
    error.statusCode = 502;
    throw error;
  }

  const map = new Map();
  for (const result of response.data?.results || []) {
    if (result?.url) map.set(result.url, result);
    if (result?.final_url) map.set(result.final_url, result);
  }

  return map;
}
