import mongoose from "mongoose";

const submission = new mongoose.Schema({
    assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
    },
    fileUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now},
    marks: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("AssignmentSubmission", submission)