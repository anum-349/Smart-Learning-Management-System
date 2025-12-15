import express from "express";
import {
    createTicket,
    getAllTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    getUserTickets,
    resolveTicket
} from "../controllers/helpDeskController.js";

const router = express.Router();

router.post("/", createTicket);
router.get("/", getAllTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

router.get("/user/:userId", getUserTickets);
router.put("/:id/resolve", resolveTicket);

export default router;
