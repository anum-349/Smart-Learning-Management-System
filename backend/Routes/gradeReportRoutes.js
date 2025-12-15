import express from "express";
import {
  createGradeReport,
  getAllGradeReports,
  getGradeReportById,
  updateGradeReport,
  deleteGradeReport,
  getStudentGradeReports,
  getSemesterGradeReports
} from "../controllers/gradeReportController.js";

const router = express.Router();

router.post("/", createGradeReport);
router.get("/", getAllGradeReports);
router.get("/:id", getGradeReportById);
router.put("/:id", updateGradeReport);
router.delete("/:id", deleteGradeReport);

router.get("/student/:studentId", getStudentGradeReports);
router.get("/semester/:semesterId", getSemesterGradeReports);

export default router;
