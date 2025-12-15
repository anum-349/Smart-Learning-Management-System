import mongoose from "mongoose";

const studentCourse = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    enrollmentDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Active", 'InActive'],
        default: "Active"
    },
}, { timestamps: true }); 
export default mongoose.model("StudentCourse", studentCourse)