import express from "express";
import {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    getQuizzesByCourseAssignment,
    updateQuiz,
    deleteQuiz
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/", createQuiz);
router.get("/", getAllQuizzes);
router.get("/:id", getQuizById);
router.get("/course-assignment/:courseAssignmentId", getQuizzesByCourseAssignment);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

export default router;
