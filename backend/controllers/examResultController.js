import ExamResult from "../models/examResult.js";
import Exam from "../models/exam.js";

export const createExamResult = async (req, res) => {
    try {
        const { examId, studentId, obtainedMarks } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam)
            return res.status(404).json({ message: "Exam not found" });

        if (obtainedMarks > exam.totalMarks)
            return res.status(400).json({
                message: `Obtained marks cannot exceed total marks (${exam.totalMarks})`
            });

        const result = await ExamResult.create({
            examId,
            studentId,
            obtainedMarks
        });

        res.status(201).json({
            message: "Exam result created successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllExamResults = async (req, res) => {
    try {
        const results = await ExamResult.find()
            .populate("examId", "title date totalMarks")
            .populate("studentId", "firstName lastName email");

        res.status(200).json({ data: results });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getExamResultById = async (req, res) => {
    try {
        const result = await ExamResult.findById(req.params.id)
            .populate("examId", "title date totalMarks")
            .populate("studentId", "firstName lastName email");

        if (!result)
            return res.status(404).json({ message: "Exam result not found" });

        res.status(200).json({ data: result });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const updateExamResult = async (req, res) => {
    try {
        const result = await ExamResult.findById(req.params.id);

        if (!result)
            return res.status(404).json({ message: "Exam result not found" });

        const exam = await Exam.findById(result.examId);

        if (req.body.obtainedMarks > exam.totalMarks)
            return res.status(400).json({
                message: `Marks cannot exceed total marks (${exam.totalMarks})`
            });

        const updated = await ExamResult.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            message: "Exam result updated successfully",
            data: updated
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteExamResult = async (req, res) => {
    try {
        const deleted = await ExamResult.findOneAndDelete({ _id: req.params.id });

        if (!deleted)
            return res.status(404).json({ message: "Exam result not found" });

        res.status(200).json({ message: "Exam result deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getResultsByExam = async (req, res) => {
    try {
        const results = await ExamResult.find({ examId: req.params.examId })
            .populate("studentId", "firstName lastName email");

        res.status(200).json({ data: results });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getStudentResults = async (req, res) => {
    try {
        const results = await ExamResult.find({ studentId: req.params.studentId })
            .populate("examId", "title date totalMarks");

        res.status(200).json({ data: results });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
