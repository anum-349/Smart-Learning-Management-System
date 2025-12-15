import Message from "../models/message.js";
import Reply from "../models/reply.js";

export const createMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        const newMessage = await Message.create({
            senderId,
            receiverId,
            content
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .populate("senderId", "name email")
            .populate("receiverId", "name email");

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getMessageById = async (req, res) => {
    try {
        const msg = await Message.findById(req.params.id)
            .populate("senderId", "name")
            .populate("receiverId", "name");

        if (!msg)
            return res.status(404).json({ error: "Message not found" });

        res.status(200).json({ success: true, data: msg });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const updateMessage = async (req, res) => {
    try {
        const updated = await Message.findByIdAndUpdate(
            req.params.id,
            { content: req.body.content },
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ error: "Message not found" });

        res.status(200).json({
            success: true,
            message: "Message updated successfully",
            data: updated
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findOneAndDelete({ _id: req.params.id });

        if (!message)
            return res.status(404).json({ error: "Message not found" });

        res.status(200).json({
            success: true,
            message: "Message and related replies deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getConversation = async (req, res) => {
    try {
        const { user1, user2 } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: user1, receiverId: user2 },
                { senderId: user2, receiverId: user1 }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
