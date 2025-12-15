import express from "express";
import {
    createNotification,
    getAllNotifications,
    getNotificationsByUser,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.post("/", createNotification);
router.get("/", getAllNotifications);
router.get("/user/:userId", getNotificationsByUser);
router.put("/:id", updateNotification);
router.delete("/:id", deleteNotification);

router.put("/mark-read/:id", markAsRead);
router.put("/mark-all-read/:userId", markAllAsRead);

export default router;
