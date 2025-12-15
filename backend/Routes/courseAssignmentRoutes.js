import express from "express";
import {
    createCourseAssignment,
    getAllCourseAssignments,
    getCourseAssignmentById,
    updateCourseAssignment,
    deleteCourseAssignment,
    getCourseAssignmentsByInstructor
} from "../controllers/courseAssignmentController.js";

const router = express.Router();

router.post("/", createCourseAssignment);
router.get("/", getAllCourseAssignments);
router.get("/:id", getCourseAssignmentById);
router.put("/:id", updateCourseAssignment);
router.delete("/:id", deleteCourseAssignment);
router.get("/instructor/:instructorId", getCourseAssignmentsByInstructor);

export default router;
