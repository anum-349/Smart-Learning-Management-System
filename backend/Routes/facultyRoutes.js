import express from "express";
import {
    createFaculty,
    deleteFaculty,
    getAllFaculties,
    getFacultyById,
    updateFaculty,
    
} from "../controllers/facultyController.js";

const router = express.Router();

router.post("/", createFaculty);                // Create
router.get("/", getAllFaculties);              // Get all
router.get("/:id", getFacultyById);            // Get by ID
router.put("/:id", updateFaculty);     
router.delete("/:id", deleteFaculty);     


export default router;
