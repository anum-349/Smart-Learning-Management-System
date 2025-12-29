import express from "express";
import multer from "multer";
import path from "path";
import pool from "../config/db.js";
import fs from "fs";

const router = express.Router();

/* ================= MULTER ================= */
const storage = multer.diskStorage({
  destination: "uploads/resources",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ================= CREATE ================= */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { course_id, title, type } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "File required" });

    const result = await pool.query(
      `INSERT INTO course_resources 
       (course_id, title, type, file_name, file_path)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [course_id, title, type, file.originalname, file.path]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= READ ================= */
router.get("/course/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `SELECT * FROM course_resources 
       WHERE course_id=$1 
       ORDER BY uploaded_at DESC`,
      [courseId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= UPDATE (REMOVE OLD FILE) ================= */
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type } = req.body;
    const file = req.file;

    // 1️⃣ get old file path
    const old = await pool.query(
      "SELECT file_path FROM course_resources WHERE id=$1",
      [id]
    );

    let result;

    // 2️⃣ update DB
    if (file) {
      result = await pool.query(
        `UPDATE course_resources
         SET title=$1, type=$2, file_name=$3, file_path=$4
         WHERE id=$5 RETURNING *`,
        [title, type, file.originalname, file.path, id]
      );
    } else {
      result = await pool.query(
        `UPDATE course_resources
         SET title=$1, type=$2
         WHERE id=$3 RETURNING *`,
        [title, type, id]
      );
    }

    // 3️⃣ delete old file from disk
    if (file && old.rows.length) {
      const oldPath = path.join(process.cwd(), old.rows[0].file_path);

      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Old file delete failed:", err.message);
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ================= DELETE (REMOVE FILE) ================= */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // get file path
    const result = await pool.query(
      "SELECT file_path FROM course_resources WHERE id=$1",
      [id]
    );

    // delete db record
    await pool.query("DELETE FROM course_resources WHERE id=$1", [id]);

    // delete file from disk
    if (result.rows.length) {
      const filePath = path.join(process.cwd(), result.rows[0].file_path);
      fs.unlink(filePath, (err) => {
        if (err) console.warn("File delete failed:", err.message);
      });
    }

    res.json({ message: "Resource and file deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
