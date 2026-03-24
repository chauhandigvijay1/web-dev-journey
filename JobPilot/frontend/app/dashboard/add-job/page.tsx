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
  jobType: string;
  salary: string;
};

const emptyExtracted: Extracted = {
  title: "",
  company: "",
  location: "",
  jobType: "",
  salary: "",
};

function toDateInput(daysFromNow: number) {
  if (daysFromNow <= 0) return "";
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export default function AddJobPage() {
  const router = useRouter();
  const userSettings = useAppSelector((state) => state.auth.user?.settings ?? defaultStoredUserSettings);
  const [jobUrl, setJobUrl] = useState("");
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
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
    setBasic((current) => ({
      title: current.title,
      company: current.company,
      location: current.location || userSettings.jobPreferences.preferredLocation,
      jobType: current.jobType || userSettings.jobPreferences.preferredJobType,
      salary: current.salary,
    }));
    setExpectedSalary((current) => current || userSettings.jobPreferences.expectedSalaryRange);
    setFollowUpDate((current) => current || toDateInput(userSettings.productivity.defaultFollowUpDays));
    setShowForm(true);
  }

  async function handleExtract() {
    setExtractError(null);
    const url = jobUrl.trim();
    if (!url) {
      setExtractError("Enter a job URL");
      return;
    }

    setExtractLoading(true);
    try {
      const { data } = await api.post<{ success: boolean; data?: Extracted; message?: string }>(
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
        jobType: data.data.jobType?.trim() || userSettings.jobPreferences.preferredJobType,
        salary: data.data.salary ?? "",
      });
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
        jobType: basic.jobType,
        salary: basic.salary,
        expectedSalary,
        offeredSalary,
        companyType,
        confidenceScore: Number.isFinite(score) ? score : 0,
        notes,
        followUpDate: serializeFollowUpDate(followUpDate),
        source: jobUrl.trim() || undefined,
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
