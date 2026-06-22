"use client";

import { useState } from "react";
import { Loader2, Save, Github, Linkedin, Globe, Target } from "lucide-react";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/lib/httpError";
import type { ResumeProfile } from "@/lib/auto-hunter-types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function CareerBrainForm({
  profile,
  onUpdate,
}: {
  profile: ResumeProfile;
  onUpdate: (profile: ResumeProfile) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    githubUrl: profile.parsedData.githubUrl || "",
    linkedinUrl: profile.parsedData.linkedinUrl || "",
    portfolioUrl: profile.parsedData.portfolioUrl || "",
    careerGoals: profile.parsedData.careerGoals || "",
  });

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data } = await api.patch<{ success: boolean; data?: { profile: ResumeProfile }; message?: string }>(
        "/auto-hunter/resume",
        form
      );
      if (!data.success || !data.data?.profile) {
        setError(data.message ?? "Failed to save Career Brain");
        return;
      }
      onUpdate(data.data.profile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save Career Brain"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Career Brain core</CardTitle>
        <CardDescription>
          Provide extra context that isn&apos;t on your resume. This powers better cover letters and interview prep.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
            Career Brain updated successfully.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Linkedin className="h-3 w-3" /> LinkedIn URL</Label>
            <Input
              placeholder="https://linkedin.com/in/..."
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Github className="h-3 w-3" /> GitHub URL</Label>
            <Input
              placeholder="https://github.com/..."
              value={form.githubUrl}
              onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Globe className="h-3 w-3" /> Portfolio URL</Label>
            <Input
              placeholder="https://..."
              value={form.portfolioUrl}
              onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Target className="h-3 w-3" /> Career goals</Label>
          <Textarea
            placeholder="e.g. I want to transition from frontend to full-stack within the next 2 years..."
            value={form.careerGoals}
            onChange={(e) => setForm({ ...form, careerGoals: e.target.value })}
            className="h-20 resize-y"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => void handleSave()} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Brain
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
