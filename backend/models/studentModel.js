import mongoose from "mongoose";
import Grade from "./gradeModel.js";
import User from "./userModel.js";
const studentSchema = new mongoose.Schema({
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },
    status: {
        type: string,
        enum: ["active", "inactive", "frozen", "in_progress", "completed", "withdrawn"],
        reqired: true
    },
    qualifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Qualification"
    }],
}, { timestamps: true });

export default User.discriminator("Student", studentSchema);
