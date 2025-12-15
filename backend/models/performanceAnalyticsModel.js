import mongoose from "mongoose";

const performanceAnalyticsSchema = new mongoose.Schema({
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
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },
    gpa: { type: Number, default: 0 },
    totalMarksObtained: { type: Number, default: 0 },
    totalMarksPossible: { type: Number, default: 0 },
    quizzesCompleted: { type: Number, default: 0 },
    assignmentsCompleted: { type: Number, default: 0 },
    examsTaken: { type: Number, default: 0 },
    totalQuizzes: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    totalExams: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("PerformanceAnalytics", performanceAnalyticsSchema);
