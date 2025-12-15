import express from "express";
import {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamsByCourseAssignment
} from "../controllers/examController.js";

const router = express.Router();

router.post("/", createExam);
router.get("/", getAllExams);
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);
router.get("/course-assignment/:courseAssignmentId", getExamsByCourseAssignment);

export default router;
