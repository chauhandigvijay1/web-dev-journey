<div align="center">
  <img alt="DsSync Hub" src="./client/public/logo_icon.svg" width="80" height="80">
  <h1>Changelog</h1>
</div>

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Drag-and-drop Kanban board with `@dnd-kit/core` and `@dnd-kit/sortable`
- Error boundary wrapping the entire React tree (Sentry.ErrorBoundary)
- `ErrorFallback` component with auto-redirect countdown
- `KanbanCard` and `KanbanColumn` components for draggable task management
- `CouponRedemption` cleanup on workspace, user, and admin account deletion
- `Subscription` cleanup on workspace deletion (owned workspace teardown)
- Missing `Subscription` require in `userController.js`
- Proper `Subscription.deleteMany` call in `adminController.js` deleteUser

### Changed (Server)
- **Socket auth**: Consolidated 4 duplicate `io.use(socketAuthMiddleware)` calls into a single registration in `server.js` (was 4x per connection)
- **AI usage limit**: Atomic `findOneAndUpdate` with `count: { $lt: limit }` filter — eliminates race condition that could exceed daily limit
- **Billing subscription**: Changed `findOneAndUpdate` from raw doc to `$set` — preserves existing fields instead of overwriting entire document
- **Invite cleanup**: Fixed `Invite.deleteMany({ createdBy: userId })` (field doesn't exist) → `{ workspace: { $in: ownedIds } }` in userController and adminController
- **Invite stats**: Fixed `Invite.countDocuments({ acceptedAt: null })` (field doesn't exist) → `{ usedAt: null }` in adminController and cleanupExpiredTokens
- **Billing invoice cleanup**: Fixed `BillingInvoice.deleteMany({ user: userId })` (field doesn't exist) → workspace-based cleanup in userController
- **Task comment cleanup**: Fixed `TaskComment.deleteMany({ workspace: workspaceId })` (field doesn't exist) → lookup via Task IDs first
- **Google auth username**: Added uniqueness loop (retries up to 100 suffixes) to prevent 1-in-10k collision crash
- **Export controller**: Added `.limit(10000)` on all 5 parallel queries to prevent OOM crash on large workspaces
- **Task socket events**: Added `io.to(...).emit()` calls to `updateTask`, `moveTask`, `completeTask`, and `archiveTask` controllers (previously only `createTask` emitted)
- **Calendar socket payload**: Fixed wrapped `{ event: ... }` → raw event object to match client's expected shape
- **Cron safety**: Wrapped `cleanupExpiredTokens()` call in `await` + try/catch to prevent unhandled rejection crashes
- **`logoutAllSessions`**: Added missing `try/catch` + `next(error)` to prevent unhandled rejection
- **Auth controller**: Fixed syntax error (missing `})` on `User.create()` call) that would prevent server start
- **`sanitizeInput`**: Removed `$` from character blacklist — users can now have `$` in names and bios

### Changed (Client)
- **Kanban board**: Replaced Prev/Next task movement buttons with full drag-and-drop using `@dnd-kit`. Tasks can be dragged between columns (changes status) and reordered within columns
- **localStorage safety**: Wrapped all `localStorage.getItem()` and `setItem()` calls in try/catch (4 files) to prevent crashes in Safari private browsing
- **Chat page**: Fixed unhandled promise rejections — all `dispatch(thunk)` calls (`addReactionThunk`, `editMessageThunk`, `deleteMessageThunk`, `sendMessageThunk`) now use `.unwrap()` with try/catch
- **Chat page**: Fixed `sendMessage` clearing input on network failure — message text preserved for retry
- **Chat page**: Fixed stale `searchParams` closure — added `searchParams` and `setSearchParams` to effect dependencies
- **Calendar page**: Delete event now shows error toast on API failure instead of always showing success
- **Notifications page**: Clear-read-items now wraps each dispatch in try/catch
- **NoteEditor**: Rewritten to ref-only contentEditable (no `dangerouslySetInnerHTML`), sanitize only on save. Cursor no longer jumps or erases content. Explicit `dir="ltr"`. Paste strips formatting.
- **File upload**: Added `accept` attributes on file inputs in FilesPage, NotesPage, TaskDetailDrawer

### Fixed (Security)
- **Path traversal**: `serveAvatar` now uses `path.basename()` and validates filename against `[a-zA-Z0-9._-]+`
- **Google auth takeover**: Blocked Google sign-in when user exists with `provider: 'local'` (returns 400)
- **Unverified email change**: New email stored in `unverifiedEmail` field; only applied after verification link clicked
- **Protocol-relative URL injection**: `safeLink` now rejects `//`-prefixed links
- **401 auto-redirect**: Axios interceptor redirects to `/login` on 401, clears localStorage tokens
- **Coupon owner visibility**: Owner coupon removed from public billing config response

---

<div align="center">
  <a href="README.md">🏠 Home</a> | <a href="docs/index.md">📚 Docs</a>
</div>
