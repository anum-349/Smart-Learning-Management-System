import Semester from "../models/semester.js";

export const createSemester = async (req, res) => {
    try {
        const semester = await Semester.create(req.body);
        res.status(201).json(semester);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find();
        res.status(200).json(semesters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getSemesterById = async (req, res) => {
    try {
        const semester = await Semester.findById(req.params.id);
        if (!semester) return res.status(404).json({ error: "Semester not found" });
        res.status(200).json(semester);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateSemester = async (req, res) => {
    try {
        const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!semester) return res.status(404).json({ error: "Semester not found" });
        res.status(200).json(semester);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteSemester = async (req, res) => {
    try {
        const semester = await Semester.findByIdAndDelete(req.params.id);
        if (!semester) return res.status(404).json({ message: "Semester not found" });
        res.status(200).json({ message: "Semester and all related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};