# Aetheron Learning Management System

Aetheron LMS is a role-based learning platform for administrators, instructors, and students. The Next.js frontend uses an Express API backed by PostgreSQL.

## Features

- **Administrators:** manage faculties, departments, programs, batches, semesters, courses, instructors, students, course assignments, and registration requests.
- **Instructors:** manage assigned courses, course content, assignments, quizzes, grading, attendance, discussions, timetables, and calendar events.
- **Students:** access enrolled courses and resources, submit assignments and quizzes, view attendance and grades, and use discussions, timetables, and calendar events.
- **Shared:** sign in and register, view profile information, and receive role-specific dashboard data.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | Node.js, Express 5 (ES modules) |
| Database | PostgreSQL (`pg`) |
| Authentication | JWT |

## Project layout

```text
frontend/                 Next.js web application
postgre_backend/           Express API and PostgreSQL access
  config/                  Database connection
  migrations/              SQL migrations and migration instructions
  router/                  API route handlers
  uploads/                 Uploaded course and user files
```

## Requirements

- Node.js and npm
- PostgreSQL, with a database and the core LMS tables available to the backend

## Local setup

### 1. Create the environment files

Copy the examples, then replace the placeholder values with your local settings. Run these commands from the repository root.

**PowerShell:**

```powershell
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item postgre_backend/.env.example postgre_backend/.env
```

**macOS/Linux/Git Bash:**

```bash
cp frontend/.env.example frontend/.env.local
cp postgre_backend/.env.example postgre_backend/.env
```

Set the frontend API URL in `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ADMIN_SECRET=replace-with-a-local-signup-value
```

`NEXT_PUBLIC_API_URL` is the backend origin; do not add `/api` to the end. The `NEXT_PUBLIC_ADMIN_SECRET` is checked by the current signup page in the browser, so it is visible to users and is not a secure way to protect administrator registration. Do not put private credentials in any `NEXT_PUBLIC_*` variable.

Set the PostgreSQL connection and API settings in `postgre_backend/.env`:

```dotenv
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
JWT_SECRET=replace-with-a-long-random-secret
```

Use your own PostgreSQL database credentials and a unique, long `JWT_SECRET`. Keep both `.env` files private. They are ignored by Git; only the `.env.example` templates should be committed. Restart the frontend after changing its environment values.

### 2. Prepare PostgreSQL and run the backend

The repository currently includes an instructor workspace migration, not a complete initial database schema. Make sure the database and the core LMS tables already exist before applying it. From a terminal:

```bash
cd postgre_backend
npm install
npm run migrate:instructor
npm start
```

The migration is additive and can be reviewed in [`postgre_backend/migrations/README.md`](postgre_backend/migrations/README.md). It does not create the entire LMS database or import records from another database. For automatic restarts during development, use `npm run watch` instead of `npm start`.

The backend listens on `http://localhost:5000` by default. Opening `http://localhost:5000/` should return a short backend response.

### 3. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If the API runs on another host or port, update `NEXT_PUBLIC_API_URL` and restart the frontend development server.

## Useful commands

Run commands from the relevant app directory.

| Directory | Command | Purpose |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start the Next.js development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm start` | Serve a production build |
| `frontend` | `npm run lint` | Run ESLint |
| `postgre_backend` | `npm start` | Start the Express API |
| `postgre_backend` | `npm run watch` | Start the API with nodemon |
| `postgre_backend` | `npm run migrate:instructor` | Apply the instructor workspace migration |

## Troubleshooting

- **Frontend cannot reach the API:** check that the backend is running and `NEXT_PUBLIC_API_URL` has the correct origin, with no trailing `/api`.
- **API returns a database error:** verify the PostgreSQL service is running, the backend `.env` values are correct, and the core LMS schema exists.
- **Instructor workspace tables or columns are missing:** run `npm run migrate:instructor` from `postgre_backend` and check the migration output.
- **Environment changes do not appear in the frontend:** stop and restart `npm run dev` after editing `frontend/.env.local`.
