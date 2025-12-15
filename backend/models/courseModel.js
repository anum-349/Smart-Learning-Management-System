import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true },
    creditHours: { type: Number, required: true },
}, { timestamps: true }); 

courseSchema.pre("findOneAndDelete", async function (next) {
    const course = await this.model.findOne(this.getFilter());
    if (!course) return next();

    const courseId = course._id;

    await mongoose.model("CourseAssignment").deleteMany({ courseId });

    await mongoose.model("CourseAssignment").updateMany(
        { preRequisite: courseId },
        { $set: { preRequisite: null } }
    );

    await mongoose.model("CourseContent").deleteMany({ courseId });
    await mongoose.model("DocumentResources").deleteMany({ assosiateWithId: courseId });
    await mongoose.model("RegistrationRequest").deleteMany({ courseId });

    next();
});

export default mongoose.model("Course", courseSchema);
