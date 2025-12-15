import express from "express";
import {
    createReply,
    getAllReplies,
    getReplyById,
    updateReply,
    deleteReply,
    getRepliesByTicket,
    getRepliesByUser
} from "../controllers/ticketReplyController.js";

const router = express.Router();

router.post("/", createReply);
router.get("/", getAllReplies);
router.get("/:id", getReplyById);
router.put("/:id", updateReply);
router.delete("/:id", deleteReply);
router.get("/ticket/:ticketId", getRepliesByTicket);
router.get("/user/:responderId", getRepliesByUser);

export default router;
