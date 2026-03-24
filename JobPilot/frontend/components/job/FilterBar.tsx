"use client";

import { memo } from "react";
import { JOB_STATUSES, type JobStatus } from "@/lib/job-types";
import type { KanbanFilterState, KanbanSort } from "@/lib/kanban-filters";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const STATUS_LABEL: Record<JobStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const SORT_LABEL: Record<KanbanSort, string> = {
  latest: "Latest",
  confidence: "Confidence score",
  followup: "Upcoming follow-up",
};

const selectClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export type FilterBarProps = {
  filters: KanbanFilterState;
  onFiltersChange: (next: KanbanFilterState) => void;
  sort: KanbanSort;
  onSortChange: (next: KanbanSort) => void;
  jobTypes: string[];
  sources: string[];
};

function FilterBarInner({ filters, onFiltersChange, sort, onSortChange, jobTypes, sources }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card/50 p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
      <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
            Status
          </Label>
          <select
            id="filter-status"
            className={selectClass}
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value === "all" ? "all" : (e.target.value as JobStatus),
              })
            }
          >
            <option value="all">All statuses</option>
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-job-type" className="text-xs text-muted-foreground">
            Job type
          </Label>
          <select
            id="filter-job-type"
            className={selectClass}
            value={filters.jobType}
            onChange={(e) => onFiltersChange({ ...filters, jobType: e.target.value })}
          >
            <option value="">All types</option>
            {jobTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-source" className="text-xs text-muted-foreground">
            Source
          </Label>
          <select
            id="filter-source"
            className={selectClass}
            value={filters.source}
            onChange={(e) => onFiltersChange({ ...filters, source: e.target.value })}
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filter-sort" className="text-xs text-muted-foreground">
            Sort
          </Label>
          <select
            id="filter-sort"
            className={cn(selectClass, "sm:max-w-none")}
            value={sort}
            onChange={(e) => onSortChange(e.target.value as KanbanSort)}
          >
            {(Object.keys(SORT_LABEL) as KanbanSort[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export const FilterBar = memo(FilterBarInner);
