# RTI Case Management System

Production-style full-stack RTI legal case management application with React + Node + MongoDB.

## Project Structure

- `frontend/` - React + Vite + Redux Toolkit + React Router + Axios + Material UI + Recharts
- `backend/` - Node.js + Express + MongoDB + Mongoose + Multer + PDF exports

## Features Implemented

- Dashboard cards:
  - Total RTIs
  - Pending PIO Responses
  - First Appeals Filed
  - Second Appeals Filed
  - Closed RTIs
  - Overdue RTIs
- Dashboard charts:
  - RTIs filed per year
  - RTIs by department
  - Success vs pending
- RTI application CRUD
- Search + filters (search, year, status, department)
- Legal case timeline with stages and completion visualization
- Deadline calculator:
  - PIO response deadline (30 days)
  - First appeal eligibility (after 30 days)
  - Second appeal eligibility (90 days from first appeal order)
  - status indicator (green/yellow/red)
- Document repository (upload, preview, download, delete)
- Case diary notes
- Upcoming deadline list (dashboard + calendar page)
- Analytics:
  - delay-heavy departments
  - average response time
  - appeal success rate
  - filings per year
- Exports:
  - CSV
  - PDF
- Draft generator (RTI / First Appeal / Second Appeal PDF)

## Environment Variables

### Backend (`backend/.env`)
Copy `backend/.env.example` to `.env`.

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rti_case_management
CLIENT_URL=http://localhost:5173
JWT_SECRET=change_this_to_a_long_random_secret
```

### Frontend (`frontend/.env`)
Copy `frontend/.env.example` to `.env`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_FILE_BASE_URL=http://localhost:5000
```

## Installation

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Run Locally

### Start backend (port 5000)

```bash
cd backend
npm run dev
```

### Start frontend (port 5173)

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

## Authentication

- The app now requires login.
- First use: open `http://localhost:5173`, switch to `Register`, and create your account.
- All RTI APIs are protected with JWT bearer authentication.

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

- `POST /api/rti`
- `GET /api/rti`
- `GET /api/rti/:id`
- `PUT /api/rti/:id`
- `DELETE /api/rti/:id`

- `POST /api/stage`
- `GET /api/stage/:rtiId`

- `POST /api/document/upload`
- `GET /api/document/:rtiId`
- `DELETE /api/document/:id`

- `POST /api/notes`
- `GET /api/notes/:rtiId`

Additional:
- `GET /api/dashboard/stats`
- `GET /api/analytics`
- `GET /api/export/csv`
- `GET /api/export/pdf`
- `GET /api/draft/:type/:rtiId?format=pdf`

## Supported File Upload Types

- PDF
- DOC
- DOCX
- PNG/JPG/JPEG/WEBP

Files are stored in `backend/uploads` and served via `/uploads/...`.
