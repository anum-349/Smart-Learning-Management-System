import mongoose from "mongoose";
import User from "./userModel.js";

const instructorSchema = new mongoose.Schema({
    rank: { type: String },

    officeTiming: { type: String },   
    employmentTypeId: {
        type: String,
        enum: ['Permanent', 'Visiting']
    },

    status: {
        type: String,
        enum: ["active", "inactive", "suspended", "on_leave"],
        default: "Active"
    },

    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },

    reason: { type: String, default: "" },
    researchSpeciality: { type: String, default: "" },

    qualifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Qualification"
    }],
}, { timestamps: true });
const Instructor = User.discriminator("Instructor", instructorSchema);

export default Instructor;
