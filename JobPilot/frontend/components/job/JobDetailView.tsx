"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { type Job, type JobStatus } from "@/lib/job-types";
import { getFollowUpBucket } from "@/lib/reminders";
import { parseMoneyLoose } from "./job-detail-utils";
import { AiOutputDialog, DeleteJobDialog } from "./job-detail-dialogs";
import {
  JobDetailHeader,
  JobBasicInfoCard,
  SalaryInsightCard,
  CompanyCard,
  SourceCard,
  NotesCard,
  CrmCard,
  AiAssistantCard,
  ResumeCard,
  TimelineCard,
  DeleteSection,
  DescriptionCard,
} from "./job-detail-sections";

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
  const [aiKind, setAiKind] = useState<"email" | "summary" | "interview" | "cover-letter" | "tailor-resume">("email");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState("");
  const [aiCopied, setAiCopied] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRole, setNewContactRole] = useState("Recruiter");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactLinkedin, setNewContactLinkedin] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: { job: Job }; message?: string }>(`/jobs/${jobId}`);
      if (!data.success || !data.data?.job) throw new Error(data.message ?? "Not found");
      setJob(data.data.job);
      setNotes(data.data.job.notes ?? "");
      setNotesDirty(false);
    } catch (e) {
      setError(
        axios.isAxiosError(e) && typeof e.response?.data?.message === "string"
          ? e.response.data.message
          : "Could not load job details."
      );
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { void load(); }, [load]);

  const mergeJob = useCallback((patch: Partial<Job>) => {
    setJob((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  const patchJob = async (body: Partial<Job>) => {
    const { data } = await api.patch<{ success: boolean; data?: { job: Job }; message?: string }>(`/jobs/${jobId}`, body);
    if (!data.success || !data.data?.job) throw new Error(data.message ?? "Update failed");
    if (body.contacts) setJob(prev => prev ? { ...prev, contacts: data.data!.job.contacts } : null);
    const updatingNotes = Object.prototype.hasOwnProperty.call(body, "notes");
    if (updatingNotes || !notesDirty) {
      setNotes(data.data.job.notes ?? "");
      if (updatingNotes) setNotesDirty(false);
    }
  };

  const addContact = async () => {
    if (!job || !newContactName || addingContact) return;
    setAddingContact(true);
    try {
      await patchJob({ contacts: [...(job.contacts || []), { name: newContactName, role: newContactRole, email: newContactEmail, linkedin: newContactLinkedin, status: "Contacted" }] });
      setNewContactName(""); setNewContactEmail(""); setNewContactLinkedin(""); setNewContactRole("Recruiter");
    } catch (e) { console.error(e); }
    finally { setAddingContact(false); }
  };

  const toggleFlag = async (key: "isPinned" | "isImportant" | "isGhosted", label: "pin" | "important" | "ghost") => {
    if (!job || flagSaving) return;
    const next = !job[key];
    setFlagSaving(label);
    const prev = job;
    mergeJob({ [key]: next });
    try { await patchJob({ [key]: next }); }
    catch { setJob(prev); }
    finally { setFlagSaving(null); }
  };

  const onStatusChange = async (next: JobStatus) => {
    if (!job || job.status === next || statusSaving) return;
    setStatusSaving(true);
    const prev = job.status;
    mergeJob({ status: next });
    try { await patchJob({ status: next }); }
    catch { mergeJob({ status: prev }); }
    finally { setStatusSaving(false); }
  };

  const saveNotes = async () => {
    if (!job || savingNotes) return;
    setSavingNotes(true);
    try { await patchJob({ notes }); }
    finally { setSavingNotes(false); }
  };

  const onResumeFile = async (file: File) => {
    if (!job || uploading) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("resume", file);
      const { data } = await api.post<{ success: boolean; data?: { url: string }; message?: string }>("/upload/resume", fd);
      if (!data.success || !data.data?.url) throw new Error(data.message ?? "Upload failed");
      await patchJob({ resumeUrl: data.data.url });
    } catch (e) {
      const msg = axios.isAxiosError(e) && e.response?.data && typeof (e.response.data as { message?: string }).message === "string"
        ? (e.response.data as { message: string }).message : null;
      setUploadError(msg ?? "Upload failed");
    } finally { setUploading(false); }
  };

  const runAi = async (kind: "email" | "summary" | "interview" | "cover-letter" | "tailor-resume") => {
    if (!job) return;
    setAiKind(kind); setAiError(null); setAiOutput(""); setAiCopied(false); setAiOpen(true); setAiLoading(true);
    try {
      const endpoints: Record<string, string> = {
        email: "/ai/follow-up",
        summary: "/ai/summarize",
        interview: "/ai/interview-questions",
        "cover-letter": "/ai/cover-letter",
        "tailor-resume": "/ai/tailor-resume",
      };
      const body = kind === "email"
        ? { title: job.title, company: job.company ?? "", notes }
        : { jobId: job._id };
      const { data } = await api.post<{ success: boolean; data?: string; message?: string }>(endpoints[kind], body);
      if (!data.success || typeof data.data !== "string") throw new Error(data.message ?? "Request failed");
      setAiOutput(data.data);
    } catch (e) {
      setAiError(axios.isAxiosError(e) && e.response?.data && typeof (e.response.data as { message?: string }).message === "string"
        ? (e.response.data as { message: string }).message
        : e instanceof Error ? e.message : "Something went wrong");
    } finally { setAiLoading(false); }
  };

  const copyAiOutput = async () => {
    if (!aiOutput) return;
    try { await navigator.clipboard.writeText(aiOutput); setAiCopied(true); window.setTimeout(() => setAiCopied(false), 2000); }
    catch { setAiError("Could not copy to clipboard"); }
  };

  const confirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const { data } = await api.delete<{ success: boolean }>(`/jobs/${jobId}`);
      if (!data.success) throw new Error("fail");
      router.replace("/dashboard/jobs");
    } catch { setDeleting(false); }
  };

  const salaryInsight = useMemo(() => {
    const exp = (job?.expectedSalary ?? "").trim();
    const off = (job?.offeredSalary ?? "").trim();
    if (!exp && !off) return { same: true, diffLabel: null as string | null };
    if (exp === off) return { same: true, diffLabel: null as string | null };
    const a = parseMoneyLoose(exp);
    const b = parseMoneyLoose(off);
    if (a != null && b != null && a !== b) {
      const d = b - a;
      return { same: false, diffLabel: `${d > 0 ? "+" : ""}${d.toLocaleString()} vs expected` };
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
          <Button type="button" variant="outline" size="sm" onClick={() => void load()}>Retry</Button>
          <Button type="button" size="sm" asChild><Link href="/dashboard/jobs">Back to jobs</Link></Button>
        </div>
      </div>
    );
  }

  const st = (job.status && ["saved", "applied", "oa", "interview", "offer", "rejected"].includes(job.status) ? job.status : "saved") as JobStatus;
  const followUpBucket = getFollowUpBucket(job.followUpDate);

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-10">
      <JobDetailHeader
        job={job} st={st} followUpBucket={followUpBucket}
        statusSaving={statusSaving} flagSaving={flagSaving}
        onStatusChange={onStatusChange} onToggleFlag={toggleFlag}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <JobBasicInfoCard job={job} />
        <SalaryInsightCard expectedSalary={job.expectedSalary} offeredSalary={job.offeredSalary} />
      </div>

      <CompanyCard job={job} />
      <SourceCard job={job} />
      <NotesCard notes={notes} dirty={notesDirty} saving={savingNotes} onChange={(v) => { setNotes(v); setNotesDirty(true); }} onSave={saveNotes} />
      <CrmCard
        contacts={job.contacts}
        newContactName={newContactName} newContactRole={newContactRole}
        newContactEmail={newContactEmail} newContactLinkedin={newContactLinkedin}
        addingContact={addingContact}
        onNameChange={setNewContactName} onRoleChange={setNewContactRole}
        onEmailChange={setNewContactEmail} onLinkedinChange={setNewContactLinkedin}
        onAdd={addContact}
      />
      <DescriptionCard description={job.descriptionSummary} />
      <AiAssistantCard aiLoading={aiLoading} aiKind={aiKind} onRunAi={runAi} />
      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onResumeFile(f);
          e.target.value = "";
        }}
      />
      <ResumeCard resumeUrl={job.resumeUrl} uploading={uploading} uploadError={uploadError} onUploadFile={onResumeFile} onClickUpload={() => fileRef.current?.click()} />
      <TimelineCard job={job} st={st} />
      <DeleteSection onDelete={() => setDeleteOpen(true)} />

      <AiOutputDialog
        open={aiOpen}
        onOpenChange={(o) => { setAiOpen(o); if (!o) { setAiError(null); setAiOutput(""); setAiCopied(false); } }}
        aiKind={aiKind} aiLoading={aiLoading} aiError={aiError}
        aiOutput={aiOutput} aiCopied={aiCopied} onCopy={copyAiOutput}
      />
      <DeleteJobDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        deleting={deleting}
        jobTitle={job.title}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
