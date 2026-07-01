"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  Award,
  Brain,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Upload,
  XCircle,
} from "lucide-react";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface ResumeData {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  parsed: boolean;
}

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Certification {
  name: string;
  issuer: string;
  year: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  linkedIn: string;
  github: string;
  portfolio: string;
}

interface CareerBrainProfile {
  resume: ResumeData | null;
  skills: string[];
  techStack: string[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  seniorityLevel: string;
  yearsOfExperience: number;
  contactInfo: ContactInfo;
}

interface AtsBreakdown {
  skills: number;
  experience: number;
  education: number;
  keywords: number;
}

interface AtsScore {
  overall: number;
  breakdown: AtsBreakdown;
  matchingSkills: string[];
  missingSkills: string[];
  extraSkills: string[];
  keyStrengths: string[];
  gaps: string[];
  recommendations: string[];
  suggestedRoles: string[];
}

interface RecommendedRole {
  title: string;
  matchPercentage: number;
  reason: string;
  missingSkills: string[];
  industries: string[];
  salaryRange: string;
}

interface CareerPath {
  direction: string;
  timeframe: string;
  skillsToLearn: string[];
}

interface SkillDevelopment {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}

interface Recommendations {
  roles: RecommendedRole[];
  careerPath: CareerPath;
  skillDevelopment: SkillDevelopment;
}

interface SkillGapResult {
  missingSkills: string[];
  matchingSkills: string[];
  recommendations: string[];
}

interface JobOption {
  _id: string;
  title: string;
  company: string;
}

/* ------------------------------------------------------------------ */
/*  Normalise API responses                                           */
/* ------------------------------------------------------------------ */

function normaliseProfile(raw: CareerBrainProfile): CareerBrainProfile {
  return {
    ...raw,
    skills: raw.skills ?? [],
    techStack: raw.techStack ?? [],
    experience: raw.experience ?? [],
    projects: raw.projects ?? [],
    education: raw.education ?? [],
    certifications: raw.certifications ?? [],
    contactInfo: {
      email: raw.contactInfo?.email ?? "",
      phone: raw.contactInfo?.phone ?? "",
      linkedIn: raw.contactInfo?.linkedIn ?? "",
      github: raw.contactInfo?.github ?? "",
      portfolio: raw.contactInfo?.portfolio ?? "",
    },
  };
}

function normaliseAtsScore(raw: AtsScore): AtsScore {
  return {
    ...raw,
    matchingSkills: raw.matchingSkills ?? [],
    missingSkills: raw.missingSkills ?? [],
    extraSkills: raw.extraSkills ?? [],
    keyStrengths: raw.keyStrengths ?? [],
    gaps: raw.gaps ?? [],
    recommendations: raw.recommendations ?? [],
    suggestedRoles: raw.suggestedRoles ?? [],
    breakdown: {
      skills: raw.breakdown?.skills ?? 0,
      experience: raw.breakdown?.experience ?? 0,
      education: raw.breakdown?.education ?? 0,
      keywords: raw.breakdown?.keywords ?? 0,
    },
  };
}

function normaliseSkillGap(raw: SkillGapResult): SkillGapResult {
  return {
    ...raw,
    matchingSkills: raw.matchingSkills ?? [],
    missingSkills: raw.missingSkills ?? [],
    recommendations: raw.recommendations ?? [],
  };
}

function normaliseRecommendations(raw: Recommendations): Recommendations {
  return {
    ...raw,
    roles: (raw.roles ?? []).map((r) => ({
      ...r,
      missingSkills: r.missingSkills ?? [],
      industries: r.industries ?? [],
    })),
    careerPath: raw.careerPath
      ? {
          ...raw.careerPath,
          skillsToLearn: raw.careerPath.skillsToLearn ?? [],
        }
      : { direction: "", timeframe: "", skillsToLearn: [] },
    skillDevelopment: raw.skillDevelopment
      ? {
          immediate: raw.skillDevelopment.immediate ?? [],
          shortTerm: raw.skillDevelopment.shortTerm ?? [],
          longTerm: raw.skillDevelopment.longTerm ?? [],
        }
      : { immediate: [], shortTerm: [], longTerm: [] },
  };
}

/* ------------------------------------------------------------------ */
/*  Colour helpers                                                    */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

/* ------------------------------------------------------------------ */
/*  Skeleton – parsed profile                                         */
/* ------------------------------------------------------------------ */

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 1 – Resume Upload                                         */
/* ------------------------------------------------------------------ */

function ResumeUploadSection({
  resume,
  uploading,
  onUpload,
}: {
  resume: ResumeData | null;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  if (resume) {
    return (
      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Resume
            </CardTitle>
            <CardDescription>Your uploaded resume</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary/60" />
              <div>
                <p className="text-sm font-medium">{resume.fileName}</p>
                <div className="flex items-center gap-2">
                  {resume.parsed ? (
                    <Badge
                      variant="secondary"
                      className="gap-1 text-xs text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Parsed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Parsing…
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            {resume.fileUrl && (
              <Button variant="outline" size="sm" className="gap-1" asChild>
                <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-primary" />
          Upload Resume
        </CardTitle>
        <CardDescription>Upload your resume to unlock career insights</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
          }`}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Drop your resume here, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOC, or DOCX (max 10 MB)</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <Button type="button" variant="secondary" size="sm" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Uploading…
              </>
            ) : (
              "Choose file"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 2 – Parsed Profile                                        */
/* ------------------------------------------------------------------ */

function ParsedProfileCard({ profile }: { profile: CareerBrainProfile }) {
  const hasData =
    profile.skills.length > 0 ||
    profile.techStack.length > 0 ||
    profile.experience.length > 0 ||
    profile.projects.length > 0 ||
    profile.education.length > 0 ||
    profile.certifications.length > 0;

  if (!hasData) {
    return (
      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-4 w-4 text-primary" />
            Parsed Profile
          </CardTitle>
          <CardDescription>We could not extract a profile from your resume yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <Brain className="h-8 w-8" />
            <p>No profile data available.</p>
            <p className="text-xs">Upload a resume above to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-primary" />
          Parsed Profile
        </CardTitle>
        <CardDescription>Skills, experience, and background extracted from your resume</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {/* Skills */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.length > 0 ? (
              profile.skills.map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">None listed</p>
            )}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Tech Stack</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.techStack.length > 0 ? (
              profile.techStack.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">None listed</p>
            )}
          </div>
        </div>

        {/* Seniority & Experience Years */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Seniority</h4>
          <p className="text-sm">
            {profile.seniorityLevel || "—"} &middot; {profile.yearsOfExperience > 0 ? `${profile.yearsOfExperience} yr` : "—"}
          </p>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
          <div className="space-y-1 text-sm">
            {profile.contactInfo.email && <p>{profile.contactInfo.email}</p>}
            {profile.contactInfo.phone && <p>{profile.contactInfo.phone}</p>}
            <div className="flex flex-wrap gap-2">
              {profile.contactInfo.linkedIn && (
                <a
                  href={profile.contactInfo.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  LinkedIn <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {profile.contactInfo.github && (
                <a
                  href={profile.contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {profile.contactInfo.portfolio && (
                <a
                  href={profile.contactInfo.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Portfolio <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-3 md:col-span-2">
          <h4 className="text-sm font-medium text-muted-foreground">Experience</h4>
          {profile.experience.length > 0 ? (
            <div className="space-y-3">
              {profile.experience.map((exp, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <p className="text-sm font-medium">{exp.title}</p>
                    <p className="text-xs text-muted-foreground">{exp.duration}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                  {exp.description && (
                    <p className="mt-1 text-xs text-muted-foreground/80">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No experience listed</p>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Projects</h4>
          {profile.projects.length > 0 ? (
            <div className="space-y-2">
              {profile.projects.map((proj, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{proj.name}</p>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="mt-1 text-xs text-muted-foreground/80">{proj.description}</p>
                  )}
                  {proj.technologies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {proj.technologies.map((t) => (
                        <Badge key={t} variant="muted" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No projects listed</p>
          )}
        </div>

        {/* Education & Certifications */}
        <div className="space-y-3">
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Education</h4>
            {profile.education.length > 0 ? (
              <div className="space-y-2">
                {profile.education.map((edu, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                  >
                    <p className="text-sm font-medium">{edu.degree}</p>
                    <p className="text-xs text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground/70">{edu.year}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No education listed</p>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Certifications</h4>
            {profile.certifications.length > 0 ? (
              <div className="space-y-2">
                {profile.certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                  >
                    <p className="text-sm font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                    <p className="text-xs text-muted-foreground/70">{cert.year}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No certifications listed</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 3 – ATS Score                                             */
/* ------------------------------------------------------------------ */

function AtsScoreSection({
  profileExists,
}: {
  profileExists: boolean;
}) {
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadJobs() {
      setLoadingJobs(true);
      try {
        const { data } = await api.get<{ success: boolean; data?: { jobs: JobOption[] } }>(
          "/jobs?limit=50"
        );
        if (cancelled) return;
        if (data.success && data.data?.jobs) {
          setJobs(data.data.jobs);
        }
      } catch {
        if (cancelled) return;
      } finally {
        if (!cancelled) setLoadingJobs(false);
      }
    }
    void loadJobs();
    return () => { cancelled = true; };
  }, []);

  async function handleAnalyze() {
    if (!selectedJobId) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await api.post<{ success: boolean; data?: AtsScore; message?: string }>(
        "/ai/ats-score",
        { jobId: selectedJobId }
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not compute ATS score");
        return;
      }
      setResult(normaliseAtsScore(data.data));
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof (err.response.data as { message?: string }).message === "string"
          ? (err.response.data as { message: string }).message
          : "Could not compute ATS score";
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  }

  if (!profileExists) {
    return (
      <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-primary" />
            ATS Match Score
          </CardTitle>
          <CardDescription>See how well your resume matches a job</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <AlertTriangle className="h-8 w-8" />
            <p>Upload a resume first to analyze ATS matches.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          ATS Match Score
        </CardTitle>
        <CardDescription>Compare your profile against one of your saved jobs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Job selector */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Select a job</label>
            {loadingJobs ? (
              <Skeleton className="h-9 w-full rounded-lg" />
            ) : (
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">— Choose a job —</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} {job.company ? `@ ${job.company}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={!selectedJobId || analyzing}
            className="gap-1.5"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Analyze ATS Match
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 pt-2">
            {/* Overall score */}
            <div className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Overall ATS Score
              </p>
              <p className={`text-5xl font-bold tracking-tight ${scoreColor(result.overall)}`}>
                {result.overall}
              </p>
              <Progress
                value={result.overall}
                className={`h-2.5 w-full max-w-xs ${scoreBg(result.overall).replace("text-", "bg-").replace("500", "500/30")}`}
              />
            </div>

            {/* Breakdown */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(["skills", "experience", "education", "keywords"] as const).map((key) => (
                <div key={key} className="rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                  <p className="text-xs capitalize text-muted-foreground">{key}</p>
                  <p className={`mt-1 text-2xl font-semibold ${scoreColor(result.breakdown[key])}`}>
                    {result.breakdown[key]}
                  </p>
                  <Progress value={result.breakdown[key]} className="mt-2 h-1.5" />
                </div>
              ))}
            </div>

            {/* Matching Skills */}
            {result.matchingSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Skills */}
            {result.extraSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Extra Skills</h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.extraSkills.map((s) => (
                    <Badge key={s} variant="muted">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Key Strengths */}
            {result.keyStrengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <Star className="h-4 w-4" />
                  Key Strengths
                </h4>
                <ul className="space-y-1">
                  {result.keyStrengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {result.gaps.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-4 w-4" />
                  Gaps
                </h4>
                <ul className="space-y-1">
                  {result.gaps.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Roles */}
            {result.suggestedRoles.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Suggested Alternative Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedRoles.map((role, i) => (
                    <Badge key={i} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 4 – Job Recommendations                                   */
/* ------------------------------------------------------------------ */

function RecommendationsSection() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGetRecommendations() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await api.post<{ success: boolean; data?: Recommendations; message?: string }>(
        "/ai/recommendations"
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not fetch recommendations");
        return;
      }
      setResult(normaliseRecommendations(data.data));
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof (err.response.data as { message?: string }).message === "string"
          ? (err.response.data as { message: string }).message
          : "Could not fetch recommendations";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4 text-primary" />
          Job Recommendations
        </CardTitle>
        <CardDescription>AI-powered role suggestions based on your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          onClick={handleGetRecommendations}
          disabled={loading}
          className="gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Getting Recommendations…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get Recommendations
            </>
          )}
        </Button>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <div className="space-y-6 pt-2">
            {/* Recommended roles */}
            {result.roles.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Recommended Roles</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.roles.map((role, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{role.title}</p>
                        <Badge
                          variant="secondary"
                          className={`shrink-0 ${role.matchPercentage >= 80 ? "text-emerald-600 dark:text-emerald-400" : role.matchPercentage >= 50 ? "text-amber-600 dark:text-amber-400" : ""}`}
                        >
                          {role.matchPercentage}% match
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{role.reason}</p>
                      {role.missingSkills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {role.missingSkills.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] text-red-600 dark:text-red-400">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {role.industries.length > 0 && <span>{role.industries.join(", ")}</span>}
                        {role.salaryRange && <span>{role.salaryRange}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career path */}
            {result.careerPath && (
              <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 px-4 py-3">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Career Path Suggestion
                </h4>
                <p className="text-sm text-muted-foreground">{result.careerPath.direction}</p>
                <p className="text-xs text-muted-foreground">Timeframe: {result.careerPath.timeframe}</p>
                {result.careerPath.skillsToLearn.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {result.careerPath.skillsToLearn.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skill Development Plan */}
            {result.skillDevelopment && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Skill Development Plan</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["immediate", "shortTerm", "longTerm"] as const).map((period) => {
                    const skills = result.skillDevelopment[period];
                    if (skills.length === 0) return null;
                    return (
                      <div
                        key={period}
                        className="rounded-xl border border-border/60 bg-background/60 px-4 py-3"
                      >
                        <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                          {period.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <ul className="space-y-1">
                          {skills.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-sm">
                              <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Section 5 – Skill Gap Analysis                                    */
/* ------------------------------------------------------------------ */

function SkillGapSection() {
  const [description, setDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    const trimmed = description.trim();
    if (!trimmed) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await api.post<{ success: boolean; data?: SkillGapResult; message?: string }>(
        "/ai/skill-gap",
        { jobDescription: trimmed }
      );
      if (!data.success || !data.data) {
        setError(data.message ?? "Could not analyze gaps");
        return;
      }
      setResult(normaliseSkillGap(data.data));
    } catch (err) {
      const msg =
        axios.isAxiosError(err) && err.response?.data && typeof (err.response.data as { message?: string }).message === "string"
          ? (err.response.data as { message: string }).message
          : "Could not analyze gaps";
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          Skill Gap Analysis
        </CardTitle>
        <CardDescription>Paste a job description to see what skills you are missing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Paste a full job description here…"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={analyzing}
          />
        </div>
        <Button
          type="button"
          onClick={handleAnalyze}
          disabled={!description.trim() || analyzing}
          className="gap-1.5"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <Target className="h-4 w-4" />
              Analyze Gaps
            </>
          )}
        </Button>

        {error && (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <div className="space-y-4 pt-2">
            {result.matchingSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-4 w-4" />
                  Matching Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.matchingSkills.map((s) => (
                    <Badge key={s} variant="secondary" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.missingSkills.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missingSkills.map((s) => (
                    <Badge key={s} variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  <Sparkles className="h-4 w-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {result.recommendations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */

export default function CareerBrainPage() {
  const [profile, setProfile] = useState<CareerBrainProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      setLoadingProfile(true);
      setProfileError(null);
      try {
        const { data } = await api.get<{ success: boolean; data?: CareerBrainProfile; message?: string }>(
          "/career-brain"
        );
        if (cancelled) return;
        if (data.success && data.data) {
          setProfile(normaliseProfile(data.data));
        } else {
          setProfile(null);
        }
      } catch {
        if (cancelled) return;
        setProfileError("Could not load career profile");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    void loadProfile();
    return () => { cancelled = true; };
  }, []);

  async function handleUpload(file: File) {
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File is too large. Maximum size is 10 MB.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const { data } = await api.post<{ success: boolean; data?: CareerBrainProfile; message?: string }>(
        "/career-brain/resume",
        formData
      );
      if (!data.success || !data.data) {
        setUploadError(data.message ?? "Could not upload resume");
        return;
      }
      setProfile(normaliseProfile(data.data));
    } catch (err: unknown) {
      let msg = "Could not upload resume";
      if (axios.isAxiosError(err)) {
        if (err.response?.data) {
          const body = err.response.data as Record<string, unknown>;
          msg = typeof body.message === "string" ? body.message : msg;
        } else if (err.code === "ECONNABORTED") {
          msg = "Upload timed out. Try a smaller file or check your connection.";
        }
      }
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Career Brain</h1>
        <p className="text-sm text-muted-foreground">
          Upload your resume, score matches, and discover your next career move.
        </p>
      </div>

      {profileError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{profileError}</span>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {uploadError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {/* Section 1 – Resume Upload */}
      <ResumeUploadSection
        resume={profile?.resume ?? null}
        uploading={uploading}
        onUpload={handleUpload}
      />

      {/* Section 2 – Parsed Profile */}
      {loadingProfile ? (
        <ProfileSkeleton />
      ) : profile ? (
        <ParsedProfileCard profile={profile} />
      ) : null}

      {/* Section 3 – ATS Score */}
      <AtsScoreSection profileExists={profile?.resume?.parsed === true} />

      {/* Section 4 – Job Recommendations */}
      <RecommendationsSection />

      {/* Section 5 – Skill Gap Analysis */}
      <SkillGapSection />
    </div>
  );
}
