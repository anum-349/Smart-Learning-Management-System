import express from "express";
import pool from "../config/db.js"; // your PostgreSQL pool config

const router = express.Router();

// Get all programs with department info
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.title,
        p.code,
        p.duration_years,
        d.id AS department_id,
        d.title AS department_title
      FROM programs p
      LEFT JOIN departments d ON p.department_id = d.id
      ORDER BY p.id;
    `);

    const programs = result.rows.map(p => ({
      id: p.id,
      title: p.title,
      code: p.code,
      durationYears: p.duration_years,
      departmentId: p.department_id ? { id: p.department_id, title: p.department_title } : null
    }));

    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get a single program by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM programs WHERE id = $1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Program not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new program
router.post("/", async (req, res) => {
  const { title, code, duration_years, department_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO programs (title, code, duration_years, department_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, code, duration_years, department_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update a program
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, code, duration_years, department_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE programs 
       SET title=$1, code=$2, duration_years=$3, department_id=$4
       WHERE id=$5 RETURNING *`,
      [title, code, duration_years, department_id, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Program not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete a program
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM programs WHERE id=$1 RETURNING *`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ message: "Program not found" });
    res.json({ message: "Program deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
