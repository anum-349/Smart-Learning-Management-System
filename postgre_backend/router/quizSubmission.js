import express from "express";
import pool from "../config/db.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();
const submissionDirectory = path.resolve("uploads/quiz-submissions");
fs.mkdirSync(submissionDirectory, { recursive: true });
const submissionUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, callback) => callback(null, submissionDirectory),
        filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
    }),
    limits: { fileSize: 50 * 1024 * 1024 },
});
// GET /api/quiz-submissions/quiz/:quizId
router.get("/quiz/:quizId", async (req, res) => {
    try {
        const { quizId } = req.params;

        const result = await pool.query(
            `
            SELECT qs.id, u.id AS student_id, u.full_name AS student_name, u.registration_no,
                COALESCE(qs.status,'Not Submitted') AS status, qs.submitted_at,
                qs.file_name, qs.file_path, qs.grade, qs.feedback
            FROM quizzes q
            JOIN enrollment_requests er ON er.course_id=q.course_id AND er.status IN ('Approved','Enrolled')
            JOIN students st ON st.id=er.student_id
            JOIN users u ON u.id=st.user_id
            LEFT JOIN quiz_submissions qs ON qs.quiz_id=q.id AND qs.student_id=u.id
            WHERE q.id = $1
            ORDER BY u.full_name
            `,
            [quizId]
        );

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// PUT /api/quiz-submissions/:submissionId/grade
router.put("/:submissionId/grade", async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { grade, feedback, instructor_id } = req.body;
        if (!Number.isFinite(Number(grade)) || Number(grade) < 0 || !instructor_id) {
            return res.status(400).json({ error: "A valid grade and instructor are required" });
        }

        const result = await pool.query(
            `
            UPDATE quiz_submissions qs
            SET grade = $1, feedback = $2, status = 'Graded', updated_at = NOW()
            FROM quizzes q, course_assignments ca
            WHERE qs.id = $3 AND q.id = qs.quiz_id AND ca.course_id=q.course_id
              AND ca.instructor_id=$4 AND $1 <= q.total_marks
            RETURNING qs.*
            `,
            [grade, feedback, submissionId, instructor_id]
        );
        if (!result.rowCount) return res.status(400).json({ error: "Submission not found or grade exceeds maximum marks" });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/quiz-submissions/:quizId/submit
// student_id is the logged-in user's ID; quiz_submissions references users.id.
router.post("/:quizId/submit", submissionUpload.single("file"), async (req, res) => {
    try {
        const { quizId } = req.params;
        const { student_id } = req.body;
        if (!student_id || !req.file) {
            return res.status(400).json({ error: "Student and submission file are required" });
        }

        const previous = await pool.query(
            "SELECT file_path FROM quiz_submissions WHERE quiz_id=$1 AND student_id=$2",
            [quizId, student_id]
        );

        const result = await pool.query(
            `
            INSERT INTO quiz_submissions
            (quiz_id, student_id, file_name, file_path, submitted_at, status)
            SELECT q.id,$2,$3,$4,NOW(),'Submitted'
            FROM quizzes q
            WHERE q.id=$1 AND (q.start_date IS NULL OR q.start_date <= CURRENT_DATE)
              AND (q.deadline IS NULL OR q.deadline >= CURRENT_DATE)
              AND EXISTS (
                SELECT 1 FROM enrollment_requests er
                JOIN students st ON st.id=er.student_id
                WHERE er.course_id=q.course_id AND er.status IN ('Approved','Enrolled') AND st.user_id=$2
              )
            ON CONFLICT (quiz_id, student_id)
            DO UPDATE SET
                file_name = EXCLUDED.file_name,
                file_path = EXCLUDED.file_path,
                submitted_at = NOW(),
                status = 'Submitted', grade = NULL, feedback = NULL, updated_at = NOW()
            RETURNING *
            `,
            [quizId, student_id, req.file.originalname, req.file.path]
        );

        if (!result.rowCount) {
            fs.unlink(req.file.path, () => {});
            return res.status(403).json({ error: "Quiz is unavailable or the student is not enrolled" });
        }
        if (previous.rows[0]?.file_path) fs.unlink(path.resolve(previous.rows[0].file_path), () => {});
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (req.file?.path) fs.unlink(req.file.path, () => {});
        res.status(500).json({ error: err.message });
    }
});

export default router
