import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all batches
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
     SELECT b.id, b.title, b.term, b.year, p.title as program_title, p.id as program_id, b.batch_advisor_id, i.full_name
      FROM batches b
      JOIN programs p ON b.program_id = p.id
      JOIN users i ON b.batch_advisor_id = i.id
      ORDER BY b.id DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch batches" });
    }
});

// GET single batch by id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM batches WHERE id = $1", [id]);
        if (!result.rows.length) return res.status(404).json({ message: "Batch not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch batch" });
    }
});

// CREATE batch
router.post("/", async (req, res) => {
    const { title, year, term, program_id, batch_advisor_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO batches (title, year, term, program_id, batch_advisor_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [title, year, term, program_id, batch_advisor_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to create batch" });
    }
});

// UPDATE batch
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { title, year, term, program_id, batch_advisor_id } = req.body;
    try {
        const result = await pool.query(
            `UPDATE batches 
       SET title=$1, year=$2, term=$3, program_id=$4, batch_advisor_id=$5
       WHERE id=$6
       RETURNING *`,
            [title, year, term, program_id, batch_advisor_id, id]
        );
        if (!result.rows.length) return res.status(404).json({ message: "Batch not found" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update batch" });
    }
});

// DELETE batch
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM batches WHERE id=$1 RETURNING *", [id]);
        if (!result.rows.length) return res.status(404).json({ message: "Batch not found" });
        res.json({ message: "Batch deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete batch" });
    }
});

export default router;
