"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { followUpDateInputValue, serializeFollowUpDate } from "@/lib/follow-up-date";
import { api } from "@/services/api";
import type { Job } from "@/lib/job-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type JobEditDialogProps = {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (job: Job) => void;
};

export function JobEditDialog({ job, open, onOpenChange, onSaved }: JobEditDialogProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [salary, setSalary] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [confidenceScore, setConfidenceScore] = useState("0");
  const [followUpDate, setFollowUpDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!job) return;
    setTitle(job.title);
    setCompany(job.company ?? "");
    setSalary(job.salary ?? "");
    setCompanyType(job.companyType ?? "");
    setConfidenceScore(String(job.confidenceScore ?? 0));
    setFollowUpDate(followUpDateInputValue(job.followUpDate));
    setError(null);
  }, [job]);

  async function handleSave() {
    if (!job) return;
    setError(null);
    setSaving(true);
    try {
      const score = Number(confidenceScore);
      const { data } = await api.put<{ success: boolean; data?: { job: Job }; message?: string }>(
        `/jobs/${job._id}`,
        {
          title: title.trim(),
          company,
          salary,
          companyType,
          confidenceScore: Number.isFinite(score) ? score : 0,
          followUpDate: serializeFollowUpDate(followUpDate),
        }
      );
      if (!data.success || !data.data?.job) {
        setError(data.message ?? "Could not save");
        return;
      }
      onSaved(data.data.job);
      onOpenChange(false);
    } catch (e) {
      const msg =
        axios.isAxiosError(e) &&
        e.response?.data &&
        typeof (e.response.data as { message?: string }).message === "string"
          ? (e.response.data as { message: string }).message
          : null;
      setError(msg ?? "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDown={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Edit job</DialogTitle>
          <DialogDescription>Update details and save.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company">Company</Label>
            <Input id="edit-company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-salary">Salary</Label>
            <Input id="edit-salary" value={salary} onChange={(e) => setSalary(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-company-type">Company type</Label>
            <Input
              id="edit-company-type"
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-confidence">Confidence score</Label>
            <Input
              id="edit-confidence"
              type="number"
              min={0}
              value={confidenceScore}
              onChange={(e) => setConfidenceScore(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-follow-up-date">Follow-up date</Label>
            <Input
              id="edit-follow-up-date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={saving || !title.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
