import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CalendarEvent",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reminderTime: {
        type: Date,
        required: true
    },
}, { timestamps: true });

export default mongoose.model("EventReminder", reminderSchema);
