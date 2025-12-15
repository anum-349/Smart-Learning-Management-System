import EventReminder from "../models/eventReminder.js";

export const createReminder = async (req, res) => {
    try {
        const reminder = await EventReminder.create(req.body);
        res.status(201).json({ message: "Reminder created", data: reminder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllReminders = async (req, res) => {
    try {
        const reminders = await EventReminder.find()
            .populate("eventId", "type dateTime classRoom")
            .populate("userId", "firstName lastName email role");
        res.status(200).json({ data: reminders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getReminderById = async (req, res) => {
    try {
        const reminder = await EventReminder.findById(req.params.id)
            .populate("eventId", "type dateTime classRoom")
            .populate("userId", "firstName lastName email role");
        if (!reminder) return res.status(404).json({ message: "Reminder not found" });
        res.status(200).json({ data: reminder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReminder = async (req, res) => {
    try {
        const updated = await EventReminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Reminder not found" });
        res.status(200).json({ message: "Reminder updated", data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteReminder = async (req, res) => {
    try {
        const deleted = await EventReminder.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Reminder not found" });
        res.status(200).json({ message: "Reminder deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRemindersByUser = async (req, res) => {
    try {
        const reminders = await EventReminder.find({ userId: req.params.userId })
            .populate("eventId", "type dateTime classRoom");
        res.status(200).json({ data: reminders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRemindersByEvent = async (req, res) => {
    try {
        const reminders = await EventReminder.find({ eventId: req.params.eventId })
            .populate("userId", "firstName lastName email role");
        res.status(200).json({ data: reminders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
