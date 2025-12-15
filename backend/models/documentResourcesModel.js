import mongoose from "mongoose";

const resource = new mongoose.Schema({
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true
    },
    assosiateWithId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
}, { timestamps: true });

export default mongoose.model("DocumentResource", resource);
