import Program from "../models/program.js";

export const createProgram = async (req, res) => {
    try {
        const program = await Program.create(req.body);
        res.status(201).json(program);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllPrograms = async (req, res) => {
    try {
        const programs = await Program.find();
        res.status(200).json(programs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) return res.status(404).json({ error: "Program not found" });
        res.status(200).json(program);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!program) return res.status(404).json({ error: "Program not found" });
        res.status(200).json(program);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndDelete(req.params.id);
        if (!program) return res.status(404).json({ message: "Program not found" });
        res.status(200).json({ message: "Program and all related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};