import express from "express";
import pool from "../config/db.js";

const router = express.Router();

const ownsCourse = async (instructorId, courseId) => {
  const { rowCount } = await pool.query(
    "SELECT 1 FROM course_assignments WHERE instructor_id=$1 AND course_id=$2",
    [instructorId, courseId]
  );
  return rowCount > 0;
};

router.get("/instructor/:instructorId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.id,t.course_id,c.title AS course_title,t.title,t.content,
        t.created_at,u.full_name AS author,u.role AS author_role,
        COALESCE(json_agg(json_build_object(
          'id',r.id,'content',r.content,'created_at',r.created_at,
          'author',ru.full_name,'author_role',ru.role
        ) ORDER BY r.created_at) FILTER (WHERE r.id IS NOT NULL),'[]') AS replies
       FROM discussion_threads t JOIN courses c ON c.id=t.course_id
       JOIN users u ON u.id=t.author_id
       LEFT JOIN discussion_replies r ON r.thread_id=t.id
       LEFT JOIN users ru ON ru.id=r.author_id
       WHERE EXISTS (SELECT 1 FROM course_assignments ca WHERE ca.instructor_id=$1 AND ca.course_id=t.course_id)
       GROUP BY t.id,c.title,u.full_name,u.role ORDER BY t.created_at DESC`,
      [req.params.instructorId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/student/:userId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.id,t.course_id,c.title AS course_title,t.title,t.content,t.created_at,
        u.full_name AS author,u.role AS author_role,
        COALESCE(json_agg(json_build_object(
          'id',r.id,'content',r.content,'created_at',r.created_at,
          'author',ru.full_name,'author_role',ru.role
        ) ORDER BY r.created_at) FILTER (WHERE r.id IS NOT NULL),'[]') AS replies
       FROM discussion_threads t
       JOIN courses c ON c.id=t.course_id
       JOIN users u ON u.id=t.author_id
       LEFT JOIN discussion_replies r ON r.thread_id=t.id
       LEFT JOIN users ru ON ru.id=r.author_id
       WHERE EXISTS (
         SELECT 1 FROM students st
         JOIN enrollment_requests er ON er.student_id=st.id
         WHERE st.user_id=$1 AND er.course_id=t.course_id AND er.status IN ('Approved','Enrolled')
       )
       GROUP BY t.id,c.title,u.full_name,u.role ORDER BY t.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/student/threads", async (req, res) => {
  const { course_id, author_id, title, content } = req.body;
  try {
    if (!course_id || !author_id || !title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Course, student, title and message are required" });
    }
    const enrollment = await pool.query(
      `SELECT 1 FROM students st
       JOIN enrollment_requests er ON er.student_id=st.id
       WHERE st.user_id=$1 AND er.course_id=$2 AND er.status IN ('Approved','Enrolled')`,
      [author_id, course_id]
    );
    if (!enrollment.rowCount) return res.status(403).json({ error: "You are not enrolled in this course" });
    const { rows } = await pool.query(
      "INSERT INTO discussion_threads (course_id,author_id,title,content) VALUES ($1,$2,$3,$4) RETURNING *",
      [course_id, author_id, title.trim(), content.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/threads", async (req, res) => {
  const { course_id, author_id, title, content } = req.body;
  try {
    if (!course_id || !author_id || !title?.trim() || !content?.trim()) return res.status(400).json({ error: "Course, instructor, title and message are required" });
    if (!(await ownsCourse(author_id, course_id))) return res.status(403).json({ error: "You are not assigned to this course" });
    const { rows } = await pool.query(
      "INSERT INTO discussion_threads (course_id,author_id,title,content) VALUES ($1,$2,$3,$4) RETURNING *",
      [course_id,author_id,title?.trim(),content?.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/threads/:threadId/replies", async (req, res) => {
  const { author_id, content } = req.body;
  try {
    if (!author_id || !content?.trim()) return res.status(400).json({ error: "Instructor and reply are required" });
    const thread = await pool.query(
      `SELECT t.course_id FROM discussion_threads t
       JOIN course_assignments ca ON ca.course_id=t.course_id
       WHERE t.id=$1 AND ca.instructor_id=$2`, [req.params.threadId,author_id]
    );
    if (!thread.rowCount) return res.status(404).json({ error: "Discussion not found" });
    const { rows } = await pool.query(
      "INSERT INTO discussion_replies (thread_id,author_id,content) VALUES ($1,$2,$3) RETURNING *",
      [req.params.threadId,author_id,content?.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/threads/:threadId/student-replies", async (req, res) => {
  const { author_id, content } = req.body;
  try {
    if (!author_id || !content?.trim()) return res.status(400).json({ error: "Student and reply are required" });
    const enrollment = await pool.query(
      `SELECT 1 FROM discussion_threads t
       JOIN students st ON st.user_id=$2
       JOIN enrollment_requests er ON er.student_id=st.id AND er.course_id=t.course_id
       WHERE t.id=$1 AND er.status IN ('Approved','Enrolled')`,
      [req.params.threadId, author_id]
    );
    if (!enrollment.rowCount) return res.status(404).json({ error: "Discussion not found or student is not enrolled" });
    const { rows } = await pool.query(
      "INSERT INTO discussion_replies (thread_id,author_id,content) VALUES ($1,$2,$3) RETURNING *",
      [req.params.threadId, author_id, content.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/threads/:threadId", async (req, res) => {
  try {
    const { instructor_id } = req.query;
    const { rowCount } = await pool.query(
      `DELETE FROM discussion_threads t USING course_assignments ca
       WHERE t.id=$1 AND ca.course_id=t.course_id AND ca.instructor_id=$2`,
      [req.params.threadId,instructor_id]
    );
    if (!rowCount) return res.status(404).json({ error: "Discussion not found" });
    res.json({ message: "Discussion deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
