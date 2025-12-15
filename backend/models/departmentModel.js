import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    code: { type: String, required: true },
    title: { type: String, required: true },
    headOfDept: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
    },
}, { timestamps: true }); 

departmentSchema.pre("findOneAndDelete", async function (next) {
    const department = await this.model.findOne(this.getFilter());
    if (!department) return next();

    const departmentId = department._id;

    await mongoose.model("Instructor").updateMany(
        { departmentId: departmentId },
        { $set: { departmentId: null } }
    );
    await mongoose.model("Program").updateMany(
        { departmentId: departmentId },
        { $set: { departmentId: null } }
    );
    await mongoose.model("Student").updateMany(
        { departmentId: departmentId },
        { $set: { departmentId: null } }
    );

    next();
});


export default mongoose.model("Department", departmentSchema);
