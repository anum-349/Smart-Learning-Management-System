import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* ================= GET timetable by user ================= */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
         t.id,
         t.day,
         t.slot,
         t.venue,
         c.title AS course_name,
         c.id AS course_id
       FROM timetable t
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = $1
       ORDER BY 
         CASE t.day
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
         END`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/student/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
         t.id,
         t.day,
         t.slot AS time,
         t.venue AS location,
         c.title AS course,
         c.id AS course_id
       FROM timetable t
       JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = $1
       ORDER BY 
         CASE t.day
           WHEN 'Monday' THEN 1
           WHEN 'Tuesday' THEN 2
           WHEN 'Wednesday' THEN 3
           WHEN 'Thursday' THEN 4
           WHEN 'Friday' THEN 5
         END,
         t.slot`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD timetable ================= */
router.post("/", async (req, res) => {
  try {
    const { user_id, day, slot, course_id, venue } = req.body;

    const result = await pool.query(
      `INSERT INTO timetable
       (user_id, day, slot, course_id, venue)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [user_id, day, slot, course_id, venue]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Time slot already occupied for this day"
      });
    }
    res.status(500).json({ error: err.message });
  }
});
/* ================= UPDATE timetable ================= */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { day, slot, course_id, venue } = req.body;

    const result = await pool.query(
      `UPDATE timetable
       SET day=$1, slot=$2, course_id=$3, venue=$4
       WHERE id=$5
       RETURNING *`,
      [day, slot, course_id, venue, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({
        message: "Time slot already occupied for this day"
      });
    }
    res.status(500).json({ error: err.message });
  }
});
/* ================= DELETE timetable ================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM timetable WHERE id=$1", [id]);

    res.json({ message: "Timetable entry deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router