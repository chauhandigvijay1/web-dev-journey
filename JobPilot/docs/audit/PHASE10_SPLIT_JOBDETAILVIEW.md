# Phase 10: Split JobDetailView (1021 → 345 lines)

## Problem
- `JobDetailView.tsx` was 1021 lines — violated Single Responsibility Principle
- Contained inline helper components, card sections, dialogs all in one file
- Hard to test, navigate, or reuse individual sections

## Changes Made

### Created `job-detail-utils.tsx`
Extracted helper functions and presentational sub-components:
- `formatWhen()` — date formatting
- `followUpBadgeClass()` — badge styling by follow-up bucket
- `ConfidenceStars` — star rating component
- `parseMoneyLoose()` — salary string parser

### Created `job-detail-dialogs.tsx`
Extracted two dialog components:
- `AiOutputDialog` — AI-generated content display with copy
- `DeleteJobDialog` — confirmation dialog for job deletion

### Created `job-detail-sections.tsx`
Extracted all card sections as named components:
- `JobDetailHeader` — title, company, status badge, status dropdown, pin/important/ghosted buttons
- `JobBasicInfoCard` — location, job type, salary, work mode, experience
- `SalaryInsightCard` — expected vs offered salary comparison
- `CompanyCard` — company type, qualifications, skills, confidence
- `SourceCard` — source + original apply link
- `NotesCard` — notes textarea with save
- `CrmCard` — contacts list + add contact form
- `AiAssistantCard` — 5 AI action buttons
- `ResumeCard` — resume upload with file input
- `TimelineCard` — created/updated/status timeline
- `DeleteSection` — delete job button
- `DescriptionCard` — conditional description display

### Updated `JobDetailView.tsx`
- Reduced from 1021 to 345 lines
- State management stays in main component
- Sections receive props for their specific data/callbacks
- Same behavior, zero functionality changes

## Verification
- Frontend build: compiles clean (12 routes)
- `npm.cmd run build` passes with zero errors
- All imports resolve correctly

## Files Changed
- `frontend/components/job/JobDetailView.tsx` — reduced from 1021→345 lines
- `frontend/components/job/job-detail-utils.tsx` — new file
- `frontend/components/job/job-detail-dialogs.tsx` — new file
- `frontend/components/job/job-detail-sections.tsx` — new file
