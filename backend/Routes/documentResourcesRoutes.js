import express from "express";
import {
    createResource,
    getAllResources,
    getResourceById,
    updateResource,
    deleteResource,
    getResourcesByCourse,
    getResourcesByInstructor
} from "../controllers/documentResourcesController.js";

const router = express.Router();

router.post("/", createResource);
router.get("/", getAllResources);
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);
router.get("/course/:courseId", getResourcesByCourse);
router.get("/instructor/:instructorId", getResourcesByInstructor);

export default router;
