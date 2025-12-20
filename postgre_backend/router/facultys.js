import express from "express";
import pool from "../config/db.js"

const router = express.Router();

/** GET all faculties */
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
    f.id,
    f.title,
    f.code,
    u.id AS dean_id,
    u.full_name,
    COUNT(d.id) AS department_count
FROM faculties f
LEFT JOIN users u ON f.dean_id = u.id AND u.role = 'Instructor'
LEFT JOIN departments d ON f.id = d.faculty_id
GROUP BY f.id, f.title, f.code, u.id, u.full_name
ORDER BY f.id;
    `);

        const faculties = result.rows.map(f => ({
            id: f.id,
            title: f.title,
            code: f.code,
            dean: f.dean_id
                ? { id: f.dean_id, fullName: f.full_name, }
                : null,
            departmentCount: f.department_count
        }));

        res.json(faculties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

/** POST create a faculty */
router.post("/", async (req, res) => {
    const { title, code, dean_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO faculties (title, code, dean_id)
       VALUES ($1, $2, $3) RETURNING *`,
            [title, code, dean_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

/** PUT update a faculty */
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, code, dean_id } = req.body;

    try {
        const result = await pool.query(
            `UPDATE faculties SET title = $1, code = $2, dean_id = $3
       WHERE id = $4 RETURNING *`,
            [title, code, dean_id || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

/** DELETE a faculty */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM faculties WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.json({ message: "Faculty deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
