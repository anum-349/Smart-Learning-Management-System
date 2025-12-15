import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema({
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    obtainedMarks: {
        type: Number,
        required: true,
        min: 0
    },
}, { timestamps: true }); 
export default mongoose.model("ExamResult", examResultSchema);
