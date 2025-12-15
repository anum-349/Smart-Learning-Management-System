import express from "express";
import {
    createInstructor,
    getAllInstructors,
    getInstructorById,
    updateInstructor,
    deleteInstructor,
    getInstructorsByFaculty,
    addQualification
} from "../controllers/instructorController.js";

const router = express.Router();

router.post("/", createInstructor);
router.get("/", getAllInstructors);
router.get("/:id", getInstructorById);
router.put("/:id", updateInstructor);
router.delete("/:id", deleteInstructor);

router.get("/faculty/:deptId", getInstructorsByFaculty);
router.post("/:id/add-qualification", addQualification);

export default router;
