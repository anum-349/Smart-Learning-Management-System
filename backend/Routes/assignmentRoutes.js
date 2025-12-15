import express from "express";
import {
    createData,
    getAllData,
    getDataById,
    updateData,
    deleteData,
    getAssignmentsByCourseAssignment,
    getAssignmentsByCourse,
    getAssignmentsForStudent
} from "../controllers/assignmentController.js";

const router = express.Router();

router.post("/", createData);
router.get("/", getAllData);
router.get("/:id", getDataById);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

router.get("/course-assignment/:courseAssignmentId", getAssignmentsByCourseAssignment);
router.get("/course/:courseId", getAssignmentsByCourse);
router.get("/student/:studentId", getAssignmentsForStudent);

export default router;
