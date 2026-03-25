# Project Context

Use this file to give any new Codex session enough context to continue work without losing momentum.

## 1) Project Snapshot
- Project name: RTI Case Management System
- One-line purpose: Full-stack tracker for RTI applications, stages, documents, notes, deadlines, analytics, and exports.
- Current status: `active dev`
- Last updated on (YYYY-MM-DD): 2026-03-25
- Owner(s): `TODO`

## 2) Architecture At A Glance
- Frontend: React 18 + Vite + Redux Toolkit + React Router + MUI + Recharts
- Backend: Node.js + Express + Mongoose
- Database / storage: MongoDB (Atlas or local) + Cloudinary for file binaries
- Auth: JWT (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)
- Deployment target: Render (frontend static site + backend web service)
- Key external services: MongoDB Atlas, Cloudinary, Render

## 3) Local Setup
- Prerequisites: Node.js 18+ (20/22 recommended), npm, MongoDB Atlas or local MongoDB, Cloudinary account
- Install:
  - `cd backend && npm install`
  - `cd ../frontend && npm install`
- Run frontend: `cd frontend && npm run dev` (Vite on `http://localhost:5173`)
- Run backend: `cd backend && npm run dev` (Express API on port from `PORT`, default `5000`)
- Test: No dedicated test scripts currently configured in either `package.json`
- Env files and required variables:
  - `backend/.env`: `PORT`, `MONGO_URI`, `CLIENT_URL`, `JWT_SECRET`, `CLOUDINARY_URL`
  - `frontend/.env`: `VITE_API_URL`, `VITE_FILE_BASE_URL`

## 4) Repository Map
- `frontend/`: Vite React app, Redux slices in `src/features`, pages in `src/pages`, shared UI/components in `src/components`
- `backend/`: Express app with routes/controllers/models split by domain; middleware and utils in dedicated folders
- Root-level important files: `README.md`, `PROJECT_CONTEXT.md`, `.gitignore`
- Anything intentionally non-standard: Render SPA rewrite file exists at `frontend/public/_redirects`

## 5) Product Requirements (Current)
- Core user flows:
  - User registration/login
  - Create/list/view/edit/delete RTI applications
  - Manage stage timeline and upload supporting documents
  - Add/view case notes
  - Monitor dashboard metrics, deadlines, and analytics
  - Export data (CSV/PDF) and generate drafts
- Must-have features:
  - JWT-protected APIs
  - Deadline and overdue logic
  - Stage-wise document handling
  - Dashboard + analytics views
- Nice-to-have features:
  - Richer reporting/custom filters
  - Stronger validation and audit logs
  - Automated tests and CI
- Out of scope: `TODO`

## 6) Current Sprint / Active Work
- Goal: Improve case tracking completeness and deadline visibility in RTI workflows.
- Branch: `main`
- In-progress tasks:
  - Finalize and verify recent form/data model additions for PIO and appellate authority addresses.
  - Validate stage-level postal tracking and document-repository fallback behavior.
  - Polish RTI list UX (deadline/status color coding, sorting, and chip consistency).
- Blockers:
  - No automated tests; verification is currently manual.
  - Runtime behavior depends on correct Atlas/Cloudinary env configuration.
- Definition of done:
  - Feature implemented and manually verified via UI + API
  - No regression in auth, RTI CRUD, stage/docs, notes, dashboard, analytics, exports
  - README/PROJECT_CONTEXT updated if behavior/setup changes
  - PROJECT_CONTEXT updated on every commit with what changed + any new risks/follow-ups

## 7) Decisions Log (Why)
Add short entries like:
- `YYYY-MM-DD`: Decision, reason, impact.
- `2026-03-11`: Added `PROJECT_CONTEXT.md` as durable session handoff source to reduce restart/context loss.

## 8) Known Issues / Tech Debt
- No automated test suite yet.
  - Impact: Higher regression risk during feature changes.
  - Workaround: Manual end-to-end checks using UI and key API routes.
  - Planned fix: Add backend API tests + frontend component/integration tests.
- Environment misconfiguration is a frequent failure source (`MONGO_URI`, `CLOUDINARY_URL`, `VITE_API_URL`).
  - Impact: Startup/runtime failures and upload/auth issues.
  - Workaround: Validate `.env` against README before run/deploy.
  - Planned fix: Add startup config validation and clearer error messaging.

## 9) Testing Notes
- Existing tests: None in repo currently.
- Missing coverage: Auth flows, RTI CRUD, stage/doc uploads, notes, dashboard/analytics aggregation, export endpoints.
- Manual test checklist:
1. Register/login and verify protected routes work.
2. Create RTI, edit it, open details, and delete it.
3. Add timeline stage and upload/delete a document.
4. Add and view notes for an RTI.
5. Verify dashboard counters/charts and overdue behavior.
6. Download CSV/PDF export and generate draft endpoint output.

## 10) Handoff For Next Codex Session
- What was just completed:
- Created and prefilled `PROJECT_CONTEXT.md` from current repository state.
- Recent shipped updates (latest commits):
  - Responsive/mobile compatibility improvements across layout, dashboard/analytics charts, timeline, calendar, and RTI details docs.
  - PIO and appellate authority address capture added.
  - Appeal authority split into first/second stage fields.
  - RTI list deadline/status visualization improved with color coding and style refinements.
  - Stage-level postal tracking and case-closed upload exception added.
  - Sortable RTI list columns and Add RTI prefill improvements added.
- What should be done next (first 3 tasks):
1. Add regression checks for newly added address/stage-tracking fields (at minimum manual checklist updates, ideally automated tests).
2. Run end-to-end validation for RTI list sorting + deadline/status color logic with realistic date edge cases.
3. Fill remaining business-context fields (`Owner`, `Out of scope`) and keep this file updated with each feature merge.
- Risks to watch:
- Running without tests may hide regressions.
- Cloudinary/Atlas/Render env drift can break runtime after deploy.
- Assistant response preference:
- Always use compact mode by default (minimal tokens, concise replies, minimal progress chatter unless explicitly requested).

## 11) Commit Update Rule
- For every commit, update `PROJECT_CONTEXT.md` in the same commit.
- Minimum required update:
  - Set `Last updated on` to commit date.
  - Add/adjust bullet(s) under `Recent shipped updates`.
  - Add any new risk/workaround under `Known Issues / Tech Debt` if introduced.
- Suggested first prompt to paste:

```text
Read README.md and PROJECT_CONTEXT.md first. Then continue with:
[describe the exact next task]
Constraints:
[list constraints]
```
