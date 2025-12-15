import express from "express";
import {
    assignDepartmentToFaculty,
    assignStudentDepartmentSemester,
    createCourseAssignment,
    getStudentLinkedInfo
} from "../controllers/linkController.js";

const router = express.Router();

router.post("/faculty/assign-department", assignDepartmentToFaculty);
router.post("/student/assign-department-semester", assignStudentDepartmentSemester);
router.post("/course-assignment/create", createCourseAssignment);
router.get("/student/:id/linked-info", getStudentLinkedInfo);

export default router;
