import Notification from "../models/notificationModel.js";

export const createNotification = async (req, res) => {
    try {
        const notification = await Notification.create(req.body);
        return res.status(201).json({ success: true, data: notification });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().populate("userId");
        return res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const getNotificationsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, data: notifications });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const updated = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ success: false, message: "Not found" });

        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const updateNotification = async (req, res) => {
    try {
        const updated = await Notification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ success: false, message: "Not found" });

        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const deleteNotification = async (req, res) => {
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);

        if (!deleted)
            return res.status(404).json({ success: false, message: "Not found" });

        return res.status(200).json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { userId },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ success: true, message: "All marked as read" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
