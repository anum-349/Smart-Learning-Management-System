import mongoose from "mongoose";

const courseAssignment = new mongoose.Schema({
    instructorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    semesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: true
    },
    preRequisite: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
}, { timestamps: true });

courseAssignment.pre("findOneAndDelete", async function (next) {
    const assignment = await this.model.findOne(this.getFilter());
    if (!assignment) return next();

    const courseAssignmentId = assignment._id;

    await mongoose.model("Announcement").deleteMany({ courseAssignmentId });
    await mongoose.model("Assignment").deleteMany({ courseAssignmentId });
    await mongoose.model("AttendanceSession").deleteMany({ courseAssignmentId });
    await mongoose.model("Exam").deleteMany({ courseAssignmentId });
    await mongoose.model("GradeItem").deleteMany({ courseAssignmentId });
    await mongoose.model("PerformanceAnalytics").deleteMany({ courseAssignmentId });
    await mongoose.model("Quiz").deleteMany({ courseAssignmentId });
    await mongoose.model("StudentCourse").deleteMany({ courseAssignmentId });
    await mongoose.model("Timetable").deleteMany({ courseAssignmentId });

    await mongoose.model("GradeReport").updateMany(
        { "semester.courses.courseAssignmentId": courseAssignmentId },
        { $pull: { "semester.courses": { courseAssignmentId } } }
    );
    next();
});


export default mongoose.model("CourseAssignment", courseAssignment)
