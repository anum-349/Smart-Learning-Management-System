import express from "express";
import {
    createAnnouncement,
    getAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    getAnnouncementsByCourseAssignment,
    getAnnouncementsByCourse
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/", createAnnouncement);
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

router.get("/course-assignment/:courseAssignmentId", getAnnouncementsByCourseAssignment);
router.get("/course/:courseId", getAnnouncementsByCourse);

export default router;
