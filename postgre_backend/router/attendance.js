import express from "express";
import pool from "../config/db.js";

const router = express.Router();

const getCourseAssignment = async (instructorId, courseId, client = pool) => {
  const { rows } = await client.query(
    "SELECT id FROM course_assignments WHERE instructor_id=$1 AND course_id=$2 ORDER BY id LIMIT 1",
    [instructorId, courseId]
  );
  return rows[0]?.id;
};

router.get("/course/:courseId", async (req, res) => {
  const { instructor_id, date } = req.query;
  try {
    const assignmentId = await getCourseAssignment(instructor_id, req.params.courseId);
    if (!assignmentId) return res.status(403).json({ error: "You are not assigned to this course" });
    const { rows } = await pool.query(
      `SELECT DISTINCT ON (st.id) st.id AS student_id,st.user_id,u.full_name AS student_name,
        u.registration_no,ar.status
       FROM enrollment_requests er
       JOIN students st ON st.id=er.student_id
       JOIN users u ON u.id=st.user_id
       LEFT JOIN attendance_sessions ats ON ats.course_assignment_id=$3 AND ats.session_date=$2
       LEFT JOIN attendance_records ar ON ar.session_id=ats.id AND ar.student_id=st.id
       WHERE er.course_id=$1 AND er.status IN ('Approved','Enrolled')
       ORDER BY st.id,ats.id DESC`,
      [req.params.courseId,date,assignmentId]
    );
    res.json(rows.map((row) => ({ ...row, status: row.status || "Present" })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/course/:courseId/history", async (req, res) => {
  const { instructor_id } = req.query;
  try {
    const assignmentId = await getCourseAssignment(instructor_id, req.params.courseId);
    if (!assignmentId) return res.status(403).json({ error: "You are not assigned to this course" });
    const { rows } = await pool.query(
      `SELECT st.id AS student_id,st.user_id,u.full_name AS student_name,u.registration_no,
        ats.session_date AS attendance_date,ar.status
       FROM enrollment_requests er
       JOIN students st ON st.id=er.student_id
       JOIN users u ON u.id=st.user_id
       LEFT JOIN attendance_sessions ats ON ats.course_assignment_id=$2
       LEFT JOIN attendance_records ar ON ar.session_id=ats.id AND ar.student_id=st.id
       WHERE er.course_id=$1 AND er.status IN ('Approved','Enrolled')
       ORDER BY ats.session_date,u.full_name`,
      [req.params.courseId,assignmentId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/course/:courseId", async (req, res) => {
  const { instructor_id, date, records } = req.body;
  if (!date || !Array.isArray(records)) return res.status(400).json({ error: "Date and attendance records are required" });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const assignmentId = await getCourseAssignment(instructor_id, req.params.courseId, client);
    if (!assignmentId) {
      await client.query("ROLLBACK");
      return res.status(403).json({ error: "You are not assigned to this course" });
    }
    let { rows: sessionRows } = await client.query(
      "SELECT id FROM attendance_sessions WHERE course_assignment_id=$1 AND session_date=$2 ORDER BY id LIMIT 1",
      [assignmentId,date]
    );
    let sessionId = sessionRows[0]?.id;
    if (!sessionId) {
      const inserted = await client.query(
        "INSERT INTO attendance_sessions (course_assignment_id,session_date) VALUES ($1,$2) RETURNING id",
        [assignmentId,date]
      );
      sessionId = inserted.rows[0].id;
    }
    for (const record of records) {
      if (!record.student_id || !["Present","Absent","Leave"].includes(record.status)) throw new Error("Each record needs a valid student and status");
      const enrolled = await client.query(
        `SELECT 1 FROM enrollment_requests er JOIN students st ON st.id=er.student_id
         WHERE er.course_id=$1 AND st.id=$2 AND er.status IN ('Approved','Enrolled')`,
        [req.params.courseId,record.student_id]
      );
      if (!enrolled.rowCount) throw new Error("An attendance record references a student who is not enrolled in this course");
      const existing = await client.query(
        "SELECT id FROM attendance_records WHERE session_id=$1 AND student_id=$2 ORDER BY id LIMIT 1",
        [sessionId,record.student_id]
      );
      if (existing.rowCount) {
        await client.query("UPDATE attendance_records SET status=$1 WHERE id=$2", [record.status,existing.rows[0].id]);
      } else {
        await client.query("INSERT INTO attendance_records (session_id,student_id,status) VALUES ($1,$2,$3)", [sessionId,record.student_id,record.status]);
      }
    }
    await client.query("COMMIT");
    res.json({ message: "Attendance saved", count: records.length });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
});

export default router;
