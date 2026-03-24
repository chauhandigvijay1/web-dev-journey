"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FileText,
  Flame,
  Ghost,
  Loader2,
  Mail,
  Pin,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { api } from "@/services/api";
import { JOB_STATUSES, isJobStatus, type Job, type JobStatus } from "@/lib/job-types";
import {
  formatFollowUpBadgeLabel,
  formatFollowUpLabel,
  getFollowUpBucket,
  type FollowUpBucket,
} from "@/lib/reminders";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<JobStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

function formatWhen(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "-";
  }
}

function followUpBadgeClass(bucket: FollowUpBucket) {
  switch (bucket) {
    case "overdue":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "today":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "upcoming":
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    default:
      return "border-border/70 bg-background text-muted-foreground";
  }
}

function ConfidenceStars({ score }: { score: number }) {
  const n = Math.min(5, Math.max(0, Math.ceil(Number(score) / 20)));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Confidence ${score}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/35"
          )}
        />
      ))}
      <span className="ml-2 text-sm tabular-nums text-muted-foreground">{score}</span>
    </div>
  );
}

function parseMoneyLoose(s: string) {
  const t = s.replace(/[^\d.-]/g, "");
  if (!t) return null;
  const n = Number.parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

export function JobDetailView({ jobId }: { jobId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [flagSaving, setFlagSaving] = useState<"pin" | "important" | "ghost" | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiKind, setAiKind] = useState<"email" | "summary">("email");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState("");
  const [aiCopied, setAiCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: { job: Job }; message?: string }>(
        `/jobs/${jobId}`
      );
      if (!data.success || !data.data?.job) {
        setError(data.message ?? "Could not load job");
        setJob(null);
        return;
      }
      const j = data.data.job;
      setJob(j);
      setNotes(j.notes ?? "");
      setNotesDirty(false);
    } catch (e) {
      const msg =
        axios.isAxiosError(e) &&
        e.response?.data &&
        typeof (e.response.data as { message?: string }).message === "string"
          ? (e.response.data as { message: string }).message
          : null;
      setError(msg ?? "Could not load job");
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  const mergeJob = useCallback((patch: Partial<Job>) => {
    setJob((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  async function patchJob(body: Record<string, unknown>) {
    const { data } = await api.put<{ success: boolean; data?: { job: Job }; message?: string }>(
      `/jobs/${jobId}`,
      body
    );
    if (!data.success || !data.data?.job) throw new Error(data.message ?? "Update failed");
    const j = data.data.job;
    setJob(j);
    const updatingNotes = Object.prototype.hasOwnProperty.call(body, "notes");
    if (updatingNotes || !notesDirty) {
      setNotes(j.notes ?? "");
      if (updatingNotes) setNotesDirty(false);
    }
  }

  async function toggleFlag(key: "isPinned" | "isImportant" | "isGhosted", label: "pin" | "important" | "ghost") {
    if (!job || flagSaving) return;
    const next = !job[key];
    setFlagSaving(label);
    const prev = job;
    mergeJob({ [key]: next });
    try {
      await patchJob({ [key]: next });
    } catch {
      setJob(prev);
    } finally {
      setFlagSaving(null);
    }
  }

  async function onStatusChange(next: JobStatus) {
    if (!job || job.status === next || statusSaving) return;
    setStatusSaving(true);
    const prev = job.status;
    mergeJob({ status: next });
    try {
      await patchJob({ status: next });
    } catch {
      mergeJob({ status: prev });
    } finally {
      setStatusSaving(false);
    }
  }

  async function saveNotes() {
    if (!job || savingNotes) return;
    setSavingNotes(true);
    try {
      await patchJob({ notes });
    } catch {
    } finally {
      setSavingNotes(false);
    }
  }

  async function onResumeFile(file: File | null) {
    if (!file || !job || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const { data } = await api.post<{ success: boolean; data?: { url: string }; message?: string }>(
        "/upload/resume",
        fd
      );
      if (!data.success || !data.data?.url) throw new Error(data.message ?? "Upload failed");
      await patchJob({ resumeUrl: data.data.url });
    } catch (e) {
      const msg =
        axios.isAxiosError(e) &&
        e.response?.data &&
        typeof (e.response.data as { message?: string }).message === "string"
          ? (e.response.data as { message: string }).message
          : null;
      setUploadError(msg ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function runAi(kind: "email" | "summary") {
    if (!job) return;
    setAiKind(kind);
    setAiError(null);
    setAiOutput("");
    setAiCopied(false);
    setAiOpen(true);
    setAiLoading(true);
    try {
      if (kind === "email") {
        const { data } = await api.post<{ success: boolean; data?: string; message?: string }>(
          "/ai/follow-up",
          { title: job.title, company: job.company ?? "", notes }
        );
        if (!data.success || typeof data.data !== "string") throw new Error(data.message ?? "Request failed");
        setAiOutput(data.data);
      } else {
        const { data } = await api.post<{ success: boolean; data?: string; message?: string }>(
          "/ai/summarize",
          { jobId: job._id }
        );
        if (!data.success || typeof data.data !== "string") throw new Error(data.message ?? "Request failed");
        setAiOutput(data.data);
      }
    } catch (e) {
      const msg =
        axios.isAxiosError(e) &&
        e.response?.data &&
        typeof (e.response.data as { message?: string }).message === "string"
          ? (e.response.data as { message: string }).message
          : e instanceof Error
            ? e.message
            : "Something went wrong";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  }

  async function copyAiOutput() {
    if (!aiOutput) return;
    try {
      await navigator.clipboard.writeText(aiOutput);
      setAiCopied(true);
      window.setTimeout(() => setAiCopied(false), 2000);
    } catch {
      setAiError("Could not copy to clipboard");
    }
  }

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      const { data } = await api.delete<{ success: boolean }>(`/jobs/${jobId}`);
      if (!data.success) throw new Error("fail");
      router.replace("/dashboard/jobs");
    } catch {
      setDeleting(false);
    }
  }

  const salaryInsight = useMemo(() => {
    const exp = (job?.expectedSalary ?? "").trim();
    const off = (job?.offeredSalary ?? "").trim();
    if (!exp && !off) return { same: true, diffLabel: null as string | null };
    if (exp === off) return { same: true, diffLabel: null as string | null };
    const a = parseMoneyLoose(exp);
    const b = parseMoneyLoose(off);
    if (a != null && b != null && a !== b) {
      const d = b - a;
      const sign = d > 0 ? "+" : "";
      return { same: false, diffLabel: `${sign}${d.toLocaleString()} vs expected` };
    }
    return { same: false, diffLabel: "Values differ" };
  }, [job?.expectedSalary, job?.offeredSalary]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-8 text-center">
        <p className="text-sm text-destructive">{error ?? "Job not found"}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>
            Retry
          </Button>
          <Button type="button" size="sm" asChild>
            <Link href="/dashboard/jobs">Back to jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const st = isJobStatus(job.status) ? job.status : "applied";
  const followUpBucket = getFollowUpBucket(job.followUpDate);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 px-2" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4" />
            Jobs
          </Link>
        </Button>
      </div>

      <header className="space-y-4 border-b border-border/80 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{job.title}</h1>
            <p className="text-lg text-muted-foreground">{job.company?.trim() || "-"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {STATUS_LABEL[st]}
              </Badge>
              {followUpBucket !== "none" ? (
                <Badge variant="outline" className={cn(followUpBadgeClass(followUpBucket))}>
                  {formatFollowUpBadgeLabel(followUpBucket)}
                </Badge>
              ) : null}
              <div className="relative">
                <select
                  aria-label="Job status"
                  disabled={statusSaving}
                  value={st}
                  onChange={(e) => void onStatusChange(e.target.value as JobStatus)}
                  className={cn(
                    "h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
                    statusSaving && "opacity-70"
                  )}
                >
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
                {statusSaving ? (
                  <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={job.isPinned ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              disabled={!!flagSaving}
              onClick={() => void toggleFlag("isPinned", "pin")}
              aria-pressed={!!job.isPinned}
            >
              {flagSaving === "pin" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
              Pin
            </Button>
            <Button
              type="button"
              variant={job.isImportant ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              disabled={!!flagSaving}
              onClick={() => void toggleFlag("isImportant", "important")}
              aria-pressed={!!job.isImportant}
            >
              {flagSaving === "important" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Flame className="h-4 w-4" />
              )}
              Important
            </Button>
            <Button
              type="button"
              variant={job.isGhosted ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              disabled={!!flagSaving}
              onClick={() => void toggleFlag("isGhosted", "ghost")}
              aria-pressed={!!job.isGhosted}
            >
              {flagSaving === "ghost" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ghost className="h-4 w-4" />
              )}
              Ghosted
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Basic info</CardTitle>
            <CardDescription>Role summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">{job.location?.trim() || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Job type</p>
              <p className="font-medium">{job.jobType?.trim() || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Salary</p>
              <p className="font-medium">{job.salary?.trim() || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Follow-up</p>
              <p className="font-medium">
                {job.followUpDate ? formatFollowUpLabel(job.followUpDate) : "Not scheduled"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            !salaryInsight.same &&
              (job.expectedSalary?.trim() || job.offeredSalary?.trim()) &&
              "border-amber-500/40 bg-amber-500/[0.06]"
          )}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Salary insights</CardTitle>
            <CardDescription>Expected vs offered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div
                className={cn(
                  "rounded-lg border p-3",
                  !salaryInsight.same && "border-amber-500/50 bg-background/80"
                )}
              >
                <p className="text-xs font-medium text-muted-foreground">Expected salary</p>
                <p className="mt-1 text-sm font-semibold">{job.expectedSalary?.trim() || "-"}</p>
              </div>
              <div
                className={cn(
                  "rounded-lg border p-3",
                  !salaryInsight.same && "border-primary/40 bg-background/80"
                )}
              >
                <p className="text-xs font-medium text-muted-foreground">Offered salary</p>
                <p className="mt-1 text-sm font-semibold">{job.offeredSalary?.trim() || "-"}</p>
              </div>
            </div>
            {!salaryInsight.same && salaryInsight.diffLabel ? (
              <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-400">
                {salaryInsight.diffLabel}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Company</CardTitle>
          <CardDescription>Context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Company type</p>
            <p className="font-medium">{job.companyType?.trim() || "-"}</p>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Confidence score</p>
            <ConfidenceStars score={job.confidenceScore ?? 0} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
          <CardDescription>Private notes for this application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              setNotesDirty(true);
            }}
            placeholder="Interview prep, contacts, next steps..."
            rows={6}
            className="min-h-[140px] resize-y"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!notesDirty || savingNotes}
              onClick={() => void saveNotes()}
            >
              {savingNotes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save notes"
              )}
            </Button>
            {!notesDirty && !savingNotes ? (
              <span className="text-xs text-muted-foreground">Saved</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI assistant</CardTitle>
          <CardDescription>Generate content with Groq</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            disabled={aiLoading}
            onClick={() => void runAi("email")}
          >
            {aiLoading && aiKind === "email" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Generate follow-up email
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            disabled={aiLoading}
            onClick={() => void runAi("summary")}
          >
            {aiLoading && aiKind === "summary" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Summarize job
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resume</CardTitle>
          <CardDescription>PDF or Word, up to 10MB</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {job.resumeUrl?.trim() ? (
            <a
              href={job.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              Open uploaded resume
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
          )}
          {uploadError ? (
            <p className="text-sm text-destructive" role="alert">
              {uploadError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              tabIndex={-1}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                void onResumeFile(f ?? null);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading..." : "Upload resume"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timeline</CardTitle>
          <CardDescription>Key milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-0 border-l-2 border-border pl-5">
            <li className="relative pb-8">
              <span className="absolute -left-[calc(0.25rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{formatWhen(job.createdAt)}</p>
            </li>
            <li className="relative pb-8">
              <span className="absolute -left-[calc(0.25rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-muted-foreground/50" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last updated</p>
              <p className="text-sm font-medium">{formatWhen(job.updatedAt)}</p>
            </li>
            <li className="relative">
              <span className="absolute -left-[calc(0.25rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary/80" />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <p className="text-sm font-medium capitalize">{STATUS_LABEL[st]}</p>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">Remove this job from your tracker permanently.</p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete job
        </Button>
      </div>

      <Dialog
        open={aiOpen}
        onOpenChange={(o) => {
          setAiOpen(o);
          if (!o) {
            setAiError(null);
            setAiOutput("");
            setAiCopied(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl gap-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>{aiKind === "email" ? "Follow-up email" : "Job summary"}</DialogTitle>
            <DialogDescription className="sr-only">
              {aiKind === "email" ? "Generated follow-up email draft" : "Generated job summary"}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[120px] space-y-3">
            {aiLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </div>
            ) : null}
            {aiError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {aiError}
              </p>
            ) : null}
            {!aiLoading && aiOutput ? (
              <pre className="max-h-[min(50vh,420px)] overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
                {aiOutput}
              </pre>
            ) : null}
          </div>
          {!aiLoading && aiOutput ? (
            <DialogFooter className="gap-2 sm:justify-between">
              <span className="text-xs text-muted-foreground">{aiCopied ? "Copied" : "\u00a0"}</span>
              <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => void copyAiOutput()}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={(o) => !deleting && setDeleteOpen(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes &quot;{job.title}&quot; from your board. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={() => void confirmDelete()}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
