import mongoose from "mongoose";

const attendance = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AttendanceSession",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late"],
        default: "Present"
    },
}, { timestamps: true });

export default mongoose.model("AttendanceRecord", attendance)