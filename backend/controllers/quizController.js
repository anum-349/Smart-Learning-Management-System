import Quiz from "../models/quizModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";
import QuizSubmission from "../models/quizSubmissionModel.js";

export const createQuiz = async (req, res) => {
    try {
        const { courseAssignmentId, title, description, fileUrl, dueDate, totalMarks } = req.body;

        const ca = await CourseAssignment.findById(courseAssignmentId);
        if (!ca)
            return res.status(404).json({ message: "Course Assignment not found" });

        const quiz = await Quiz.create({
            courseAssignmentId,
            title,
            description,
            fileUrl,
            dueDate,
            totalMarks
        });

        res.status(201).json(quiz);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find()
            .populate("courseAssignmentId", "courseId instructorId semesterId");

        res.status(200).json(quizzes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id)
            .populate("courseAssignmentId", "courseId instructorId semesterId");

        if (!quiz)
            return res.status(404).json({ message: "Quiz not found" });

        res.status(200).json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getQuizzesByCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;

        const quizzes = await Quiz.find({ courseAssignmentId })
            .populate("courseAssignmentId", "courseId instructorId");

        res.status(200).json(quizzes);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!quiz)
            return res.status(404).json({ message: "Quiz not found" });

        res.status(200).json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findOneAndDelete({ _id: req.params.id });

        if (!quiz)
            return res.status(404).json({ message: "Quiz not found" });

        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
