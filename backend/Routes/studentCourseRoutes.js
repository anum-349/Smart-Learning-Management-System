import express from "express";
import {
    createData,
    getAllData,
    getDataById,
    updateData,
    deleteData,
    getEnrollmentsByStudent,
    getEnrollmentsByCourseAssignment
} from "../controllers/studentCourseController.js";

const router = express.Router();

router.post("/", createData);
router.get("/", getAllData);
router.get("/:id", getDataById);
router.put("/:id", updateData);
router.delete("/:id", deleteData);
router.get("/student/:studentId", getEnrollmentsByStudent);
router.get("/courseAssignment/:courseAssignmentId", getEnrollmentsByCourseAssignment);

export default router;
