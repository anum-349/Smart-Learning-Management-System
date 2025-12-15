import mongoose from "mongoose";

const announcement = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    title: { type: String },
    message: { type: String },
}, { timestamps: true });

export default mongoose.model("Announcement", announcement)