import express from "express";
import {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventsByType,
    getEventsByDateRange
} from "../controllers/calendarController.js";

const router = express.Router();

router.post("/", createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

router.get("/type/:type", getEventsByType);
router.get("/range", getEventsByDateRange); // ?startDate=2025-12-01&endDate=2025-12-31

export default router;
