import HelpDeskTicket from "../models/helpDeskTicket.js";

export const createTicket = async (req, res) => {
    try {
        const newTicket = await HelpDeskTicket.create(req.body);

        res.status(201).json({
            success: true,
            message: "Help desk ticket created successfully",
            data: newTicket
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await HelpDeskTicket.find()
            .populate("userId", "firstName lastName email");

        res.status(200).json({ success: true, data: tickets });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getTicketById = async (req, res) => {
    try {
        const ticket = await HelpDeskTicket.findById(req.params.id)
            .populate("userId", "firstName lastName email");

        if (!ticket)
            return res.status(404).json({ error: "Ticket not found" });

        res.status(200).json({ success: true, data: ticket });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const updateTicket = async (req, res) => {
    try {
        const updated = await HelpDeskTicket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ error: "Ticket not found" });

        res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            data: updated
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteTicket = async (req, res) => {
    try {
        const deleted = await HelpDeskTicket.findByIdAndDelete(req.params.id);

        if (!deleted)
            return res.status(404).json({ error: "Ticket not found" });

        res.status(200).json({
            success: true,
            message: "Ticket deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getUserTickets = async (req, res) => {
    try {
        const tickets = await HelpDeskTicket.find({ userId: req.params.userId });

        res.status(200).json({ success: true, data: tickets });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const resolveTicket = async (req, res) => {
    try {
        const ticket = await HelpDeskTicket.findByIdAndUpdate(
            req.params.id,
            { status: "resolved" },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Ticket marked as resolved",
            data: ticket
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
