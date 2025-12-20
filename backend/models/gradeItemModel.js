import mongoose from "mongoose";

const gradeItemSchema = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    itemType: {
        type: String,
        enum: ["Quiz", "Assignment", "Mid", "Terminal", "Project", "Activity"],
        required: true
    },
    weightage: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
}, { timestamps: true });

gradeItemSchema.index(
    { courseAssignmentId: 1, itemType: 1 },
    { unique: true }
); 

gradeItemSchema.pre("findOneAndDelete", async function (next) {
    try {
        const gradeItem = await this.model.findOne(this.getFilter());
        if (!gradeItem) return next();

        await mongoose.model("Grade")
            .deleteMany({ gradeId: gradeItem._id });

        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model("GradeItem", gradeItemSchema)