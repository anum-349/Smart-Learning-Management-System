import mongoose from "mongoose";

const faculty = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true },
  dean: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Instructor",
    required: true
  }

}, { timestamps: true });

faculty.pre("findOneAndDelete", async function (next) {
  try {
    const faculty = await this.model.findOne(this.getFilter());
    if (!faculty) return next();

    await mongoose.model("Department").updateMany(
      { facultyId: faculty._id },
      { $set: { faculty: null } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Faculty", faculty)