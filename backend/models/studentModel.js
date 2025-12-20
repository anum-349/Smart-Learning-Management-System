import mongoose from "mongoose";
import User from "./userModel.js";

const studentSchema = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    programId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program",
        required: true
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive", "frozen", "in_progress", "completed", "withdrawn"],
        required: true
    },
    qualifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Qualification"
    }],
}, { timestamps: true });

export default User.discriminator("Student", studentSchema);
