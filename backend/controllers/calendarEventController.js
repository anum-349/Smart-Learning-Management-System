import CalendarEvent from "../models/calendarModel.js";

export const createEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.create(req.body);
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find().sort({ dateTime: 1 });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getEventById = async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ error: "Event not found" });
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getEventsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const events = await CalendarEvent.find({ type }).sort({ dateTime: 1 });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getEventsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; 
        const events = await CalendarEvent.find({
            dateTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).sort({ dateTime: 1 });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
