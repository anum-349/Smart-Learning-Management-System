import express from "express";
import {
    createExamResult,
    getAllExamResults,
    getExamResultById,
    updateExamResult,
    deleteExamResult,
    getResultsByExam,
    getStudentResults
} from "../controllers/examResultController.js";

const router = express.Router();

router.post("/", createExamResult);
router.get("/", getAllExamResults);
router.get("/:id", getExamResultById);
router.put("/:id", updateExamResult);
router.delete("/:id", deleteExamResult);
router.get("/exam/:examId", getResultsByExam);

router.get("/student/:studentId", getStudentResults);

export default router;
