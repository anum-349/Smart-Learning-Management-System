import AttendanceSession from "../models/attendanceSessionModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";

export const createSession = async (req, res) => {
    try {
        const { courseAssignmentId, date } = req.body;

        const course = await CourseAssignment.findById(courseAssignmentId);
        if (!course) return res.status(404).json({ message: "CourseAssignment not found" });

        const session = await AttendanceSession.create({ courseAssignmentId, date });
        res.status(201).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllSessions = async (req, res) => {
    try {
        const sessions = await AttendanceSession.find()
            .populate("courseAssignmentId", "courseId teacherId sectionId");
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSessionById = async (req, res) => {
    try {
        const session = await AttendanceSession.findById(req.params.id)
            .populate("courseAssignmentId", "courseId teacherId sectionId");
        if (!session) return res.status(404).json({ message: "Attendance session not found" });
        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateSession = async (req, res) => {
    try {
        const session = await AttendanceSession.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!session) return res.status(404).json({ message: "Attendance session not found" });
        res.status(200).json(session);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteSession = async (req, res) => {
    try {
        const session = await AttendanceSession.findByIdAndDelete(req.params.id);
        if (!session) return res.status(404).json({ message: "Attendance session not found" });

        await AttendanceRecord.deleteMany({ sessionId: session._id });

        res.status(200).json({ message: "Attendance session deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getSessionsByCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        const sessions = await AttendanceSession.find({ courseAssignmentId })
            .populate("courseAssignmentId", "courseId teacherId sectionId");
        res.status(200).json(sessions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
