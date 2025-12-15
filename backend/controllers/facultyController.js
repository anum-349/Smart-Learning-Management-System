import Faculty from "../models/facultyModel.js";

// CREATE Faculty
export const createFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.create(req.body);
        res.status(201).json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL Faculties
export const getAllFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.status(200).json(faculties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Faculty by ID
export const getFacultyById = async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id);
        if (!faculty) return res.status(404).json({ error: "Faculty not found" });
        res.status(200).json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE Faculty
export const updateFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!faculty) return res.status(404).json({ error: "Faculty not found" });
        res.status(200).json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findByIdAndDelete(req.params.id);
        if (!faculty) return res.status(404).json({ message: "Faculty not found" });
        res.status(200).json({ message: "Faculty and all related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};