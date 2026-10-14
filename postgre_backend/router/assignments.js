import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";

const router = express.Router();
fs.mkdirSync(path.resolve("uploads/assignments"), { recursive: true });
fs.mkdirSync(path.resolve("uploads/assignment-submissions"), { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/assignments",
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
  }),
});
const submissionUpload = multer({ dest: "uploads/assignment-submissions" });

const ownsCourse = async (instructorId, courseId) => {
  const { rowCount } = await pool.query(
    "SELECT 1 FROM course_assignments WHERE instructor_id=$1 AND course_id=$2",
    [instructorId, courseId]
  );
  return rowCount > 0;
};

router.get("/instructor/:instructorId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, c.title AS course_title, c.code AS course_code,
        COUNT(s.id)::int AS submissions_count
       FROM assignments a JOIN courses c ON c.id=a.course_id
       LEFT JOIN assignment_submissions s ON s.assignment_id=a.id
       WHERE a.instructor_id=$1
       GROUP BY a.id,c.title,c.code ORDER BY a.created_at DESC`,
      [req.params.instructorId]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", upload.single("file"), async (req, res) => {
  const { course_id, instructor_id, title, description, total_marks, start_date, deadline } = req.body;
  try {
    if (!course_id || !instructor_id || !title?.trim()) return res.status(400).json({ error: "Course, instructor and title are required" });
    if (!(await ownsCourse(instructor_id, course_id))) return res.status(403).json({ error: "You are not assigned to this course" });
    const { rows } = await pool.query(
      `INSERT INTO assignments (course_id,instructor_id,title,description,file_name,file_path,total_marks,start_date,deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [course_id,instructor_id,title.trim(),description || null,req.file?.originalname || null,req.file?.path || null,total_marks || 1,start_date || null,deadline || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put("/:id", upload.single("file"), async (req, res) => {
  const { instructor_id, title, description, total_marks, deadline } = req.body;
  try {
    const existing = await pool.query("SELECT * FROM assignments WHERE id=$1 AND instructor_id=$2", [req.params.id, instructor_id]);
    if (!existing.rowCount) return res.status(404).json({ error: "Assignment not found" });
    const { rows } = await pool.query(
      `UPDATE assignments SET title=$1, description=$2, total_marks=$3, deadline=$4,
       file_name=COALESCE($5,file_name), file_path=COALESCE($6,file_path)
       WHERE id=$7 AND instructor_id=$8 RETURNING *`,
      [title,description || null,total_marks,deadline || null,req.file?.originalname || null,req.file?.path || null,req.params.id,instructor_id]
    );
    if (req.file && existing.rows[0].file_path) fs.unlink(path.resolve(existing.rows[0].file_path), () => {});
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const { instructor_id } = req.query;
    const { rows } = await pool.query("DELETE FROM assignments WHERE id=$1 AND instructor_id=$2 RETURNING file_path", [req.params.id,instructor_id]);
    if (!rows.length) return res.status(404).json({ error: "Assignment not found" });
    if (rows[0].file_path) fs.unlink(path.resolve(rows[0].file_path), () => {});
    res.json({ message: "Assignment deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id/submissions", async (req, res) => {
  try {
    const { instructor_id } = req.query;
    const { rows } = await pool.query(
      `SELECT s.id, st.user_id AS student_id, u.full_name AS student_name, u.registration_no,
        s.file_name,s.file_path,s.submitted_at,s.grade,s.feedback,
        CASE WHEN s.id IS NULL THEN 'Not Submitted' WHEN s.grade IS NULL THEN 'Submitted' ELSE 'Graded' END AS status
       FROM assignments a
       JOIN enrollment_requests er ON er.course_id=a.course_id AND er.status IN ('Approved','Enrolled')
       JOIN students st ON st.id=er.student_id
       JOIN users u ON u.id=st.user_id
       LEFT JOIN assignment_submissions s ON s.assignment_id=a.id AND s.student_id=st.user_id
       WHERE a.id=$1 AND a.instructor_id=$2 ORDER BY u.full_name`,
      [req.params.id,instructor_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/:id/submissions", submissionUpload.single("file"), async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id || !req.file) {
      if (req.file?.path) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: "Student and submission file are required" });
    }
    const previous = await pool.query(
      "SELECT file_path FROM assignment_submissions WHERE assignment_id=$1 AND student_id=$2",
      [req.params.id,student_id]
    );
    const { rows } = await pool.query(
      `INSERT INTO assignment_submissions (assignment_id,student_id,file_name,file_path)
       SELECT a.id,$2,$3,$4 FROM assignments a
       WHERE a.id=$1 AND (a.start_date IS NULL OR a.start_date <= CURRENT_DATE)
         AND (a.deadline IS NULL OR a.deadline >= CURRENT_DATE)
         AND EXISTS (
           SELECT 1 FROM enrollment_requests er
           JOIN students st ON st.id=er.student_id
           WHERE er.course_id=a.course_id AND er.status IN ('Approved','Enrolled') AND st.user_id=$2
         )
       ON CONFLICT (assignment_id,student_id) DO UPDATE SET
         file_name=EXCLUDED.file_name,file_path=EXCLUDED.file_path,submitted_at=NOW(),grade=NULL,feedback=NULL
       RETURNING *`,
      [req.params.id,student_id,req.file.originalname,req.file.path]
    );
    if (!rows.length) {
      fs.unlink(req.file.path, () => {});
      return res.status(403).json({ error: "Assignment unavailable or the student is not enrolled" });
    }
    if (previous.rows[0]?.file_path) fs.unlink(path.resolve(previous.rows[0].file_path), () => {});
    res.status(201).json(rows[0]);
  } catch (err) {
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: err.message });
  }
});

router.put("/submissions/:submissionId/grade", async (req, res) => {
  const { instructor_id, grade, feedback } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE assignment_submissions s SET grade=$1,feedback=$2
       FROM assignments a WHERE s.id=$3 AND s.assignment_id=a.id AND a.instructor_id=$4
       AND $1 >= 0 AND $1 <= a.total_marks RETURNING s.*`,
      [grade,feedback || null,req.params.submissionId,instructor_id]
    );
    if (!rows.length) return res.status(400).json({ error: "Submission not found or grade is outside the allowed range" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
