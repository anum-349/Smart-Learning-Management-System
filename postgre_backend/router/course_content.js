import express from "express";
import pool from "../config/db.js";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs"

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    // Get title from req.body
    let title = req.body.title || "file";

    // Sanitize title (remove spaces, special chars)
    title = title.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");

    const ext = path.extname(file.originalname); // Keep original file extension
    const fileName = `${title}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

// Get all content
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT c.*, d.title AS department_name, p.title AS program_name, cs.title AS course_name FROM course_contents c LEFT JOIN departments d ON c.department_id::int = d.id LEFT JOIN programs p ON c.program_id::int = p.id LEFT JOIN courses cs ON c.course_id::int = cs.id ORDER BY c.created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new content
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { departmentId, programId, courseId, type, title, description } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO course_contents (department_id, program_id, course_id, type, title, file_url, description) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [departmentId, programId, courseId, type, title, fileUrl, description]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete content
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Get the file URL first
    const result = await pool.query("SELECT file_url FROM course_contents WHERE id=$1", [id]);
    const fileUrl = result.rows[0]?.file_url;

    // Delete DB entry
    await pool.query("DELETE FROM course_contents WHERE id=$1", [id]);

    // Delete file from uploads folder
    if (fileUrl) {
      const filePath = path.join(process.cwd(), "uploads", path.basename(fileUrl));
      console.log(filePath)
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.json({ message: "Content and file deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
