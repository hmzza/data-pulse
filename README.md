# Data Pulse

Data Pulse is an internal data issue investigation prototype for report and SQL-based root cause analysis.

The application is built as a local full-stack project:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Storage: local filesystem and JSON files under `storage/`
- AI analysis: OpenAI Responses API, using issue details plus selected report SQL only

## What the project does

Data Pulse helps an analyst:

- upload or paste report SQL files
- manage saved reports in the application
- create a new investigation using issue details and a selected report
- generate AI-assisted SQL-based RCA hypotheses
- review prior investigations
- sign in with a local account
- manage users from a super admin account

Current analysis is based only on:

- investigation input fields
- detailed issue description
- selected report SQL file

Current analysis does **not** use:

- live database queries
- source data feeds
- portal data
- CSRTB data

That means the RCA output should be treated as a guided hypothesis, not a verified root cause.

## Main pages

- `/login` - login screen for the prototype
- `/dashboard` - overview dashboard
- `/reports` - upload, paste, edit, delete, and view SQL reports
- `/new` - create a new investigation
- `/result/:id` - view AI-generated SQL RCA result
- `/history` - list saved investigations
- `/users` - super admin user management

## Project structure

```text
src/        Frontend React application
server/     Express backend and OpenAI analysis logic
public/     Static assets
storage/    Local report and investigation data (ignored by Git)
```

Important backend files:

- [server/index.mjs](/Users/hamza/Work-Jazz/Projects/data_pulse/server/index.mjs)
- [server/analysis.mjs](/Users/hamza/Work-Jazz/Projects/data_pulse/server/analysis.mjs)
- [server/storage.mjs](/Users/hamza/Work-Jazz/Projects/data_pulse/server/storage.mjs)

Important frontend files:

- [src/pages/Reports.tsx](/Users/hamza/Work-Jazz/Projects/data_pulse/src/pages/Reports.tsx)
- [src/pages/NewInvestigation.tsx](/Users/hamza/Work-Jazz/Projects/data_pulse/src/pages/NewInvestigation.tsx)
- [src/pages/InvestigationResult.tsx](/Users/hamza/Work-Jazz/Projects/data_pulse/src/pages/InvestigationResult.tsx)

## Prerequisites

Install these locally:

- Node.js 18+ recommended
- npm

## Environment setup

Create a local `.env` file based on [`.env.example`](/Users/hamza/Work-Jazz/Projects/data_pulse/.env.example).

Expected variables:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
PORT=4000
CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=Admin@12345
ADMIN_FULL_NAME=Super Admin
```

Notes:

- `OPENAI_API_KEY` must be set for AI investigation generation.
- if you update `.env`, restart the backend so it reloads the variables.
- `.env` is ignored by Git and should never be committed.
- the first super admin account is seeded from `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_FULL_NAME`.
- `CLIENT_ORIGIN` may be a comma-separated list. Local Vite dev ports such as `5173` and `5174` are allowed by default.

## Install dependencies

From the project root:

```bash
npm install
```

## Run the project

### Option 1: run frontend and backend together

```bash
npm run dev:all
```

This starts:

- frontend at `http://localhost:5173`
- backend at `http://localhost:4000`

### Option 2: run them separately

Backend:

```bash
npm run server
```

Frontend:

```bash
npm run dev
```

## How to use the app

1. Open `http://localhost:5173`
2. Sign in with the seeded super admin account or a user created by the super admin
3. Go to `Reports`
4. Add a report by either:
   - pasting SQL code and saving it
   - uploading an existing `.sql` file
5. Go to `New Investigation`
6. Fill in the issue details
7. Select the uploaded report from the `Report SQL` dropdown
8. Write a detailed issue description
9. Click `Generate SQL-Based RCA`
10. Review the generated result page
11. Use `History` to verify the saved investigation

## Notifications and common behavior

- report save/upload/update/delete shows in-app notifications
- user create/enable/disable/delete actions show in-app notifications
- if backend is not running, the UI shows a backend connection error
- if OpenAI is not configured, investigation generation returns a clear error
- dashboard, history, reports, global header search, and users page all use live backend data

## Common issues

### 1. `Backend API is not running`

Start the backend:

```bash
npm run server
```

Or run both services:

```bash
npm run dev:all
```

### 2. `OPENAI_API_KEY is not configured on the server`

Check `.env` and confirm `OPENAI_API_KEY` is set.

Then restart the backend:

```bash
npm run server
```

### 3. `Cannot GET /` on port 4000

This is the backend server, not the frontend app.

Open the UI here instead:

```text
http://localhost:5173
```

### 4. Report upload succeeds but does not appear

Use the `Refresh` button on the Reports page.

Reports are stored locally under `storage/` and listed from backend metadata.

### 5. I changed `.env` but login or OpenAI behavior did not update

Restart the backend after any `.env` change:

```bash
npm run server
```

## Local storage behavior

The backend writes local files under `storage/`:

- `storage/reports/` - saved `.sql` files
- `storage/reports.json` - report metadata
- `storage/investigations.json` - saved investigations and AI output
- `storage/users.json` - local user accounts
- `storage/sessions.json` - local login sessions

This folder is ignored by Git.

## Build

To create a production frontend build:

```bash
npm run build
```

This verifies the frontend TypeScript and produces output in `dist/`.

## Current limitations

- no database integration
- no real SQL execution
- no live source/report/portal/CSRTB data comparison
- no file versioning for reports
- local filesystem storage only
- results are hypothesis-based, not confirmed RCA

## Suggested workflow for a new developer

1. Install dependencies with `npm install`
2. Create `.env` from `.env.example`
3. Set the seeded super admin credentials in `.env` if you do not want the defaults
4. Add a valid OpenAI API key
5. Start everything with `npm run dev:all`
6. Open `http://localhost:5173`
7. Sign in as the super admin
8. Create an analyst user from `/users` if needed
9. Upload a test `.sql` report
10. Create a test investigation
11. Verify the result appears in History and the dashboard
