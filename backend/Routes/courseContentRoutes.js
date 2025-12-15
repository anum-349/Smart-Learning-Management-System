import express from "express";
import {
    createContent,
    getAllContent,
    getContentById,
    updateContent,
    deleteContent,
    getContentByCourse
} from "../controllers/courseContentController.js";

const router = express.Router();

router.post("/", createContent);
router.get("/", getAllContent);
router.get("/:id", getContentById);
router.put("/:id", updateContent);
router.delete("/:id", deleteContent);
router.get("/course/:courseId", getContentByCourse);

export default router;
