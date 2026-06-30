# Phase 11 — Split Settings Page

**Goal**: Reduce `page.tsx` (897 lines) by extracting reusable section components into `settings-sections.tsx`.

## Changes

### New file
- `frontend/components/settings/settings-sections.tsx` (~370 lines) — extracted components:
  - `SettingSection` — shared card wrapper
  - `ProfileSection` — name, phone, bio, profile image upload
  - `PreferencesSection` — email notifications, job type/location, follow-up/ghosted defaults, timezone, reminder hour, weekly summary
  - `SecuritySection` — password change form with auth provider badges
  - `ThemeSection` — theme + accent picker (uses `useTheme` internally)
  - `DataSection` — CSV export + clear jobs buttons
  - `SessionSection` — logout button
  - `ClearJobsDialog` — confirmation dialog (was inline AlertDialog)
  - `escapeCsv`, `createJobsCsv` helpers

### Modified file
- `frontend/app/dashboard/settings/page.tsx` (897 → ~377 lines):
  - Removed: inline `SettingSection`, `escapeCsv`, `createJobsCsv`, `followUpOptions`, `ghostedOptions`, all JSX for each section, and `useTheme` import
  - Kept: state declarations, handler functions (`saveProfile`, `savePreferences`, `onProfileImageChange`, `changePassword`, `exportJobs`, `clearAllJobs`, `handleLogout`), computed values, the sync effect
  - Imports 7 section components + `createJobsCsv` from `./settings-sections`

## Verification
- `npm run build` — passes, 12 routes, clean
- Settings page bundle: 12.1 kB (same as before — tree-shaking works)
