import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fileUrl: { type: String },
    issuedBy: { type: String },
    issuedDate: { type: Date }
});

const qualification = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    degree: { type: String, required: true },
    field: { type: String },
    institution: { type: String },
    year: { type: Number },
    certificates: [certificateSchema],
}, { timestamps: true });

qualification.pre("findOneAndDelete", async function(next) {
  try {
    const qualification = await this.model.findOne(this.getFilter());
    if (!qualification) return next();

    // Remove this qualification from students and instructors
    await mongoose.model("Student").updateMany(
      { qualifications: qualification._id },
      { $pull: { qualifications: qualification._id } }
    );

    await mongoose.model("Instructor").updateMany(
      { qualifications: qualification._id },
      { $pull: { qualifications: qualification._id } }
    );

    next();
  } catch (err) {
    next(err);
  }
});

export default mongoose.model("Qualification", qualification)