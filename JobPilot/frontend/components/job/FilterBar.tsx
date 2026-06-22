"use client";

import { memo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { JOB_STATUSES, type JobStatus } from "@/lib/job-types";
import type { KanbanFilterState, KanbanSort } from "@/lib/kanban-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_LABEL: Record<JobStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const SORT_LABEL: Record<KanbanSort, string> = {
  latest: "Latest updated",
  bestMatch: "Match score",
  priority: "Priority score",
  salaryHighToLow: "Salary (High to Low)",
  salaryLowToHigh: "Salary (Low to High)",
  followup: "Follow-up due",
};

const selectClass =
  "h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const WORK_MODE_OPTIONS = [
  { value: "", label: "All modes" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

export type FilterBarProps = {
  filters: KanbanFilterState;
  onFiltersChange: (next: KanbanFilterState) => void;
  sort: KanbanSort;
  onSortChange: (next: KanbanSort) => void;
  companies: string[];
  jobTypes: string[];
  sources: string[];
};

function FilterBarInner({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  companies,
  jobTypes,
  sources,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activeAdvancedCount = [
    filters.company,
    filters.place,
    filters.country,
    filters.workMode,
    filters.jobType,
    filters.source,
  ].filter(Boolean).length;

  return (
    <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1.5 xl:col-span-2">
          <Label htmlFor="filter-search" className="text-xs text-muted-foreground">
            Search
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="filter-search"
              value={filters.search}
              onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
              placeholder="Title, company, source, location..."
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-status" className="text-xs text-muted-foreground">
            Status
          </Label>
          <select
            id="filter-status"
            className={selectClass}
            value={filters.status}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                status: event.target.value === "all" ? "all" : (event.target.value as JobStatus),
              })
            }
          >
            <option value="all">All statuses</option>
            {JOB_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-sort" className="text-xs text-muted-foreground">
            Sort
          </Label>
          <div className="flex gap-2">
            <select
              id="filter-sort"
              className={cn(selectClass, "flex-1")}
              value={sort}
              onChange={(event) => onSortChange(event.target.value as KanbanSort)}
            >
              {(Object.keys(SORT_LABEL) as KanbanSort[]).map((key) => (
                <option key={key} value={key}>
                  {SORT_LABEL[key]}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant={activeAdvancedCount > 0 ? "default" : "outline"}
              className="h-9 px-3"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="ml-1.5 rounded bg-primary-foreground/20 px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
                  {activeAdvancedCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="mt-4 grid gap-3 border-t border-border/50 pt-4 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-top-2">

        <div className="space-y-1.5">
          <Label htmlFor="filter-company" className="text-xs text-muted-foreground">
            Company
          </Label>
          <select
            id="filter-company"
            className={selectClass}
            value={filters.company}
            onChange={(event) => onFiltersChange({ ...filters, company: event.target.value })}
          >
            <option value="">All companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-place" className="text-xs text-muted-foreground">
            Place
          </Label>
          <Input
            id="filter-place"
            value={filters.place}
            onChange={(event) => onFiltersChange({ ...filters, place: event.target.value })}
            placeholder="Bengaluru, London..."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-country" className="text-xs text-muted-foreground">
            Country
          </Label>
          <Input
            id="filter-country"
            value={filters.country}
            onChange={(event) => onFiltersChange({ ...filters, country: event.target.value })}
            placeholder="India, USA..."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filter-work-mode" className="text-xs text-muted-foreground">
            Work mode
          </Label>
          <select
            id="filter-work-mode"
            className={selectClass}
            value={filters.workMode}
            onChange={(event) => onFiltersChange({ ...filters, workMode: event.target.value })}
          >
            {WORK_MODE_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
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
            onChange={(event) => onFiltersChange({ ...filters, jobType: event.target.value })}
          >
            <option value="">All types</option>
            {jobTypes.map((jobType) => (
              <option key={jobType} value={jobType}>
                {jobType}
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
            onChange={(event) => onFiltersChange({ ...filters, source: event.target.value })}
          >
            <option value="">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        </div>
      )}
    </div>
  );
}

export const FilterBar = memo(FilterBarInner);
