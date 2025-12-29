import express from "express";
import pool from "../config/db.js";

const router = express.Router();
router.get("/", async (req, res) => {
  const { departmentId, programId, semesterId, search } = req.query;

  try {
    let query = `
      SELECT er.*, u.full_name, c.title AS course_title, u.registration_no
      FROM enrollment_requests er
      JOIN students s ON er.student_id = s.id
	  JOIN users u on u.id = s.user_id
      JOIN courses c ON er.course_id = c.id
      WHERE 1=1
    `;
    const values = [];

    if (departmentId) {
      values.push(departmentId);
      query += ` AND s.department_id = $${values.length}`;
    }
    if (programId) {
      values.push(programId);
      query += ` AND s.program_id = $${values.length}`;
    }
    if (semesterId) {
      values.push(semesterId);
      query += ` AND s.semester_id = $${values.length}`;
    }
    if (search) {
      values.push(`%${search}%`);
      query += ` AND (u.full_name ILIKE $${values.length} OR c.title ILIKE $${values.length})`;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { student_id, course_id } = req.body;

    if (!student_id || !course_id) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query(
      `INSERT INTO enrollment_requests (student_id, course_id)
       VALUES ($1, $2)
       RETURNING *`,
      [student_id, course_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    // Duplicate request protection (unique constraint)
    if (err.code === "23505") {
      return res.status(409).json({ message: "Request already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Request failed" });
  }
});
router.put("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE enrollment_requests
       SET status = 'Approved'
       WHERE id = $1 AND status = 'Pending'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approve failed" });
  }
});
router.put("/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE enrollment_requests
       SET status = 'Rejected'
       WHERE id = $1 AND status = 'Pending'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Request not found or already processed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `DELETE FROM enrollment_requests WHERE id = $1`,
      [id]
    );

    res.json({ message: "Request deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// GET /student/enrollment/current/:studentId
router.get("/current/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT er.id, er.status, c.id AS course_id, c.code, c.title, c.credits, c.is_compulsory
      FROM enrollment_requests er
      JOIN courses c ON er.course_id = c.id
      WHERE er.student_id = $1 AND er.status = 'Created'
      `,
      [studentId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// PUT /student/enrollment/confirm/:studentId
router.put("/confirm/:studentId", async (req, res) => {
  const { studentId } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE enrollment_requests
      SET status = 'Enrolled'
      WHERE student_id = $1 AND status = 'Created'
      RETURNING *
      `,
      [studentId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No courses to confirm" });
    }

    res.json({ message: "Enrollment confirmed", courses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Confirmation failed" });
  }
});

export default router