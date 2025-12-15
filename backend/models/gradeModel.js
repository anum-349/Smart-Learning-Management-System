import mongoose from "mongoose";

const grade = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    gradeItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GradeItem",
        required: true
    }, 
    score: {
        type: Number,
        required: true
    },
}, { timestamps: true }); 
export default mongoose.model("Grade", grade);
