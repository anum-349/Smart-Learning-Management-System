import express from "express";
import {
    createTimetable,
    getAllTimetables,
    getTimetableById,
    updateTimetable,
    deleteTimetable,
    getTimetablesByCourseAssignment,
    getTimetablesForInstructor,
    getTimetablesForStudent
} from "../controllers/timetableController.js";

const router = express.Router();

router.post("/", createTimetable);
router.get("/", getAllTimetables);
router.get("/:id", getTimetableById);
router.put("/:id", updateTimetable);
router.delete("/:id", deleteTimetable);
router.get("/courseAssignment/:courseAssignmentId", getTimetablesByCourseAssignment);
router.get("/student/:studentId", getTimetablesForStudent);
router.get("/instructor/:instructorId", getTimetablesForInstructor);
export default router;
