import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import AssignmentSubmission from "../models/assignmentSubmissionModel.js";
import AttendanceRecord from "../models/attendanceRecordModel.js";
import ExamResult from "../models/examResultModel.js";
import Grade from "../models/gradeModel.js";
import GradeReport from "../models/gradeReportModel.js";
import QuizSubmission from "../models/quizSubmissionModel.js";
import StudentCourse from "../models/studentCourseModel.js";

export const createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });

        const studentId = student._id;

        await AssignmentSubmission.deleteMany({ studentId });
        await AttendanceRecord.deleteMany({ studentId });
        await ExamResult.deleteMany({ studentId });
        await Grade.deleteMany({ studentId });
        await GradeReport.deleteMany({ studentId });
        await QuizSubmission.deleteMany({ studentId });
        await StudentCourse.deleteMany({ studentId });

        res.status(200).json({ message: "Student and related records deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
