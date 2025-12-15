import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
    title: { type: String, required: true },
    year: { type: Number, required: true },
    term: { type: String, enum: ["Fall", "Spring", "Summer"], required: true },
    programId: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    batchAdvisor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
}, { timestamps: true });

batchSchema.pre("findOneAndDelete", async function(next) {
    const batch = await this.model.findOne(this.getFilter());
    if (!batch) return next();

    const batchId = batch._id;

    await mongoose.model("Semester").updateMany(
        { batchId },
        { $set: { batchId: null } }
    );

    next();
});

export default mongoose.model("Batch", batchSchema);
