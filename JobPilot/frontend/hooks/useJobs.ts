"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import type { Job } from "@/lib/job-types";

interface JobsState {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  total: number;
}

const cache = new Map<string, { jobs: Job[]; total: number; ts: number }>();
const CACHE_TTL = 30_000;
const MAX_CACHE_SIZE = 50;
const inFlight = new Map<string, Promise<void>>();
const cacheInsertOrder: string[] = [];

function evictCache() {
  while (cache.size > MAX_CACHE_SIZE && cacheInsertOrder.length > 0) {
    const key = cacheInsertOrder.shift();
    if (key) cache.delete(key);
  }
}

export function useJobs(page = 1, limit = 200) {
  const cacheKey = `jobs:${page}:${limit}`;
  const cached = cache.get(cacheKey);

  const [state, setState] = useState<JobsState>({
    jobs: cached?.jobs || [],
    loading: !cached,
    error: null,
    total: cached?.total || 0,
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    const key = cacheKey;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    if (inFlight.has(key)) {
      await inFlight.get(key);
      const latest = cache.get(key);
      if (latest && !controller.signal.aborted) {
        setState({ jobs: latest.jobs, loading: false, error: null, total: latest.total });
      }
      return;
    }

    const promise = (async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: { jobs: Job[]; pagination: { total: number } } }>("/jobs", {
          params: { page, limit },
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const jobs = data.data.jobs;
        const total = data.data.pagination?.total ?? jobs.length;

        if (!cache.has(key)) {
          cacheInsertOrder.push(key);
        }
        cache.set(key, { jobs, total, ts: Date.now() });
        evictCache();

        setState({ jobs, loading: false, error: null, total });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setState((prev) => ({ ...prev, loading: false, error: (err as { message?: string })?.message || "Failed to load jobs" }));
      }
    })();

    inFlight.set(key, promise);
    try {
      await promise;
    } finally {
      inFlight.delete(key);
    }
  }, [cacheKey, page, limit]);

  useEffect(() => {
    if (!cached || Date.now() - cached.ts > CACHE_TTL) {
      load();
    }
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [load, cached]);

  return { ...state, refetch: load };
}
