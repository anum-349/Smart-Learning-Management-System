import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  fileUrl: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  marks: { type: Number, default: 0 },
}, { timestamps: true }); 
export default mongoose.model("QuizSubmission", quizSubmissionSchema);
