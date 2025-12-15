import Timetable from "../models/timetableModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";
import StudentCourse from "../models/studentCourseModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";

export const createTimetable = async (req, res) => {
    try {
        const { courseAssignmentId, dayOfWeek, startTime, endTime, classRoom } = req.body;

        const courseAssignment = await CourseAssignment.findById(courseAssignmentId);
        if (!courseAssignment) return res.status(404).json({ message: "CourseAssignment not found" });

        const timetable = await Timetable.create({ courseAssignmentId, dayOfWeek, startTime, endTime, classRoom });
        res.status(201).json(timetable);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find()
            .populate("courseAssignmentId", "courseId instructorId semesterId");
        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTimetableById = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate("courseAssignmentId", "courseId instructorId semesterId");
        if (!timetable) return res.status(404).json({ message: "Timetable not found" });
        res.status(200).json(timetable);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateTimetable = async (req, res) => {
    try {
        if (req.body.courseAssignmentId) {
            const courseAssignment = await CourseAssignment.findById(req.body.courseAssignmentId);
            if (!courseAssignment) return res.status(404).json({ message: "CourseAssignment not found" });
        }

        const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!timetable) return res.status(404).json({ message: "Timetable not found" });
        res.status(200).json(timetable);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(req.params.id);
        if (!timetable) return res.status(404).json({ message: "Timetable not found" });
        res.status(200).json({ message: "Timetable deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTimetablesByCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        const timetables = await Timetable.find({ courseAssignmentId })
            .populate("courseAssignmentId", "courseId instructorId semesterId");
        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTimetablesForStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const enrolledCourses = await StudentCourse.find({ studentId }).select("courseAssignmentId");
        const courseAssignmentIds = enrolledCourses.map(c => c.courseAssignmentId);

        const timetables = await Timetable.find({ courseAssignmentId: { $in: courseAssignmentIds } })
            .populate("courseAssignmentId", "courseId instructorId semesterId");

        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getTimetablesForInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;

        const courseAssignments = await CourseAssignment.find({ instructorId }).select("_id");
        const courseAssignmentIds = courseAssignments.map(ca => ca._id);

        const timetables = await Timetable.find({ courseAssignmentId: { $in: courseAssignmentIds } })
            .populate("courseAssignmentId", "courseId instructorId semesterId");

        res.status(200).json(timetables);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};