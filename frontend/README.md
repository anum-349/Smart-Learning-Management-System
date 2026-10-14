# Aetheron LMS frontend

This directory contains the Next.js web application. For full project setup, PostgreSQL configuration, backend setup, and migrations, see the [root README](../README.md).

## Local development

From the repository root, create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env.local
```

On PowerShell, use `Copy-Item frontend/.env.example frontend/.env.local`. Set `NEXT_PUBLIC_API_URL` to the backend origin (for example, `http://localhost:5000`), then run:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the development server whenever you change frontend environment variables. Values prefixed with `NEXT_PUBLIC_` are included in browser code and must not contain private credentials.
