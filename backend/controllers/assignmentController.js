import Assignment from "../models/assignmentModel.js";
import StudentCourse from "../models/studentCourseModel.js";
import AssignmentSubmission from "../models/assignmentSubmissionModel.js";

export const createData = async (req, res) => {
    try {
        const data = await Assignment.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllData = async (req, res) => {
    try {
        const data = await Assignment.find()
            .populate("courseAssignmentId", "courseId teacherId sectionId");
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDataById = async (req, res) => {
    try {
        const data = await Assignment.findById(req.params.id)
            .populate("courseAssignmentId", "courseId teacherId sectionId");
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateData = async (req, res) => {
    try {
        const data = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteData = async (req, res) => {
    try {
        const data = await Assignment.findByIdAndDelete(req.params.id);

        if (!data) return res.status(404).json({ error: "Not Found" });

        const assignmentId = data._id;
        await AssignmentSubmission.deleteMany({ assignmentId });

        res.status(200).json({ message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAssignmentsByCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        const data = await Assignment.find({ courseAssignmentId })
            .populate("courseAssignmentId", "courseId teacherId sectionId");
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAssignmentsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const assignments = await Assignment.find()
            .populate({
                path: "courseAssignmentId",
                match: { courseId },
                select: "courseId teacherId sectionId"
            });

        const filtered = assignments.filter(a => a.courseAssignmentId !== null);

        res.status(200).json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAssignmentsForStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const enrolledCourses = await StudentCourse.find({ studentId }).select("courseAssignmentId");
        const courseAssignmentIds = enrolledCourses.map(c => c.courseAssignmentId);

        const assignments = await Assignment.find({
            courseAssignmentId: { $in: courseAssignmentIds }
        }).populate("courseAssignmentId", "courseId teacherId sectionId");

        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const closeExpiredAssignments = async () => {
    try {
        const now = new Date();

        await Assignment.updateMany(
            { dueDate: { $lt: now } },
            { $set: { isClosed: true } }
        );

        console.log("Expired assignments closed automatically.");
    } catch (err) {
        console.error("Error closing assignments:", err);
    }
};
