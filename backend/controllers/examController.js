import Exam from "../models/exam.js";

export const createExam = async (req, res) => {
    try {
        const { courseAssignmentId, examType, date, totalMarks } = req.body;

        const exam = await Exam.create({
            courseAssignmentId,
            examType,
            date,
            totalMarks
        });

        res.status(201).json({
            message: "Exam created successfully",
            data: exam
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate("courseAssignmentId", "courseId instructorId");

        res.status(200).json({ data: exams });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate("courseAssignmentId", "courseId instructorId");

        if (!exam)
            return res.status(404).json({ message: "Exam not found" });

        res.status(200).json({ data: exam });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateExam = async (req, res) => {
    try {
        const updated = await Exam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ message: "Exam not found" });

        res.status(200).json({
            message: "Exam updated successfully",
            data: updated
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteExam = async (req, res) => {
    try {
        const deleted = await Exam.findOneAndDelete({ _id: req.params.id });

        if (!deleted)
            return res.status(404).json({ message: "Exam not found" });

        res.status(200).json({ message: "Exam deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getExamsByCourseAssignment = async (req, res) => {
    try {
        const exams = await Exam.find({
            courseAssignmentId: req.params.courseAssignmentId
        });

        res.status(200).json({ data: exams });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
