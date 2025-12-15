import Qualification from "../models/qualificationModel.js";

export const createQualification = async (req, res) => {
    try {
        const qualification = await Qualification.create(req.body);
        return res.status(201).json({ success: true, data: qualification });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
export const getAllQualifications = async (req, res) => {
    try {
        const qualifications = await Qualification.find().populate("userId");
        return res.status(200).json({ success: true, data: qualifications });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
export const getQualificationById = async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id).populate("userId");

        if (!qualification) {
            return res.status(404).json({ success: false, message: "Qualification not found" });
        }

        return res.status(200).json({ success: true, data: qualification });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
export const updateQualification = async (req, res) => {
    try {
        const updated = await Qualification.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Qualification not found" });
        }

        return res.status(200).json({ success: true, data: updated });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
export const deleteQualification = async (req, res) => {
    try {
        const deleted = await Qualification.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Qualification not found" });
        }

        return res.status(200).json({ success: true, message: "Qualification deleted successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
export const addCertificate = async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id);

        if (!qualification) {
            return res.status(404).json({ success: false, message: "Qualification not found" });
        }

        qualification.certificates.push(req.body);
        await qualification.save();

        return res.status(200).json({ success: true, data: qualification });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
export const removeCertificate = async (req, res) => {
    try {
        const qualification = await Qualification.findById(req.params.id);

        if (!qualification) {
            return res.status(404).json({ success: false, message: "Qualification not found" });
        }

        qualification.certificates.id(req.params.certificateId).deleteOne();
        await qualification.save();

        return res.status(200).json({ success: true, data: qualification });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
