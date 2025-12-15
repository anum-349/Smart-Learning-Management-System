import express from "express";
import {
    createReply,
    getAllReplies,
    getRepliesByMessage,
    updateReply,
    deleteReply
} from "../controllers/replyController.js";

const router = express.Router();

router.post("/", createReply);
router.get("/", getAllReplies);
router.get("/message/:messageId", getRepliesByMessage);
router.put("/:id", updateReply);
router.delete("/:id", deleteReply);

export default router;
