# RTI Case Management System

Full-stack RTI lifecycle tracker built with React, Node.js, Express, MongoDB, and Cloudinary.

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Axios, Material UI, Recharts
- Backend: Node.js, Express, Mongoose, JWT Auth, Multer
- Database: MongoDB Atlas (or local MongoDB)
- File Storage: Cloudinary
- Hosting: Render (frontend + backend)

## Project Structure

- `frontend/` - React app (Vite)
- `backend/` - Express API

## Core Features

- RTI dashboard with counts, charts, and deadline highlights
- RTI application create/edit/list/detail flow
- Timeline stages with stage-wise document uploads
- Notes/case diary per RTI case
- Deadline calculation and overdue logic
- CSV/PDF exports and draft generator
- JWT-based authentication

## 1. Prerequisites

- Node.js 18+ (Node 20/22 recommended)
- npm
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Render account

## 2. Local Setup

### Clone and install

```bash
git clone <your-repo-url>
cd RTI-application-tracker

cd backend
npm install

cd ../frontend
npm install
```

### Backend environment (`backend/.env`)

Copy from `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rti_case_management
CLIENT_URL=http://localhost:5173
JWT_SECRET=change_this_to_a_long_random_secret
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

### Frontend environment (`frontend/.env`)

Copy from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_FILE_BASE_URL=http://localhost:5000
```

### Run locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

## 3. MongoDB Atlas Configuration

1. Create a cluster (free tier is fine).
2. Create a DB user (Database Access).
3. Add IP access in Network Access:
   - For Render: `0.0.0.0/0` (or tighter range if available)
4. Get connection string from Atlas:

```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/rti_app?retryWrites=true&w=majority&appName=Cluster0
```

5. If password has special chars (`@`, `#`, `%`, etc.), URL-encode it.
6. Set this value as `MONGO_URI` in backend env.

## 4. Cloudinary Configuration (File Uploads)

1. Create Cloudinary account.
2. From Dashboard/API Keys, copy the full `CLOUDINARY_URL`.
3. Set backend env var:

```env
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
```

4. Redeploy backend after setting env vars.

Note: Document metadata is stored in MongoDB; binary files are stored in Cloudinary.

## 5. Deploy Backend on Render

1. Render -> New -> Web Service.
2. Connect GitHub repo.
3. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add Environment Variables:
   - `PORT=10000` (optional; Render injects PORT automatically)
   - `MONGO_URI=<atlas-uri>`
   - `JWT_SECRET=<strong-random-secret>`
   - `CLIENT_URL=<your-frontend-url>`
   - `CLOUDINARY_URL=<cloudinary-url>`
5. Deploy.
6. Verify API health quickly in browser:
   - `https://<backend-service>.onrender.com/api/dashboard/stats`

A `404` on `/` is expected if only API routes are configured.

## 6. Deploy Frontend on Render

1. Render -> New -> Static Site.
2. Connect same repo.
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. Add Environment Variables:

```env
VITE_API_URL=https://<backend-service>.onrender.com/api
VITE_FILE_BASE_URL=https://<backend-service>.onrender.com
```

5. Add SPA rewrite rule in Render Static Site settings:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`

This fixes `Not Found` on refresh for routes like `/rtis`.

## 7. Authentication Notes

- Register first user from UI.
- JWT token is used for protected API routes.
- If APIs fail with `401`, log in again.

## 8. Useful Scripts

Backend:

- `npm run dev` - development server with nodemon
- `npm start` - production start

Frontend:

- `npm run dev` - Vite dev server
- `npm run build` - production build
- `npm run preview` - local preview of production build

## 9. Common Issues and Fixes

- `MongooseError: uri undefined`:
  - `MONGO_URI` is missing in `backend/.env` or Render env vars.

- `ERR_CONNECTION_REFUSED` from frontend:
  - backend is not running / wrong `VITE_API_URL`.

- Atlas DNS error `querySrv ENOTFOUND`:
  - malformed Atlas URI, typo in hostname, or duplicated URI text.

- Cloudinary not configured message:
  - `CLOUDINARY_URL` missing or invalid in backend env.

- Frontend route refresh gives `Not Found`:
  - missing rewrite rule to `/index.html`.

- PDF preview/download issue:
  - ensure backend uploads with correct Cloudinary resource handling and valid file extension metadata.

## 10. Security Recommendations

- Never commit `.env` files.
- Rotate DB password and JWT secret if they were exposed.
- Use a long random `JWT_SECRET` (32+ chars).
- Restrict Atlas network access when possible.

## API Endpoints (Current)

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

RTI:

- `POST /api/rti`
- `GET /api/rti`
- `GET /api/rti/:id`
- `PUT /api/rti/:id`
- `DELETE /api/rti/:id`

Timeline/Docs/Notes:

- `POST /api/stage`
- `GET /api/stage/:rtiId`
- `POST /api/document/upload`
- `GET /api/document/:rtiId`
- `DELETE /api/document/:id`
- `POST /api/notes`
- `GET /api/notes/:rtiId`

Dashboard/Analytics/Export:

- `GET /api/dashboard/stats`
- `GET /api/analytics`
- `GET /api/export/csv`
- `GET /api/export/pdf`
- `GET /api/draft/:type/:rtiId?format=pdf`
