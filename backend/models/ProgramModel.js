import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    durationYears: { type: Number, required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
}, { timestamps: true });

programSchema.pre("findOneAndDelete", async function (next) {
    try {
        const program = await this.model.findOne(this.getFilter());
        if (!program) return next();

        await mongoose.model("Batch").updateMany(
                { programId: program._id },
                { $set: { programId: null } }
            );
        next();
    } catch (err) {
        next(err);
    }
});
export default mongoose.model("Program", programSchema);
