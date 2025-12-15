import TicketReply from "../models/ticketReplyModel.js";
import Ticket from "../models/helpDeskTicketModel.js";
import User from "../models/userModel.js";

export const createReply = async (req, res) => {
    try {
        const { ticketId, responderId, message } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const user = await User.findById(responderId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const reply = await TicketReply.create({ ticketId, responderId, message });
        res.status(201).json(reply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllReplies = async (req, res) => {
    try {
        const replies = await TicketReply.find()
            .populate("ticketId", "title status")
            .populate("responderId", "firstName lastName email role");
        res.status(200).json(replies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getReplyById = async (req, res) => {
    try {
        const reply = await TicketReply.findById(req.params.id)
            .populate("ticketId", "title status")
            .populate("responderId", "firstName lastName email role");
        if (!reply) return res.status(404).json({ message: "Reply not found" });
        res.status(200).json(reply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateReply = async (req, res) => {
    try {
        const reply = await TicketReply.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reply) return res.status(404).json({ message: "Reply not found" });
        res.status(200).json(reply);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteReply = async (req, res) => {
    try {
        const reply = await TicketReply.findByIdAndDelete(req.params.id);
        if (!reply) return res.status(404).json({ message: "Reply not found" });
        res.status(200).json({ message: "Reply deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getRepliesByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const replies = await TicketReply.find({ ticketId })
            .populate("responderId", "firstName lastName email role");
        res.status(200).json(replies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getRepliesByUser = async (req, res) => {
    try {
        const { responderId } = req.params;
        const replies = await TicketReply.find({ responderId })
            .populate("ticketId", "title status");
        res.status(200).json(replies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
