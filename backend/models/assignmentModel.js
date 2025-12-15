import mongoose from "mongoose";

const assignment = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    dueDate: { type: Date },
    totalMarks: { type: Number, default: 10 },
}, { timestamps: true });

assignment.pre("findOneAndDelete", async function (next) {
    const assignment = await this.model.findOne(this.getFilter());
    if (!assignment) return next();

    const assignmentId = assignment._id;

    await mongoose.model("AssignmentSubmission").deleteMany({ assignmentId });
   
    next();
});

export default mongoose.model("Assignment", assignment)