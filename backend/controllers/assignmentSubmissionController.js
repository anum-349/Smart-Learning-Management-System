import AssignmentSubmission from "../models/assignmentSubmissionModel.js";
import Assignment from "../models/assignmentModel.js";

export const createData = () => async (req, res) => {
    try {
        const data = await AssignmentSubmission.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllData = () => async (req, res) => {
    try {
        const data = await AssignmentSubmission.find();
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDataById = () => async (req, res) => {
    try {
        const data = await AssignmentSubmission.findById(req.params.id);
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateData = () => async (req, res) => {
    try {
        const data = await AssignmentSubmission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteData = () => async (req, res) => {
    try {
        const data = await AssignmentSubmission.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json({ message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSubmissionsByAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const submissions = await AssignmentSubmission.find({ assignmentId })
            .populate("studentId", "firstName lastName email");

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSubmissionsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const submissions = await AssignmentSubmission.find({ studentId })
            .populate("assignmentId");

        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const hasSubmitted = async (req, res) => {
    try {
        const { assignmentId, studentId } = req.params;

        const exists = await AssignmentSubmission.findOne({ assignmentId, studentId });

        res.status(200).json({ submitted: !!exists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const gradeSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { marks } = req.body;

        const submission = await AssignmentSubmission.findByIdAndUpdate(
            id,
            { marks },
            { new: true }
        );

        if (!submission) {
            return res.status(404).json({ error: "Submission not found" });
        }

        res.status(200).json(submission);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAssignmentSummary = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ error: "Assignment not found" });

        const submissions = await AssignmentSubmission.find({ assignmentId });

        const summary = {
            assignmentId,
            title: assignment.title,
            totalSubmissions: submissions.length,
            averageMarks:
                submissions.length > 0
                    ? submissions.reduce((acc, s) => acc + s.marks, 0) / submissions.length
                    : 0,
        };

        res.status(200).json(summary);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};