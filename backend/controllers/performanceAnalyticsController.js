import PerformanceAnalytics from "../models/performanceAnalyticsModel.js";

export const createAnalytics = async (req, res) => {
    try {
        const record = await PerformanceAnalytics.create(req.body);
        res.status(201).json({ message: "Analytics record created", data: record });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllAnalytics = async (req, res) => {
    try {
        const records = await PerformanceAnalytics.find()
            .populate("studentId", "firstName lastName registrationNo")
            .populate("courseAssignmentId", "courseId instructorId")
            .populate("semesterId", "title startDate endDate");
        res.status(200).json({ data: records });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnalyticsByStudent = async (req, res) => {
    try {
        const records = await PerformanceAnalytics.find({ studentId: req.params.studentId })
            .populate("courseAssignmentId", "courseId instructorId")
            .populate("semesterId", "title startDate endDate");
        res.status(200).json({ data: records });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAnalyticsByCourse = async (req, res) => {
    try {
        const records = await PerformanceAnalytics.find({ courseAssignmentId: req.params.courseAssignmentId })
            .populate("studentId", "firstName lastName registrationNo")
            .populate("semesterId", "title startDate endDate");
        res.status(200).json({ data: records });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAnalytics = async (req, res) => {
    try {
        const updated = await PerformanceAnalytics.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: "Analytics record not found" });
        res.status(200).json({ message: "Updated successfully", data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAnalytics = async (req, res) => {
    try {
        const deleted = await PerformanceAnalytics.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Analytics record not found" });
        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
