import express from "express";
import {
    createSession,
    getAllSessions,
    getSessionById,
    updateSession,
    deleteSession,
    getSessionsByCourseAssignment
} from "../controllersAttendanceSessionController.js";

const router = express.Router();

router.post("/", createSession);
router.get("/", getAllSessions);
router.get("/:id", getSessionById);
router.put("/:id", updateSession);
router.delete("/:id", deleteSession);
router.get("/courseAssignment/:courseAssignmentId", getSessionsByCourseAssignment);

export default router;
