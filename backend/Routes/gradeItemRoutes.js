import express from "express";
import {
  createGradeItem,
  getAllGradeItems,
  getGradeItemById,
  updateGradeItem,
  deleteGradeItem,
  getCourseGradeItems
} from "../controllers/gradeItemController.js";

const router = express.Router();

router.post("/", createGradeItem);
router.get("/", getAllGradeItems);
router.get("/:id", getGradeItemById);
router.put("/:id", updateGradeItem);
router.delete("/:id", deleteGradeItem);
router.get("/course/:courseAssignmentId", getCourseGradeItems);

export default router;
