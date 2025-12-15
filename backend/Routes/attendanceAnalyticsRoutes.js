import express from "express";
import {
    attendanceRate,
    monthlyReport,
    lowAttendanceWarnings,
    courseAttendanceSummary,
    studentHistory
} from "../controllers/attendanceAnalyticsController.js";

const router = express.Router();

router.get("/rate/:studentId/:courseAssignmentId", attendanceRate);
router.get("/monthly", monthlyReport);
router.get("/warnings/:courseAssignmentId", lowAttendanceWarnings);
router.get("/summary/:courseAssignmentId", courseAttendanceSummary);
router.get("/student/:studentId", studentHistory);

export default router;
