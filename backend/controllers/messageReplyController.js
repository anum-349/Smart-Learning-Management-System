import Reply from "../models/replyModel.js";

export const createReply = async (req, res) => {
    try {
        const reply = await Reply.create(req.body);
        return res.status(201).json({ success: true, data: reply });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getAllReplies = async (req, res) => {
    try {
        const replies = await Reply.find()
            .populate("messageId")
            .populate("senderId", "firstName lastName email");

        return res.status(200).json({ success: true, data: replies });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getRepliesByMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const replies = await Reply.find({ messageId })
            .sort({ createdAt: -1 })
            .populate("senderId", "firstName lastName email");

        return res.status(200).json({ success: true, data: replies });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const updateReply = async (req, res) => {
    try {
        const updated = await Reply.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ success: false, message: "Reply not found" });

        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const deleteReply = async (req, res) => {
    try {
        const deleted = await Reply.findByIdAndDelete(req.params.id);

        if (!deleted)
            return res.status(404).json({ success: false, message: "Reply not found" });

        return res.status(200).json({ success: true, message: "Reply deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
