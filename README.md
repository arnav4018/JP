# Job Portal (Full‑Stack) — Next.js + Node/Express + PostgreSQL

A modern job portal with separate frontend (Next.js) and backend (Node/Express) services and a PostgreSQL database.

## Monorepo Structure

```
job-portal-project/
├─ backend/        # Node/Express API (JWT auth, jobs, applications, payments, etc.)
├─ frontend/       # Next.js app (React, TypeScript, Tailwind)
├─ .gitignore
└─ README.md
```

## Requirements
- Node.js 18+ (Windows-friendly; tested with Node 24)
- npm (or yarn/pnpm)
- PostgreSQL 13+

## Quick Start (Windows PowerShell)

1) Install dependencies
- Backend
  - npm ci --prefix .\backend
- Frontend
  - npm ci --prefix .\frontend

2) Configure environment
- Backend: copy backend/.env.example to backend/.env and set the PostgreSQL and JWT values.
- Frontend: create frontend/.env.local

Example backend/.env
- PORT=5000
- NODE_ENV=development
- FRONTEND_URL=http://localhost:3000
- DB_HOST=localhost
- DB_PORT=5432
- DB_DATABASE=job_portal
- DB_USER=postgres
- DB_PASSWORD=your_password
- JWT_SECRET=replace-with-strong-secret
- JWT_REFRESH_SECRET=replace-with-strong-refresh-secret

Example frontend/.env.local
- NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

3) Run services (two terminals)
- API
  - npm run dev --prefix .\backend
- Frontend
  - npm run dev --prefix .\frontend

4) Open the app
- http://localhost:3000
- API health check: http://localhost:5000/api/health

## Available Scripts

Backend (./backend/package.json)
- npm run dev — start API with nodemon on port 5000
- npm start — start API with node

Frontend (./frontend/package.json)
- npm run dev — start Next.js dev server on port 3000
- npm run build — production build
- npm start — start production server
- npm run lint — lint the codebase

## Manual End‑to‑End Checklist (Phase 4)

Run Both Servers
- Start backend (port 5000) and frontend (port 3000) simultaneously.

User Flow
- Register new user (candidate)
- Login
- Search for a job
- Apply to a job
- Verify application status appears/updates

Data Integrity (Recruiter)
- Login as recruiter
- Create a new job posting
- Verify job exists in PostgreSQL (select from jobs table)
- Confirm job is visible to candidates in the frontend

CRUD Operations
- Create, Read, Update, Delete for jobs, profiles, and applications

Debugging
- Browser DevTools → Network: inspect API requests/responses
- Backend logs: backend/server.out.log and backend/server.err.log
- API logs in console when running locally

## Troubleshooting

- API not reachable on http://localhost:5000
  - Ensure backend started without errors; check backend/server.err.log
  - Confirm DB variables are correct and PostgreSQL is running/accessible

- CORS errors in the browser
  - Confirm FRONTEND_URL in backend .env matches the origin (http://localhost:3000)

- Dependency issues on Windows
  - Use: npm ci --prefix .\frontend and npm ci --prefix .\backend
  - For peer conflicts: npm i --legacy-peer-deps --prefix .\frontend

- Environment files committed by accident
  - Ensure .gitignore excludes .env* and that only *.env.example is tracked

## Contributing
- Create a feature branch
- Commit with conventional messages when possible
- Open a Pull Request

## License
- MIT (see LICENSE if present)
