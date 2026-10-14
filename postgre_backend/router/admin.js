import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const metrics = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM students) AS "totalStudents",
        (SELECT COUNT(*)::int FROM instructors) AS "totalInstructors",
        (SELECT COUNT(*)::int FROM courses) AS "totalCourses",
        (SELECT COUNT(*)::int FROM faculties) AS "totalFaculties",
        (SELECT COUNT(*)::int FROM departments) AS "totalDepartments",
        (SELECT COUNT(*)::int FROM enrollment_requests WHERE status = 'Pending') AS "totalRequestsPending"
    `);
    let name = "Admin";
    if (req.query.userId) {
      const user = await pool.query("SELECT full_name FROM users WHERE id = $1", [req.query.userId]);
      name = user.rows[0]?.full_name || name;
    }
    res.json({ ...metrics.rows[0], name });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, full_name, email, phone, address, profile_picture FROM users WHERE id = $1`,
      [req.params.userId]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Admin profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Admin profile error:", err);
    res.status(500).json({ message: "Failed to load admin profile" });
  }
});

router.put("/profile/:userId", async (req, res) => {
  const { username, full_name, email, phone, address } = req.body;
  if (!full_name?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  try {
    const result = await pool.query(
      `UPDATE users SET username=COALESCE(NULLIF($1,''), username), full_name=$2, email=$3, phone=$4, address=$5
       WHERE id=$6
       RETURNING id, username, full_name, email, phone, address, profile_picture`,
      [username?.trim() || "", full_name.trim(), email.trim(), phone || null, address || null, req.params.userId]
    );
    if (!result.rowCount) return res.status(404).json({ message: "Admin profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Admin profile update error:", err);
    res.status(err.code === "23505" ? 409 : 500).json({
      message: err.code === "23505" ? "Username or email is already in use" : "Failed to update admin profile",
    });
  }
});

export default router;
