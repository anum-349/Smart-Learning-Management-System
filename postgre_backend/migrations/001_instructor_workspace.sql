-- Run once against the LMS PostgreSQL database before starting the updated API.
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_assignment_id INTEGER REFERENCES course_assignments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_path TEXT,
  file_url TEXT,
  total_marks NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (total_marks > 0),
  start_date DATE,
  deadline DATE,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Older LMS installations already have assignments keyed by course_assignment_id.
-- Add the instructor dashboard fields and backfill them without replacing existing rows.
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS course_assignment_id INTEGER REFERENCES course_assignments(id) ON DELETE SET NULL;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS deadline DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE assignments ALTER COLUMN total_marks TYPE NUMERIC(8,2) USING total_marks::numeric;

UPDATE assignments a SET
  course_id=COALESCE(a.course_id,ca.course_id),
  instructor_id=COALESCE(a.instructor_id,ca.instructor_id)
FROM course_assignments ca
WHERE a.course_assignment_id=ca.id
  AND (a.course_id IS NULL OR a.instructor_id IS NULL);

UPDATE assignments SET
  file_path=COALESCE(file_path,file_url),
  file_name=COALESCE(file_name,regexp_replace(file_url,'^.*/','')),
  deadline=COALESCE(deadline,due_date)
WHERE file_url IS NOT NULL OR due_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT,
  file_path TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade NUMERIC(8,2),
  feedback TEXT,
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
  id SERIAL PRIMARY KEY,
  course_assignment_id INTEGER REFERENCES course_assignments(id) ON DELETE CASCADE,
  session_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('Present', 'Absent', 'Leave'))
);

CREATE TABLE IF NOT EXISTS discussion_threads (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discussion_replies (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  lms_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID,
  user_type TEXT NOT NULL CHECK (user_type IN ('student', 'instructor')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- The legacy events table uses UUID user_id values. Keep those rows and use this
-- integer user link for the current LMS users table.
ALTER TABLE events ADD COLUMN IF NOT EXISTS lms_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE events ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS assignments_instructor_course_idx ON assignments(instructor_id, course_id);
CREATE INDEX IF NOT EXISTS attendance_sessions_assignment_date_idx ON attendance_sessions(course_assignment_id, session_date);
CREATE INDEX IF NOT EXISTS attendance_records_session_student_idx ON attendance_records(session_id, student_id);
CREATE INDEX IF NOT EXISTS discussion_threads_course_idx ON discussion_threads(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS discussion_replies_thread_idx ON discussion_replies(thread_id, created_at);
CREATE INDEX IF NOT EXISTS events_user_date_idx ON events(user_type,lms_user_id,date);
