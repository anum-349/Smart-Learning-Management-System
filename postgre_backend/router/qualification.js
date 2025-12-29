// routes/qualifications.js
import express from "express";
import pool from "../config/db.js";
import multer from "multer";

const router = express.Router();

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// -------------------
// GET all qualifications for an instructor
// GET /api/qualifications/:instructorId
router.get("/:instructorId", async (req, res) => {
  const { instructorId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM instructor_qualifications WHERE instructor_id = $1",
      [instructorId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------
// ADD a new qualification
// POST /api/qualifications/:instructorId
router.post("/:instructorId", upload.single("documentFile"), async (req, res) => {
  const { instructorId } = req.params;
  const { degree, field, institution, year } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO instructor_qualifications (instructor_id, degree, field, institution, year, document_file)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        instructorId,
        degree,
        field,
        institution,
        year,
        req.file ? req.file.filename : null,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------
// UPDATE a qualification
// PUT /api/qualifications/:id
router.put("/:id", upload.single("documentFile"), async (req, res) => {
  const { id } = req.params;
  const { degree, field, institution, year } = req.body;

  try {
    const existing = await pool.query(
      "SELECT * FROM instructor_qualifications WHERE id = $1",
      [id]
    );
    if (!existing.rows.length) return res.status(404).json({ message: "Qualification not found" });

    const updated = await pool.query(
      `UPDATE instructor_qualifications
       SET degree=$1, field=$2, institution=$3, year=$4,
           document_file=COALESCE($5, document_file)
       WHERE id=$6 RETURNING *`,
      [
        degree,
        field,
        institution,
        year,
        req.file ? req.file.filename : null,
        id,
      ]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------
// DELETE a qualification
// DELETE /api/qualifications/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM instructor_qualifications WHERE id = $1", [id]);
    res.json({ message: "Qualification deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
