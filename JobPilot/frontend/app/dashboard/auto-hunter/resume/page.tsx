"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, UploadCloud } from "lucide-react";
import type { JobHunterPreferences, ResumeProfile } from "@/lib/auto-hunter-types";
import { getApiErrorMessage } from "@/lib/httpError";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type ResumeResponse = {
  profile: ResumeProfile;
  preferences: JobHunterPreferences;
  initialScan: {
    newMatches: number;
    alertsSent: number;
    matchesStored: number;
  } | null;
  warnings: string[];
};

export default function AutoHunterResumePage() {
  const [profile, setProfile] = useState<ResumeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<{ success: boolean; data?: { profile: ResumeProfile | null }; message?: string }>(
        "/auto-hunter/resume"
      );
      if (!data.success) {
        setError(data.message ?? "Could not load resume profile");
        setProfile(null);
        return;
      }
      setProfile(data.data?.profile ?? null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load resume profile"));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("runInitialScan", "true");
      const { data } = await api.post<{ success: boolean; data?: ResumeResponse; message?: string }>(
        "/auto-hunter/resume",
        formData
      );

      if (!data.success || !data.data) {
        setError(data.message ?? "Could not upload and parse resume");
        return;
      }

      setProfile(data.data.profile);
      const warnings = data.data.warnings?.length ? ` ${data.data.warnings.join(" ")}` : "";
      const scanSummary = data.data.initialScan
        ? ` Initial scan stored ${data.data.initialScan.matchesStored} matches and sent ${data.data.initialScan.alertsSent} alerts.`
        : "";
      setMessage(`Resume uploaded and parsed successfully.${scanSummary}${warnings}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not upload and parse resume"));
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 rounded-[28px]" />
        <Skeleton className="h-64 rounded-[28px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Resume upload</CardTitle>
          <CardDescription>
            Upload a PDF or Word resume. JobPilot parses skills, roles, experience, keywords, and recommendations automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200">
              {message}
            </div>
          ) : null}
          <div className="flex flex-col gap-4 rounded-[28px] border border-dashed border-border/70 bg-background/60 p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <UploadCloud className="h-4 w-4 text-primary" />
                Resume source file
              </div>
              <p className="text-sm text-muted-foreground">Accepted formats: `.pdf`, `.doc`, `.docx` up to 10MB.</p>
              {profile?.resumeUrl ? (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open current uploaded resume
                </a>
              ) : null}
            </div>
            <div className="w-full max-w-md space-y-2">
              <Label htmlFor="resume-upload">Upload new file</Label>
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  void handleUpload(file);
                  event.target.value = "";
                }}
              />
              {uploading ? (
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Parsing resume and running the initial match scan...
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Parsed summary</CardTitle>
                <CardDescription>
                  File: {profile.fileName} | Last parsed{" "}
                  {profile.lastParsedAt ? new Date(profile.lastParsedAt).toLocaleString() : "-"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {profile.parsedData.summary || "No summary extracted."}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Seniority</p>
                    <p className="mt-2 text-lg font-semibold">{profile.parsedData.seniorityLevel || "Not inferred"}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Location preference</p>
                    <p className="mt-2 text-lg font-semibold">{profile.parsedData.locationPreference || "Not inferred"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Resume improvements based on parsing clarity and match quality.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.parsedData.suggestedResumeImprovements.length ? (
                  profile.parsedData.suggestedResumeImprovements.map((item) => (
                    <div key={item} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No improvement suggestions yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Skills and tech stack</CardTitle>
                <CardDescription>What the parser thinks you can already target.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.parsedData.skills.length ? (
                      profile.parsedData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No skills extracted.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Tech stack</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.parsedData.techStack.length ? (
                      profile.parsedData.techStack.map((skill) => (
                        <Badge key={skill} variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No tech stack extracted.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Target roles and background</CardTitle>
                <CardDescription>Role alignment extracted from resume content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Preferred roles</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.parsedData.preferredRoles.length ? (
                      profile.parsedData.preferredRoles.map((role) => (
                        <Badge key={role} variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No preferred roles inferred.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Education</p>
                  <div className="space-y-2">
                    {profile.parsedData.education.length ? (
                      profile.parsedData.education.map((item) => (
                        <div key={item} className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                          {item}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No education details extracted.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-foreground">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.parsedData.certifications.length ? (
                      profile.parsedData.certifications.map((item) => (
                        <Badge key={item} variant="outline" className="rounded-full px-3 py-1 text-[11px]">
                          {item}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No certifications detected.</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="border-dashed border-border/70 bg-card/80">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            Upload a resume to generate your parsed profile and begin automated discovery.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
