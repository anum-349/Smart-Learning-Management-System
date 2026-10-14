# Backend database migration

Apply the instructor workspace migration to the PostgreSQL database configured for the backend before starting the updated API. It adds the instructor fields to existing assignment records and reuses the current attendance sessions and records. It also adds the LMS user link to legacy calendar events while preserving their existing rows.

From `postgre_backend`, run `npm run migrate:instructor`. It reads the existing `.env` internally and applies `001_instructor_workspace.sql`. Or run the SQL file with your normal PostgreSQL client and the same database connection settings used by the backend. Do not commit database credentials.

New instructor APIs:

- `GET /api/assignments/instructor/:instructorId`
- `POST /api/assignments`, `PUT /api/assignments/:id`, `DELETE /api/assignments/:id?instructor_id=...`
- `GET /api/assignments/:id/submissions?instructor_id=...`, `PUT /api/assignments/submissions/:submissionId/grade`
- `POST /api/assignments/:id/submissions` for enrolled students to upload their work
- `GET /api/attendance/course/:courseId?instructor_id=...&date=YYYY-MM-DD`
- `GET /api/attendance/course/:courseId/history?instructor_id=...`, `PUT /api/attendance/course/:courseId`
- `GET /api/discussions/instructor/:instructorId`, `POST /api/discussions/threads`, `POST /api/discussions/threads/:threadId/replies`, `DELETE /api/discussions/threads/:threadId?instructor_id=...`

Course content can now be filtered with `GET /api/course-contents?courseId=...`. Calendar routes are mounted under `/api` and use the existing instructor event endpoints.
