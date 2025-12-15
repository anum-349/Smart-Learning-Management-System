import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
    semesterNumber: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
}, { timestamps: true });

semesterSchema.pre("findOneAndDelete", async function(next) {
  try {
    const semester = await this.model.findOne(this.getFilter());
    if (!semester) return next();

    await mongoose.model("CourseAssignment").updateMany(
      { semesterId: semester._id },
      { $pull: { semesterId: semester._id } }
    );

    await mongoose.model("GradeReport").updateMany(
            { "semester.semesterId": semester._id },
            { $pull: { "semester.semesterId": semester._id } }
    );
    await mongoose.model("PerformanceAnalytics").updateMany(
      { semesterId: semester._id },
      { $pull: { semesterId: semester._id } }
    );
    await mongoose.model("Student").updateMany(
      { semesterId: semester._id },
      { $pull: { semesterId: semester._id } }
    );

    next();
  } catch (err) {
    next(err);
  }
});


export default mongoose.model("Semester", semesterSchema);
