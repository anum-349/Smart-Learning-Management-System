import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js"; // PostgreSQL connection

const router = express.Router();

// Multer storage for uploaded files
const storage = multer.diskStorage({
    destination: "uploads/quizzes",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 20 MB max
});

// ------------------ CREATE QUIZ ------------------
router.post("/", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File is too large. Max 20MB allowed." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Your quiz creation logic here
    next();
  });
}, async (req, res) => {
  try {
    const { course_id, title, description, total_marks, start_date, deadline } = req.body;
    const file = req.file;

    const result = await pool.query(
      `INSERT INTO quizzes 
       (course_id, title, description, file_name, file_path, total_marks, start_date, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        course_id,
        title,
        description,
        file ? file.originalname : null,
        file ? file.path : null,
        total_marks || 1,
        start_date || null,
        deadline || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------ GET ALL QUIZZES FOR A COURSE ------------------
router.get("/course/:courseId", async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await pool.query(
            "SELECT * FROM quizzes WHERE course_id=$1 ORDER BY created_at DESC",
            [courseId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------ GET SINGLE QUIZ ------------------
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM quizzes WHERE id=$1", [id]);
        if (!result.rows.length) return res.status(404).json({ error: "Quiz not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------ UPDATE QUIZ ------------------
router.put("/:id", upload.single("file"), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, total_marks, deadline } = req.body;
        const file = req.file;

        console.log(req.body, file)
        let query, values;

        if (file) {
            // Delete old file
            const oldFile = await pool.query("SELECT file_path FROM quizzes WHERE id=$1", [id]);
            if (oldFile.rows[0] && oldFile.rows[0].file_path) {
                fs.unlink(path.join(process.cwd(), oldFile.rows[0].file_path), (err) => {
                    if (err) console.warn("Failed to delete old file:", err.message);
                });
            }

            query = `UPDATE quizzes
                     SET title=$1, description=$2, total_marks=$3, deadline=$4, file_name=$5, file_path=$6
                     WHERE id=$7 RETURNING *`;
            values = [title, description, total_marks, deadline, file.originalname, file.path, id];
        } else {
            query = `UPDATE quizzes
                     SET title=$1, description=$2, total_marks=$3, deadline=$4
                     WHERE id=$6 RETURNING *`;
            values = [title, description, total_marks, deadline, id];
        }

        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ------------------ DELETE QUIZ ------------------
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const file = await pool.query("SELECT file_path FROM quizzes WHERE id=$1", [id]);

        if (file.rows[0] && file.rows[0].file_path) {
            fs.unlink(path.join(process.cwd(), file.rows[0].file_path), (err) => {
                if (err) console.warn("Failed to delete file:", err.message);
            });
        }

        await pool.query("DELETE FROM quizzes WHERE id=$1", [id]);
        res.json({ message: "Quiz deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
