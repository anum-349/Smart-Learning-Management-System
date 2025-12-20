import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all departments with faculty and HOD
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      select d.title, d.code, f.id as faculty_id, d.id as dept_id, f.title as faculty_title, u.id as user_id, u.full_name as hod
from departments d
left join faculties f on d.faculty_id = f.id
left join users u on u.id = d.head_of_dept_id
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// GET single department by ID
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM departments WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Department not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// CREATE a department
router.post("/", async (req, res) => {
    const { code, title, faculty_id, head_of_dept_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO departments (code, title, faculty_id, head_of_dept_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
            [code, title, faculty_id || null, head_of_dept_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// UPDATE a department
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { code, title, faculty_id, head_of_dept_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE departments
       SET code = $1, title = $2, faculty_id = $3, head_of_dept_id = $4
       WHERE id = $5 RETURNING *`,
            [code, title, faculty_id || null, head_of_dept_id || null, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Department not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// DELETE a department
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM departments WHERE id = $1", [id]);
        res.json({ message: "Department deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
