import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET all courses
 */
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, title, code, credit_hours FROM courses"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
});

router.get("/", async (req, res) => {
  const { programId, semesterId } = req.query;

  try {
    const { rows } = await pool.query(
      `SELECT id, title
       FROM courses
       WHERE program_id = $1
       AND semester_id = $2`,
      [programId, semesterId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * CREATE course
 */
router.post("/", async (req, res) => {
    const { title, code, creditHours } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO courses (title, code, credit_hours)
       VALUES ($1, $2, $3)
       RETURNING id, title, code, credit_hours`,
            [title, code, creditHours]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);

        if (err.code === "23505") {
            return res.status(400).json({ message: "Course code already exists" });
        }

        res.status(500).json({ message: "Failed to create course" });
    }
});

/**
 * UPDATE course
 */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, code, creditHours } = req.body;

    try {
        const result = await pool.query(
            `UPDATE courses
       SET title = $1,
           code = $2,
           credit_hours = $3
                  WHERE id = $4
       RETURNING id, title, code, credit_hours`,
            [title, code, creditHours, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update course" });
    }
});

/**
 * DELETE course
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM courses WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete course" });
    }
});

export default router;
