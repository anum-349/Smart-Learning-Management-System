import mongoose from "mongoose";

const content = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    type: { type: String, enum: ["Video", "Document", "Quiz", "Other"], default: "Other" },
    title: { type: String, required: true },
    fileUrl: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true }); 

export default mongoose.model("CourseContent", content);
