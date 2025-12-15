import Batch from "../models/batch.js";

export const createBatch = async (req, res) => {
    try {
        const batch = await Batch.create(req.body);
        res.status(201).json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find();
        res.status(200).json(batches);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) return res.status(404).json({ error: "Batch not found" });
        res.status(200).json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!batch) return res.status(404).json({ error: "Batch not found" });
        res.status(200).json(batch);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        if (!batch) return res.status(404).json({ message: "Batch not found" });
        res.status(200).json({ message: "Batch and all related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};