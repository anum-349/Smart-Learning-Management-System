import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseAssignment", required: true },
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  dueDate: Date,
  totalMarks: { type: Number, default: 10 },
}, { timestamps: true });

quizSchema.pre("findOneAndDelete", async function(next) {
  try {
    const quiz = await this.model.findOne(this.getFilter());
    if (!quiz) return next();

    await mongoose.model("QuizSubmission").deleteMany({ quizId: quiz._id})
      

    next();
  } catch (err) {
    next(err);
  }
});

 export default quizSchema;