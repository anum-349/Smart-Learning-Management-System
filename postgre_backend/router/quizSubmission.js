import express from "express";
import pool from "../config/db.js";

const router = express.Router();
// GET /api/quiz-submissions/quiz/:quizId
router.get("/quiz/:quizId", async (req, res) => {
    try {
        const { quizId } = req.params;

        const result = await pool.query(
            `
           SELECT 
                qs.id,
                s.full_name AS student_name,
                qs.status,
                qs.submitted_at,
                qs.file_name,
                qs.file_path,
                qs.grade,
                qs.feedback
            FROM quiz_submissions qs
            JOIN users s ON s.id = qs.student_id
            WHERE qs.quiz_id = $1
            ORDER BY s.full_name
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
        const { grade, feedback } = req.body;

        if (grade < 0 || grade > 10) {
            return res.status(400).json({ error: "Invalid grade value" });
        }

        const result = await pool.query(
            `
            UPDATE quiz_submissions
            SET grade = $1,
                feedback = $2,
                status = 'Graded',
                updated_at = NOW()
            WHERE id = $3
            RETURNING *
            `,
            [grade, feedback, submissionId]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/quiz-submissions/:quizId/submit
router.post("/:quizId/submit", async (req, res) => {
    try {
        const { quizId } = req.params;
        const { student_id, file_name, file_path } = req.body;

        const result = await pool.query(
            `
            INSERT INTO quiz_submissions
            (quiz_id, student_id, file_name, file_path, submitted_at, status)
            VALUES ($1,$2,$3,$4,NOW(),'Submitted')
            ON CONFLICT (quiz_id, student_id)
            DO UPDATE SET
                file_name = EXCLUDED.file_name,
                file_path = EXCLUDED.file_path,
                submitted_at = NOW(),
                status = 'Submitted'
            RETURNING *
            `,
            [quizId, student_id, file_name, file_path]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router