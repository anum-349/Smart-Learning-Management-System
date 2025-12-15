import express from "express";
import {
    createMessage,
    getAllMessages,
    getMessageById,
    updateMessage,
    deleteMessage,
    getConversation
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", createMessage);
router.get("/", getAllMessages);
router.get("/:id", getMessageById);
router.put("/:id", updateMessage);
router.delete("/:id", deleteMessage);

router.get("/conversation/:user1/:user2", getConversation);

export default router;
