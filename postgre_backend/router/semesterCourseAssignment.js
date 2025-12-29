import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sa.id, sa.semester, sa.assigned_course_ids as courses, b.id as batch_id, s.id as semester_id, b.title as batch_name, p.title as program_name, d.title as department_name, d.id as department_id, p.id as program_id, s.id as semester_id
      FROM semester_assignments sa
      JOIN programs p ON sa.program_id = p.id
      JOIN departments d ON p.department_id = d.id
	  join semesters s on sa.semester = s.id
	  Join batches b ON b.id = s.batch_id
      ORDER BY sa.program_id, sa.semester
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:programId/:semester", async (req, res) => {
  try {
    const { programId, semester } = req.params;
    const result = await pool.query(
      `SELECT * FROM semester_assignments WHERE program_id = $1 AND semester = $2`,
      [programId, semester]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Assignment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { program_id, semester_id, assigned_course_ids } = req.body;

    const existing = await pool.query(
      `SELECT * FROM semester_assignments WHERE program_id = $1 AND semester = $2`,
      [program_id, semester_id]
    );

    if (existing.rows.length > 0) {
      // UPDATE
      const result = await pool.query(
        `UPDATE semester_assignments 
         SET assigned_course_ids = $1 
         WHERE program_id = $2 AND semester = $3
         RETURNING *`,
        [assigned_course_ids, program_id, semester_id]
      );
      return res.json(result.rows[0]);
    } else {
      // INSERT
      const result = await pool.query(
        `INSERT INTO semester_assignments (program_id, semester, assigned_course_ids)
         VALUES ($1, $2, $3) RETURNING *`,
        [program_id, semester_id, assigned_course_ids]
      );
      return res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE assignment (PUT)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { program_id, semester_id, assigned_course_ids } = req.body;

    if (!program_id || !semester_id || !assigned_course_ids) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `
      UPDATE semester_assignments
      SET 
        program_id = $1,
        semester = $2,
        assigned_course_ids = $3
      WHERE id = $4
      RETURNING *
      `,
      [program_id, semester_id, assigned_course_ids, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT semester assignment error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE assignment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM semester_assignments WHERE id = $1`, [id]);
    res.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
