import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    examType: {
        type: String,
        enum: ["Mid", "Terminal"],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
}, { timestamps: true });

examSchema.pre("findOneAndDelete", async function (next) {
    try {
        const exam = await this.model.findOne(this.getFilter());
        if (!exam) return next();

        await mongoose.model("ExamResult")
            .deleteMany({ examId: exam._id });

        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model("Exam", examSchema);
