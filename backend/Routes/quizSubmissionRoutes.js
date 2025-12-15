import express from "express";
import {
    createQuizSubmission,
    getAllQuizSubmissions,
    getQuizSubmissionById,
    getSubmissionsByStudent,
    getSubmissionsByQuiz,
    updateQuizSubmission,
    deleteQuizSubmission
} from "../controllers/quizSubmissionController.js";

const router = express.Router();

router.post("/", createQuizSubmission);
router.get("/", getAllQuizSubmissions);
router.get("/:id", getQuizSubmissionById);
router.get("/student/:studentId", getSubmissionsByStudent);
router.get("/quiz/:quizId", getSubmissionsByQuiz);
router.put("/:id", updateQuizSubmission);
router.delete("/:id", deleteQuizSubmission);

export default router;
