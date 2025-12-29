import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* =========================
   GET all semesters
========================= */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.semester_number,
        s.start_date,
        s.end_date,
        b.id AS batch_id,
        b.title AS batch_title
      FROM semesters s
      JOIN batches b ON s.batch_id = b.id
      ORDER BY s.id DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch semesters" });
  }
});

router.get("/", async (req, res) => {
  const { batchId } = req.query;

  try {
    const { rows } = await pool.query(
      `SELECT id, title
       FROM semesters
       WHERE batch_id = $1`,
      [batchId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CREATE semester
========================= */
router.post("/", async (req, res) => {
  const { semester_number, start_date, end_date, batch_id } = req.body;

  if (!semester_number || !start_date || !end_date || !batch_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO semesters (semester_number, start_date, end_date, batch_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [semester_number, start_date, end_date, batch_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create semester" });
  }
});

/* =========================
   UPDATE semester
========================= */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { semester_number, start_date, end_date, batch_id } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE semesters
      SET 
        semester_number = $1,
        start_date = $2,
        end_date = $3,
        batch_id = $4
      WHERE id = $5
      RETURNING *
      `,
      [semester_number, start_date, end_date, batch_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Semester not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update semester" });
  }
});

/* =========================
   DELETE semester
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM semesters WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Semester not found" });
    }

    res.status(200).json({ message: "Semester deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete semester" });
  }
});

export default router;
