"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Flame,
  Ghost,
  Loader2,
  Mail,
  MessageSquareText,
  FileText,
  Pin,
  Trash2,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, JOB_STATUSES, isJobStatus, type Job, type JobStatus } from "@/lib/job-types";
import { formatFollowUpBadgeLabel, formatFollowUpLabel, getFollowUpBucket } from "@/lib/reminders";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfidenceStars, formatWhen, followUpBadgeClass } from "./job-detail-utils";

const STATUS_LABEL = STATUS_LABELS;

export function JobDetailHeader({
  job,
  st,
  followUpBucket,
  statusSaving,
  flagSaving,
  onStatusChange,
  onToggleFlag,
}: {
  job: Job;
  st: JobStatus;
  followUpBucket: ReturnType<typeof getFollowUpBucket>;
  statusSaving: boolean;
  flagSaving: "pin" | "important" | "ghost" | null;
  onStatusChange: (next: JobStatus) => void;
  onToggleFlag: (key: "isPinned" | "isImportant" | "isGhosted", label: "pin" | "important" | "ghost") => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="ghost" size="sm" className="gap-1.5 px-2" asChild>
        <Link href="/dashboard/jobs">
          <ArrowLeft className="h-4 w-4" />
          Jobs
        </Link>
      </Button>

      <header className="w-full space-y-4 border-b border-border/80 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{job.title}</h1>
            <p className="text-lg text-muted-foreground">{job.company?.trim() || "-"}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">{STATUS_LABEL[st]}</Badge>
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
                  onChange={(e) => onStatusChange(e.target.value as JobStatus)}
                  className={cn(
                    "h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
                    statusSaving && "opacity-70"
                  )}
                >
                  {JOB_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                {statusSaving ? (
                  <Loader2 className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                ) : null}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <FlagButton
              label="pin"
              active={!!job.isPinned}
              icon={<Pin className="h-4 w-4" />}
              isSaving={flagSaving === "pin"}
              onClick={() => onToggleFlag("isPinned", "pin")}
              aria-pressed={!!job.isPinned}
            />
            <FlagButton
              label="Important"
              active={!!job.isImportant}
              icon={<Flame className="h-4 w-4" />}
              isSaving={flagSaving === "important"}
              onClick={() => onToggleFlag("isImportant", "important")}
              aria-pressed={!!job.isImportant}
            />
            <FlagButton
              label="Ghosted"
              active={!!job.isGhosted}
              icon={<Ghost className="h-4 w-4" />}
              isSaving={flagSaving === "ghost"}
              onClick={() => onToggleFlag("isGhosted", "ghost")}
              aria-pressed={!!job.isGhosted}
            />
          </div>
        </div>
      </header>
    </div>
  );
}

function FlagButton({
  label,
  active,
  icon,
  isSaving,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  isSaving: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      className="gap-1.5"
      disabled={isSaving}
      onClick={onClick}
    >
      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Button>
  );
}

export function JobBasicInfoCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Basic info</CardTitle>
        <CardDescription>Role summary</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <InfoRow label="Location" value={job.location?.trim() || "-"} />
        <InfoRow
          label="Locations"
          value={job.locations && job.locations.length > 0 ? job.locations.join(", ") : job.location?.trim() || "-"}
        />
        <InfoRow label="Job type" value={job.jobType?.trim() || "-"} />
        <InfoRow label="Salary" value={job.salary?.trim() || "-"} />
        <InfoRow label="Work mode" value={job.workMode?.trim() || "-"} />
        <InfoRow label="Experience" value={job.experience?.trim() || "-"} />
        <InfoRow label="Follow-up" value={job.followUpDate ? formatFollowUpLabel(job.followUpDate) : "Not scheduled"} />
        <InfoRow label="Apply deadline" value={job.applyDeadline ? formatFollowUpLabel(job.applyDeadline) : "Not scheduled"} />
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function SalaryInsightCard({
  expectedSalary,
  offeredSalary,
}: {
  expectedSalary?: string;
  offeredSalary?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Salary insights</CardTitle>
        <CardDescription>Expected vs offered</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium text-muted-foreground">Expected salary</p>
            <p className="mt-1 text-sm font-semibold">{expectedSalary?.trim() || "-"}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs font-medium text-muted-foreground">Offered salary</p>
            <p className="mt-1 text-sm font-semibold">{offeredSalary?.trim() || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompanyCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Company</CardTitle>
        <CardDescription>Context</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoRow label="Company type" value={job.companyType?.trim() || "-"} />
        <InfoRow label="Qualification" value={job.qualification?.trim() || "-"} />
        <InfoRow label="Skills" value={job.skills && job.skills.length > 0 ? job.skills.join(", ") : "-"} />
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Confidence score</p>
          <ConfidenceStars score={job.confidenceScore ?? 0} />
        </div>
      </CardContent>
    </Card>
  );
}

export function SourceCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Source</CardTitle>
        <CardDescription>Original listing reference</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <InfoRow label="Source" value={job.source?.trim() || "-"} />
        <div>
          <p className="text-muted-foreground">Original apply link</p>
          {job.originalApplyLink?.trim() ? (
            <a
              href={job.originalApplyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium text-primary underline-offset-4 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open original listing
            </a>
          ) : (
            <p className="font-medium">-</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function NotesCard({
  notes,
  dirty,
  saving,
  onChange,
  onSave,
}: {
  notes: string;
  dirty: boolean;
  saving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Notes</CardTitle>
        <CardDescription>Private notes for this application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Interview prep, contacts, next steps..."
          rows={6}
          className="min-h-[140px] resize-y"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" disabled={!dirty || saving} onClick={onSave}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
            ) : (
              "Save notes"
            )}
          </Button>
          {!dirty && !saving ? (
            <span className="text-xs text-muted-foreground">Saved</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function CrmCard({
  contacts,
  newContactName,
  newContactRole,
  newContactEmail,
  newContactLinkedin,
  addingContact,
  onNameChange,
  onRoleChange,
  onEmailChange,
  onLinkedinChange,
  onAdd,
}: {
  contacts: Job["contacts"];
  newContactName: string;
  newContactRole: string;
  newContactEmail: string;
  newContactLinkedin: string;
  addingContact: boolean;
  onNameChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onLinkedinChange: (v: string) => void;
  onAdd: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Career CRM</CardTitle>
        <CardDescription>Track networking contacts and recruiters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts && contacts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact, idx) => (
              <div key={contact._id || idx} className="rounded-lg border bg-card text-card-foreground p-3 shadow-sm text-sm flex flex-col gap-1">
                <div className="font-semibold">{contact.name}</div>
                <div className="text-muted-foreground">{contact.role}</div>
                {contact.email ? <div className="text-muted-foreground break-all">{contact.email}</div> : null}
                {contact.linkedin?.startsWith("https://") ? (
                  <div className="text-muted-foreground break-all text-blue-500">
                    <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No contacts added yet.</p>
        )}
        <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Name" value={newContactName} onChange={(e) => onNameChange(e.target.value)} />
            <Input placeholder="Role (e.g. Recruiter)" value={newContactRole} onChange={(e) => onRoleChange(e.target.value)} />
            <Input placeholder="Email" value={newContactEmail} onChange={(e) => onEmailChange(e.target.value)} />
            <Input placeholder="LinkedIn URL" value={newContactLinkedin} onChange={(e) => onLinkedinChange(e.target.value)} />
          </div>
          <Button onClick={onAdd} disabled={addingContact || !newContactName}>
            {addingContact ? "Adding..." : "Add Contact"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AiAssistantCard({
  aiLoading,
  aiKind,
  onRunAi,
}: {
  aiLoading: boolean;
  aiKind: string;
  onRunAi: (kind: "email" | "summary" | "interview" | "cover-letter" | "tailor-resume") => void;
}) {
  const items = [
    { kind: "email" as const, label: "Generate follow-up email", icon: <Mail className="h-4 w-4" /> },
    { kind: "summary" as const, label: "Summarize job", icon: <FileText className="h-4 w-4" /> },
    { kind: "interview" as const, label: "Generate interview questions", icon: <MessageSquareText className="h-4 w-4" /> },
    { kind: "cover-letter" as const, label: "Generate cover letter", icon: <FileText className="h-4 w-4" /> },
    { kind: "tailor-resume" as const, label: "Tailor resume", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AI assistant</CardTitle>
        <CardDescription>Generate content with Groq</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Button
            key={item.kind}
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            disabled={aiLoading}
            onClick={() => onRunAi(item.kind)}
          >
            {aiLoading && aiKind === item.kind ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              item.icon
            )}
            {item.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

export function ResumeCard({
  resumeUrl,
  uploading,
  uploadError,
  onUploadFile,
  onClickUpload,
}: {
  resumeUrl?: string;
  uploading: boolean;
  uploadError: string | null;
  onUploadFile: (file: File) => void;
  onClickUpload: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Resume</CardTitle>
        <CardDescription>PDF or Word, up to 10MB</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {resumeUrl?.trim() ? (
          <a
            href={resumeUrl}
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
          <p className="text-sm text-destructive" role="alert">{uploadError}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            className="sr-only"
            tabIndex={-1}
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadFile(f);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="gap-2"
            disabled={uploading}
            onClick={onClickUpload}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload resume"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TimelineCard({ job, st }: { job: Job; st: JobStatus }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Timeline</CardTitle>
        <CardDescription>Key milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-0 border-l-2 border-border pl-5">
          <TimelineItem label="Created" value={formatWhen(job.createdAt)} color="bg-primary" />
          <TimelineItem label="Last updated" value={formatWhen(job.updatedAt)} color="bg-muted-foreground/50" />
          <TimelineItem label="Status" value={STATUS_LABEL[st]} color="bg-primary/80" />
        </ul>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <li className="relative pb-8 last:pb-0">
      <span className={`absolute -left-[calc(0.25rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background ${color}`} />
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </li>
  );
}

export function DeleteSection({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
      <p className="text-sm text-muted-foreground">Remove this job from your tracker permanently.</p>
      <Button type="button" variant="destructive" size="sm" className="gap-2" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
        Delete job
      </Button>
    </div>
  );
}

export function DescriptionCard({ description }: { description?: string }) {
  if (!description?.trim()) return null;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Description summary</CardTitle>
        <CardDescription>Quick snapshot from the source job post</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
