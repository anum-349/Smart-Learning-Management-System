import QuizSubmission from "../models/quizSubmissionModel.js";
import Quiz from "../models/quizModel.js";
import Student from "../models/studentModel.js";

export const createQuizSubmission = async (req, res) => {
    try {
        const { quizId, studentId, fileUrl, marks } = req.body;

        const quiz = await Quiz.findById(quizId);
        const student = await Student.findById(studentId);

        if (!quiz) return res.status(404).json({ message: "Quiz not found" });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const submission = await QuizSubmission.create({
            quizId,
            studentId,
            fileUrl,
            marks
        });

        res.status(201).json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllQuizSubmissions = async (req, res) => {
    try {
        const submissions = await QuizSubmission.find()
            .populate("quizId", "title totalMarks")
            .populate("studentId", "firstName lastName registrationNo");

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getQuizSubmissionById = async (req, res) => {
    try {
        const submission = await QuizSubmission.findById(req.params.id)
            .populate("quizId", "title")
            .populate("studentId", "firstName lastName");

        if (!submission)
            return res.status(404).json({ message: "Submission not found" });

        res.status(200).json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getSubmissionsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const submissions = await QuizSubmission.find({ studentId })
            .populate("quizId", "title totalMarks");

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getSubmissionsByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const submissions = await QuizSubmission.find({ quizId })
            .populate("studentId", "firstName lastName registrationNo");

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const updateQuizSubmission = async (req, res) => {
    try {
        const updated = await QuizSubmission.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updated)
            return res.status(404).json({ message: "Submission not found" });

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const deleteQuizSubmission = async (req, res) => {
    try {
        const deleted = await QuizSubmission.findByIdAndDelete(req.params.id);

        if (!deleted)
            return res.status(404).json({ message: "Submission not found" });

        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
