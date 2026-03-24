"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Plus } from "lucide-react";
import { api } from "@/services/api";
import { JOB_STATUSES, isJobStatus, type Job, type JobStatus } from "@/lib/job-types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  defaultKanbanFilters,
  filterJobs,
  groupByStatus,
  sortJobsInColumn,
  uniqueTrimmed,
  type KanbanFilterState,
  type KanbanSort,
} from "@/lib/kanban-filters";
import { FilterBar } from "./FilterBar";
import { JobCard } from "./JobCard";
import { JobEditDialog } from "./JobEditDialog";

const COLUMN_LABELS: Record<JobStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

function KanbanColumn({
  status,
  count,
  children,
}: {
  status: JobStatus;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[min(100vw-2rem,280px)] shrink-0 snap-start flex-col rounded-xl border bg-card shadow-sm transition-[box-shadow,ring] duration-200",
        isOver && "ring-2 ring-primary/25"
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <h2 className="text-sm font-semibold tracking-tight">{COLUMN_LABELS[status]}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
      </div>
      <div
        className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto p-2 transition-colors"
        style={{ maxHeight: "calc(100dvh - 220px)" }}
      >
        {children}
      </div>
    </div>
  );
}

function DraggableJob({
  job,
  onEdit,
  onDelete,
}: {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job._id,
    data: { job },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    transition: "opacity 150ms ease",
    touchAction: "none" as const,
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <JobCard job={job} onEdit={() => onEdit(job)} onDelete={() => onDelete(job)} />
    </div>
  );
}

export function JobsKanban() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KanbanFilterState>(defaultKanbanFilters);
  const [sort, setSort] = useState<KanbanSort>("latest");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [deleteJob, setDeleteJob] = useState<Job | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: { jobs: Job[] } }>("/jobs");
      if (!data.success || !data.data) {
        setFetchError("Could not load jobs");
        return;
      }
      setJobs(data.data.jobs);
    } catch {
      setFetchError("Could not load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const jobTypes = useMemo(() => uniqueTrimmed(jobs.map((j) => j.jobType)), [jobs]);
  const sources = useMemo(() => uniqueTrimmed(jobs.map((j) => j.source)), [jobs]);

  const filteredJobs = useMemo(() => filterJobs(jobs, filters), [jobs, filters]);

  const grouped = useMemo(() => {
    const m = groupByStatus(filteredJobs);
    for (const s of JOB_STATUSES) {
      m.set(s, sortJobsInColumn(m.get(s)!, sort));
    }
    return m;
  }, [filteredJobs, sort]);

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setActiveJob(jobs.find((x) => x._id === id) ?? null);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveJob(null);
    if (!over) return;
    const jobId = String(active.id);
    const job = jobs.find((x) => x._id === jobId);
    if (!job) return;

    const overId = String(over.id);
    const nextStatus = isJobStatus(overId)
      ? overId
      : jobs.find((item) => item._id === overId)?.status;

    if (!nextStatus || job.status === nextStatus) return;

    const prev = jobs;
    setJobs((list) => list.map((j) => (j._id === jobId ? { ...j, status: nextStatus } : j)));
    try {
      const { data } = await api.put<{ success: boolean; message?: string }>(`/jobs/${jobId}`, {
        status: nextStatus,
      });
      if (!data.success) throw new Error(data.message);
    } catch {
      setJobs(prev);
    }
  };

  const onDragCancel = () => setActiveJob(null);

  async function confirmDelete() {
    if (!deleteJob || deleting) return;
    const target = deleteJob;
    setDeleteJob(null);
    setDeleting(true);
    const prev = jobs;
    setJobs((list) => list.filter((j) => j._id !== target._id));
    try {
      const { data } = await api.delete<{ success: boolean }>(`/jobs/${target._id}`);
      if (!data.success) throw new Error("fail");
    } catch {
      setJobs(prev);
    } finally {
      setDeleting(false);
    }
  }

  function mergeSaved(updated: Job) {
    const id = String(updated._id);
    setJobs((list) => list.map((j) => (j._id === id ? { ...j, ...updated, _id: id } : j)));
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {JOB_STATUSES.map((s) => (
          <div
            key={s}
            className="flex w-[min(100vw-2rem,280px)] shrink-0 flex-col gap-2 rounded-xl border bg-card p-2"
          >
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
        {fetchError}
        <div className="mt-3">
          <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No jobs yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Track applications by adding a job from a URL or manual entry.
        </p>
        <Button className="mt-6 gap-1" asChild>
          <Link href="/dashboard/add-job">
            <Plus className="h-4 w-4" />
            Add job
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
          jobTypes={jobTypes}
          sources={sources}
        />
        {filteredJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No jobs match your filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Adjust filters or clear selections to see jobs.</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setFilters(defaultKanbanFilters)}>
              Clear filters
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={(e) => void onDragEnd(e)}
            onDragCancel={onDragCancel}
          >
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
              {JOB_STATUSES.map((status) => {
                const columnJobs = grouped.get(status) ?? [];
                return (
                  <KanbanColumn key={status} status={status} count={columnJobs.length}>
                    {columnJobs.map((job) => (
                      <DraggableJob
                        key={job._id}
                        job={job}
                        onEdit={(j) => setEditJob(j)}
                        onDelete={(j) => setDeleteJob(j)}
                      />
                    ))}
                  </KanbanColumn>
                );
              })}
            </div>
            <DragOverlay dropAnimation={{ duration: 180, easing: "ease" }}>
              {activeJob ? (
                <div className="pointer-events-none w-[min(100vw-2rem,260px)] rotate-1 cursor-grabbing shadow-lg">
                  <JobCard job={activeJob} onEdit={() => {}} onDelete={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <JobEditDialog
        job={editJob}
        open={!!editJob}
        onOpenChange={(o) => !o && setEditJob(null)}
        onSaved={mergeSaved}
      />

      <AlertDialog open={!!deleteJob} onOpenChange={(o) => !o && !deleting && setDeleteJob(null)}>
        <AlertDialogContent onPointerDown={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &quot;{deleteJob?.title}&quot; from your board. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
