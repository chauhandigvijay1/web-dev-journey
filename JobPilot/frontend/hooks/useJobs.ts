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
const inFlight = new Map<string, Promise<void>>();

export function useJobs(page = 1, limit = 200) {
  const cacheKey = `jobs:${page}:${limit}`;
  const cached = cache.get(cacheKey);

  const [state, setState] = useState<JobsState>({
    jobs: cached?.jobs || [],
    loading: !cached,
    error: null,
    total: cached?.total || 0,
  });

  const mountedRef = useRef(true);
  const load = useCallback(async () => {
    const key = cacheKey;
    if (inFlight.has(key)) {
      await inFlight.get(key);
      const latest = cache.get(key);
      if (latest && mountedRef.current) {
        setState({ jobs: latest.jobs, loading: false, error: null, total: latest.total });
      }
      return;
    }

    const promise = (async () => {
      try {
        const { data } = await api.get<{ success: boolean; data: { jobs: Job[]; pagination: { total: number } } }>("/jobs", {
          params: { page, limit },
        });
        const jobs = data.data.jobs;
        const total = data.data.pagination?.total ?? jobs.length;
        cache.set(key, { jobs, total, ts: Date.now() });
        if (mountedRef.current) {
          setState({ jobs, loading: false, error: null, total });
        }
      } catch (err: unknown) {
        if (mountedRef.current) {
          setState((prev) => ({ ...prev, loading: false, error: (err as { message?: string })?.message || "Failed to load jobs" }));
        }
      }
    })();

    inFlight.set(key, promise);
    await promise;
    inFlight.delete(key);
  }, [cacheKey]);

  useEffect(() => {
    mountedRef.current = true;
    if (!cached || Date.now() - cached.ts > CACHE_TTL) {
      load();
    }
    return () => { mountedRef.current = false; };
  }, [load, cached]);

  return { ...state, refetch: load };
}
