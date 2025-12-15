import express from "express";
import {
    createAnalytics,
    getAllAnalytics,
    getAnalyticsByStudent,
    getAnalyticsByCourse,
    updateAnalytics,
    deleteAnalytics
} from "../controllers/performanceAnalyticsController.js";

const router = express.Router();

router.post("/", createAnalytics);
router.get("/", getAllAnalytics);
router.get("/student/:studentId", getAnalyticsByStudent);
router.get("/course/:courseAssignmentId", getAnalyticsByCourse);
router.put("/:id", updateAnalytics);
router.delete("/:id", deleteAnalytics);

export default router;
