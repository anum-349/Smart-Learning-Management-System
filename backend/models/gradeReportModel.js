import mongoose from "mongoose";

const gradeReportSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  semester: {
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true },
    courses: [
      {
        courseAssignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "CourseAssignment", required: true },
        marks: { type: Number }
      }
    ],
    semesterGPA: { type: Number, required: true },
  },
  cumulativeGPA: { type: Number, required: true },
}, { timestamps: true }); 

export default mongoose.model("GradeReport", gradeReportSchema);
