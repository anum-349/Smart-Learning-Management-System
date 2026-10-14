import express from "express"
import pool from "../config/db.js"

const router = express.Router()

const readMonthAndYear = (req, res) => {
    const month = Number(req.query.month);
    const year = Number(req.query.year);
    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000) {
        res.status(400).json({ message: 'A valid month and year are required' });
        return null;
    }
    return { month, year };
};

router.get('/students/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const calendarDate = readMonthAndYear(req, res);
    if (!calendarDate) return;

    try {
        const events = await pool.query(
            `SELECT id::text AS id, title, TO_CHAR(date::date, 'YYYY-MM-DD') AS date, time::text AS time, location,
                    'event'::text AS event_type, NULL::text AS course_title
             FROM events
             WHERE user_type='student' AND lms_user_id=$1
               AND EXTRACT(MONTH FROM date)=$2 AND EXTRACT(YEAR FROM date)=$3

             UNION ALL

             SELECT 'assignment-' || a.id::text AS id, a.title,
                    TO_CHAR(COALESCE(a.deadline, a.due_date)::date, 'YYYY-MM-DD') AS date, NULL::text AS time,
                    NULL::text AS location, 'assignment'::text AS event_type,
                    c.title AS course_title
             FROM assignments a
             JOIN courses c ON c.id=a.course_id
             WHERE COALESCE(a.deadline, a.due_date) IS NOT NULL
               AND EXTRACT(MONTH FROM COALESCE(a.deadline, a.due_date))=$2
               AND EXTRACT(YEAR FROM COALESCE(a.deadline, a.due_date))=$3
               AND EXISTS (
                   SELECT 1 FROM enrollment_requests er
                   JOIN students st ON st.id=er.student_id
                   WHERE st.user_id=$1 AND er.course_id=a.course_id
                     AND er.status IN ('Approved','Enrolled')
               )

             UNION ALL

             SELECT 'quiz-' || q.id::text AS id, q.title,
                    TO_CHAR(q.deadline::date, 'YYYY-MM-DD') AS date, NULL::text AS time, NULL::text AS location,
                    'quiz'::text AS event_type, c.title AS course_title
             FROM quizzes q
             JOIN courses c ON c.id=q.course_id
             WHERE q.deadline IS NOT NULL
               AND EXTRACT(MONTH FROM q.deadline)=$2 AND EXTRACT(YEAR FROM q.deadline)=$3
               AND EXISTS (
                   SELECT 1 FROM enrollment_requests er
                   JOIN students st ON st.id=er.student_id
                   WHERE st.user_id=$1 AND er.course_id=q.course_id
                     AND er.status IN ('Approved','Enrolled')
               )
             ORDER BY date, time NULLS FIRST, title`,
            [id, calendarDate.month, calendarDate.year]
        );
        res.json(events.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/instructors/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const calendarDate = readMonthAndYear(req, res);
    if (!calendarDate) return;

    try {
        const events = await pool.query(
            `SELECT id::text AS id, title, TO_CHAR(date::date, 'YYYY-MM-DD') AS date, time::text AS time, location,
                    'event'::text AS event_type, NULL::text AS course_title
             FROM events
             WHERE user_type='instructor' AND lms_user_id=$1
               AND EXTRACT(MONTH FROM date)=$2 AND EXTRACT(YEAR FROM date)=$3

             UNION ALL

             SELECT 'assignment-' || a.id::text AS id, a.title,
                    TO_CHAR(COALESCE(a.deadline, a.due_date)::date, 'YYYY-MM-DD') AS date, NULL::text AS time,
                    NULL::text AS location, 'assignment'::text AS event_type,
                    c.title AS course_title
             FROM assignments a
             JOIN courses c ON c.id=a.course_id
             WHERE a.instructor_id=$1
               AND COALESCE(a.deadline, a.due_date) IS NOT NULL
               AND EXTRACT(MONTH FROM COALESCE(a.deadline, a.due_date))=$2
               AND EXTRACT(YEAR FROM COALESCE(a.deadline, a.due_date))=$3

             UNION ALL

             SELECT 'quiz-' || q.id::text AS id, q.title,
                    TO_CHAR(q.deadline::date, 'YYYY-MM-DD') AS date, NULL::text AS time, NULL::text AS location,
                    'quiz'::text AS event_type, c.title AS course_title
             FROM quizzes q
             JOIN courses c ON c.id=q.course_id
             WHERE q.deadline IS NOT NULL
               AND EXTRACT(MONTH FROM q.deadline)=$2 AND EXTRACT(YEAR FROM q.deadline)=$3
               AND EXISTS (
                   SELECT 1 FROM course_assignments ca
                   WHERE ca.course_id=q.course_id AND ca.instructor_id=$1
               )
             ORDER BY date, time NULLS FIRST, title`,
            [id, calendarDate.month, calendarDate.year]
        );
        res.json(events.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /students/:id/calendar
router.post('/students/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const { title, date, time, location } = req.body;

    if (!title?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date || '') || !/^\d{2}:\d{2}$/.test(time || '')) {
        return res.status(400).json({ message: 'Event title, date and time are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO events (lms_user_id, user_type, title, date, time, location)
             VALUES ($1,'student',$2,$3,$4,$5) RETURNING *`,
            [id, title.trim(), date, time, location || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// POST /instructors/:id/calendar
router.post('/instructors/:id/calendar', async (req, res) => {
    const { id } = req.params;
    const { title, date, time, location } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO events (lms_user_id, user_type, title, date, time, location)
             VALUES ($1,'instructor',$2,$3,$4,$5) RETURNING *`,
            [id, title, date, time, location]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router
