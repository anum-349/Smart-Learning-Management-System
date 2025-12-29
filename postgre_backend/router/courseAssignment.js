import express from "express";
import pool from "../config/db.js";

const router = express.Router();
router.post("/", async (req, res) => {
    try {
        const {
            instructorId,
            courseId,
            semesterId,
            prerequisiteCourseId
        } = req.body;

        console.log(req.body)

        const { rows } = await pool.query(
            `INSERT INTO course_assignments
       (instructor_id, course_id, semester_id, prerequisite_course_id)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
            [instructorId, courseId, semesterId, prerequisiteCourseId || null]
        );

        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query(`
      SELECT
  ca.id,
  d.title AS department,
  p.title AS program,
  b.title AS batch,
  s.semester_number AS semester,
  i.id AS instructor_id,
  i.full_name,
  d.id as department_id,
  p.id as program_id,
  b.id as batch_id,
  c.id AS course_id,
  c.title AS course,
  pc.id AS prereq_id,
  f.id AS faculty_id,
  s.id as semester_id,
  pc.title AS prereq_course
FROM course_assignments ca
JOIN courses c ON c.id = ca.course_id
JOIN semesters s ON s.id = ca.semester_id
JOIN batches b ON b.id = s.batch_id
JOIN programs p ON p.id = b.program_id
JOIN departments d ON d.id = p.department_id
JOIN faculties f ON f.id = d.faculty_id
JOIN users i ON i.id = ca.instructor_id
LEFT JOIN courses pc ON pc.id = ca.prerequisite_course_id
ORDER BY ca.id DESC;
    `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            instructorId,
            courseId,
            semesterId,
            prerequisiteCourseId
        } = req.body;

        console.log(req.body)
        const { rows } = await pool.query(
            `UPDATE course_assignments
       SET instructor_id=$1,
           course_id=$2,
           semester_id=$3,
           prerequisite_course_id=$4
       WHERE id=$5
       RETURNING *`,
            [instructorId, courseId, semesterId, prerequisiteCourseId || null, id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM course_assignments WHERE id=$1",
            [req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/instructor/:instructorId", async (req, res) => {
    const {instructorId} = req.params;

    try {
        const { rows } = await pool.query(`
SELECT
  ca.id,
  c.title,
  c.id as course_id,
  c.code
FROM course_assignments ca
JOIN courses c ON c.id = ca.course_id
where instructor_id = $1
    `, [instructorId]);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;