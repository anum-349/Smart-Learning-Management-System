import mongoose from "mongoose";

const attendanceSession = new mongoose.Schema({
    courseAssignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseAssignment",
        required: true
    },
    date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

attendanceSession.pre("findOneAndDelete", async function (next) {
    try {
        const session = await this.model.findOne(this.getFilter());
        if (!session) return next();

        await mongoose.model("AttendanceRecord")
            .deleteMany({ sessionId: session._id });

        next();
    } catch (err) {
        next(err);
    }
});
export default mongoose.model("AttendanceSession", attendanceSession)