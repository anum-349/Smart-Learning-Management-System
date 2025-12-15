import StudentCourse from "../models/studentCourseModel.js";
import Student from "../models/studentModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";

export const createData = async (req, res) => {
    try {
        const { studentId, courseAssignmentId, enrollmentDate, status } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const courseAssignment = await CourseAssignment.findById(courseAssignmentId);
        if (!courseAssignment) return res.status(404).json({ message: "CourseAssignment not found" });

        const studentCourse = await StudentCourse.create({ studentId, courseAssignmentId, enrollmentDate, status });
        res.status(201).json(studentCourse);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllData = async (req, res) => {
    try {
        const enrollments = await StudentCourse.find()
            .populate("studentId", "firstName lastName registrationNo")
            .populate("courseAssignmentId", "courseId instructorId semesterId");
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDataById = async (req, res) => {
    try {
        const enrollment = await StudentCourse.findById(req.params.id)
            .populate("studentId", "firstName lastName registrationNo")
            .populate("courseAssignmentId", "courseId instructorId semesterId");
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.status(200).json(enrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateData = async (req, res) => {
    try {
        const enrollment = await StudentCourse.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.status(200).json(enrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteData = async (req, res) => {
    try {
        const enrollment = await StudentCourse.findByIdAndDelete(req.params.id);
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
        res.status(200).json({ message: "Enrollment deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getEnrollmentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const enrollments = await StudentCourse.find({ studentId })
            .populate("courseAssignmentId", "courseId instructorId semesterId");
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getEnrollmentsByCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        const enrollments = await StudentCourse.find({ courseAssignmentId })
            .populate("studentId", "firstName lastName registrationNo");
        res.status(200).json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
