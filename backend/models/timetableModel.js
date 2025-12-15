import mongoose from "mongoose";

const timetable = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    dayOfWeek: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: True
    },
    classRoom: {
        type: String,
        required: true
    },
}, { timestamps: true });

export default mongoose.model("Timetable", timetable)