import mongoose from "mongoose";

const registrationRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
});
 
registrationRequestSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.model("RegistrationRequest", registrationRequestSchema);
