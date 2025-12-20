// routes/instructors.js
import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/instructor/:id/timetable", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT day, time, course_code AS course, section, lab_share AS "labShare", venue
             FROM timetable
             WHERE instructor_id = $1
             ORDER BY day, time`,
            [id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/:id/timetable", async (req, res) => {
    const { id } = req.params;
    const { day, time, course, section, labShare, venue } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO timetable (instructor_id, day, time, course_code, section, lab_share, venue)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING *`,
            [id, day, time, course, section, labShare, venue]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id/timetable", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT day, time, course_name AS course, location
       FROM timetable
       WHERE student_id = $1
       ORDER BY day, time`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
