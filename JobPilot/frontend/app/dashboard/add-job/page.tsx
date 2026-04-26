"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { defaultStoredUserSettings } from "@/lib/authStorage";
import { serializeFollowUpDate } from "@/lib/follow-up-date";
import { api } from "@/services/api";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Extracted = {
  title: string;
  company: string;
  location: string;
  locations: string;
  jobType: string;
  salary: string;
  workMode: string;
  experience: string;
  skills: string;
  qualification: string;
  applyDeadline: string;
  descriptionSummary: string;
  originalApplyLink: string;
  source: string;
  warning?: string;
};

type ExtractedResponse = Omit<Extracted, "locations" | "skills"> & {
  locations?: string[] | string;
  skills?: string[] | string;
};

const emptyExtracted: Extracted = {
  title: "",
  company: "",
  location: "",
  locations: "",
  jobType: "",
  salary: "",
  workMode: "",
  experience: "",
  skills: "",
  qualification: "",
  applyDeadline: "",
  descriptionSummary: "",
  originalApplyLink: "",
  source: "",
  warning: "",
};

function toDateInput(daysFromNow: number) {
  if (daysFromNow <= 0) return "";
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function parseDateInput(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
}

function normalizeList(value: string) {
  return value
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToString(value?: string[] | string) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value ?? "";
}

function sourceFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function AddJobPage() {
  const router = useRouter();
  const userSettings = useAppSelector((state) => state.auth.user?.settings ?? defaultStoredUserSettings);
  const [jobUrl, setJobUrl] = useState("");
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractNotice, setExtractNotice] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [basic, setBasic] = useState<Extracted>(emptyExtracted);
  const [expectedSalary, setExpectedSalary] = useState(userSettings.jobPreferences.expectedSalaryRange);
  const [offeredSalary, setOfferedSalary] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [confidenceScore, setConfidenceScore] = useState("0");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState(
    toDateInput(userSettings.productivity.defaultFollowUpDays)
  );
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setExpectedSalary((value) => value || userSettings.jobPreferences.expectedSalaryRange);
    setFollowUpDate((value) => value || toDateInput(userSettings.productivity.defaultFollowUpDays));
  }, [userSettings]);

  function startManualEntry() {
    setExtractError(null);
    setExtractNotice(null);
    setBasic((current) => ({
      title: current.title,
      company: current.company,
      location: current.location || userSettings.jobPreferences.preferredLocation,
      locations: current.locations || userSettings.jobPreferences.preferredLocation,
      jobType: current.jobType || userSettings.jobPreferences.preferredJobType,
      salary: current.salary,
      workMode: current.workMode,
      experience: current.experience,
      skills: current.skills,
      qualification: current.qualification,
      applyDeadline: current.applyDeadline,
      descriptionSummary: current.descriptionSummary,
      originalApplyLink: current.originalApplyLink || jobUrl.trim(),
      source: current.source || sourceFromUrl(jobUrl.trim()),
      warning: current.warning,
    }));
    setExpectedSalary((current) => current || userSettings.jobPreferences.expectedSalaryRange);
    setFollowUpDate((current) => current || toDateInput(userSettings.productivity.defaultFollowUpDays));
    setShowForm(true);
  }

  async function handleExtract() {
    setExtractError(null);
    setExtractNotice(null);
    const url = jobUrl.trim();
    if (!url) {
      setExtractError("Enter a job URL");
      return;
    }

    setExtractLoading(true);
    try {
      const { data } = await api.post<{ success: boolean; data?: ExtractedResponse; message?: string }>(
        "/jobs/extract",
        { url }
      );
      if (!data.success || !data.data) {
        setExtractError(data.message ?? "Could not fetch job details");
        return;
      }

      setBasic({
        title: data.data.title ?? "",
        company: data.data.company ?? "",
        location: data.data.location?.trim() || userSettings.jobPreferences.preferredLocation,
        locations:
          listToString(data.data.locations).trim() ||
          data.data.location?.trim() ||
          userSettings.jobPreferences.preferredLocation,
        jobType: data.data.jobType?.trim() || userSettings.jobPreferences.preferredJobType,
        salary: data.data.salary ?? "",
        workMode: data.data.workMode ?? "",
        experience: data.data.experience ?? "",
        skills: listToString(data.data.skills),
        qualification: data.data.qualification ?? "",
        applyDeadline: parseDateInput(data.data.applyDeadline),
        descriptionSummary: data.data.descriptionSummary ?? "",
        originalApplyLink: data.data.originalApplyLink ?? url,
        source: data.data.source ?? sourceFromUrl(url),
        warning: data.data.warning ?? "",
      });
      setExtractNotice(data.data.warning?.trim() || null);
      setExpectedSalary((prev) => prev || userSettings.jobPreferences.expectedSalaryRange);
      if (!followUpDate) {
        setFollowUpDate(toDateInput(userSettings.productivity.defaultFollowUpDays));
      }
      setShowForm(true);
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        error.response?.data &&
        typeof (error.response.data as { message?: string }).message === "string"
          ? (error.response.data as { message: string }).message
          : null;
      setExtractError(message ?? "Could not fetch job details");
    } finally {
      setExtractLoading(false);
    }
  }

  async function handleSave() {
    setSaveError(null);
    if (!basic.title.trim()) {
      setSaveError("Title is required");
      return;
    }

    setSaveLoading(true);
    try {
      const score = Number(confidenceScore);
      const { data } = await api.post<{ success: boolean; message?: string }>("/jobs", {
        title: basic.title.trim(),
        company: basic.company,
        location: basic.location,
        locations: normalizeList(basic.locations),
        jobType: basic.jobType,
        salary: basic.salary,
        workMode: basic.workMode,
        experience: basic.experience,
        skills: normalizeList(basic.skills),
        qualification: basic.qualification,
        applyDeadline: serializeFollowUpDate(basic.applyDeadline),
        descriptionSummary: basic.descriptionSummary,
        originalApplyLink: basic.originalApplyLink || jobUrl.trim() || undefined,
        expectedSalary,
        offeredSalary,
        companyType,
        confidenceScore: Number.isFinite(score) ? score : 0,
        notes,
        followUpDate: serializeFollowUpDate(followUpDate),
        source: basic.source || sourceFromUrl(jobUrl.trim()) || undefined,
      });
      if (!data.success) {
        setSaveError(data.message ?? "Could not save job");
        return;
      }
      router.push("/dashboard?jobSaved=1");
    } catch (error) {
      const message =
        axios.isAxiosError(error) &&
        error.response?.data &&
        typeof (error.response.data as { message?: string }).message === "string"
          ? (error.response.data as { message: string }).message
          : null;
      setSaveError(message ?? "Could not save job");
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add job</h1>
        <p className="text-muted-foreground">Paste a listing URL to pre-fill details or enter the job manually.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job URL</CardTitle>
          <CardDescription>Paste a listing link to pull title, company, and visible job details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {extractError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {extractError}
            </p>
          ) : null}
          {extractNotice ? (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
              {extractNotice}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="job-url">URL</Label>
            <Input
              id="job-url"
              type="url"
              placeholder="https://..."
              value={jobUrl}
              onChange={(event) => setJobUrl(event.target.value)}
              disabled={extractLoading}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleExtract} disabled={extractLoading}>
              {extractLoading ? "Fetching..." : "Fetch details"}
            </Button>
            <Button variant="secondary" type="button" onClick={startManualEntry} disabled={extractLoading}>
              Enter manually
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/jobs">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {showForm ? (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Job details</CardTitle>
              <CardDescription>Edit anything the fetch missed or got wrong.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={basic.title}
                  onChange={(event) => setBasic((state) => ({ ...state, title: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={basic.company}
                  onChange={(event) => setBasic((state) => ({ ...state, company: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={basic.location}
                  onChange={(event) => setBasic((state) => ({ ...state, location: event.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="locations">Multiple locations</Label>
                <Input
                  id="locations"
                  value={basic.locations}
                  onChange={(event) => setBasic((state) => ({ ...state, locations: event.target.value }))}
                  placeholder="Remote, Bengaluru, London"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">Job type</Label>
                <Input
                  id="jobType"
                  value={basic.jobType}
                  onChange={(event) => setBasic((state) => ({ ...state, jobType: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={basic.salary}
                  onChange={(event) => setBasic((state) => ({ ...state, salary: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workMode">Work mode</Label>
                <Input
                  id="workMode"
                  value={basic.workMode}
                  onChange={(event) => setBasic((state) => ({ ...state, workMode: event.target.value }))}
                  placeholder="Remote / Hybrid / Onsite"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={basic.experience}
                  onChange={(event) => setBasic((state) => ({ ...state, experience: event.target.value }))}
                  placeholder="Fresher, 1-3 years"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={basic.qualification}
                  onChange={(event) => setBasic((state) => ({ ...state, qualification: event.target.value }))}
                  placeholder="B.Tech, Bachelor's degree, etc."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  value={basic.skills}
                  onChange={(event) => setBasic((state) => ({ ...state, skills: event.target.value }))}
                  rows={3}
                  placeholder="React, Node.js, SQL"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="descriptionSummary">Description summary</Label>
                <Textarea
                  id="descriptionSummary"
                  value={basic.descriptionSummary}
                  onChange={(event) =>
                    setBasic((state) => ({ ...state, descriptionSummary: event.target.value }))
                  }
                  rows={4}
                  placeholder="Short summary of responsibilities and role expectations"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional</CardTitle>
              <CardDescription>Targets, confidence, dates, and notes for this application.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected salary</Label>
                <Input
                  id="expectedSalary"
                  value={expectedSalary}
                  onChange={(event) => setExpectedSalary(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="offeredSalary">Offered salary</Label>
                <Input
                  id="offeredSalary"
                  value={offeredSalary}
                  onChange={(event) => setOfferedSalary(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="companyType">Company type</Label>
                <Input
                  id="companyType"
                  value={companyType}
                  onChange={(event) => setCompanyType(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confidenceScore">Confidence score</Label>
                <Input
                  id="confidenceScore"
                  type="number"
                  min={0}
                  step={1}
                  value={confidenceScore}
                  onChange={(event) => setConfidenceScore(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="followUpDate">Follow-up date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={followUpDate}
                  onChange={(event) => setFollowUpDate(event.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="applyDeadline">Apply deadline</Label>
                <Input
                  id="applyDeadline"
                  type="date"
                  value={basic.applyDeadline}
                  onChange={(event) => setBasic((state) => ({ ...state, applyDeadline: event.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="originalApplyLink">Original apply link</Label>
                <Input
                  id="originalApplyLink"
                  type="url"
                  value={basic.originalApplyLink}
                  onChange={(event) =>
                    setBasic((state) => ({ ...state, originalApplyLink: event.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={basic.source}
                  onChange={(event) => setBasic((state) => ({ ...state, source: event.target.value }))}
                  placeholder="linkedin.com, careers page, referral"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {saveError ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {saveError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? "Saving..." : "Save job"}
            </Button>
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/jobs">Cancel</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
