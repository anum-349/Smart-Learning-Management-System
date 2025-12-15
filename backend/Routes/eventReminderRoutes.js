import express from "express";
import {
  createReminder,
  getAllReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  getRemindersByUser,
  getRemindersByEvent
} from "../controllers/eventReminderController.js";

const router = express.Router();

router.post("/", createReminder);
router.get("/", getAllReminders);
router.get("/:id", getReminderById);
router.put("/:id", updateReminder);
router.delete("/:id", deleteReminder);
router.get("/user/:userId", getRemindersByUser);
router.get("/event/:eventId", getRemindersByEvent);

export default router;
