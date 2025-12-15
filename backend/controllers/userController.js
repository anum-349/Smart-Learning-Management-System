import User from "../models/userModel.js";
import EventReminder from "../models/eventReminderModel.js";
import HelpDeskTicket from "../models/helpDeskTicketModel.js";
import Message from "../models/messageModel.js";
import MessageReply from "../models/messageReplyModel.js";
import Notification from "../models/notificationModel.js";
import Qualification from "../models/qualificationModel.js";
import RegistrationRequest from "../models/registrationRequestModel.js";
import TicketReply from "../models/ticketReplyModel.js";

export const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        await EventReminder.deleteMany({ userId: user._id });
        await HelpDeskTicket.deleteMany({ userId: user._id });
        await Message.deleteMany({ senderId: user._id });
        await MessageReply.deleteMany({ senderId: user._id });
        await Notification.deleteMany({ userId: user._id });
        await Qualification.deleteMany({ userId: user._id });
        await RegistrationRequest.deleteMany({ userId: user._id });
        await TicketReply.deleteMany({ userId: user._id });

        res.status(200).json({ message: "User and related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
