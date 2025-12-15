import DocumentResource from "../models/documentResourceModel.js";
import Instructor from "../models/instructorModel.js";
import Course from "../models/courseModel.js";

export const createResource = async (req, res) => {
    try {
        const { title, fileUrl, uploadedById, assosiateWithId } = req.body;

        const instructor = await Instructor.findById(uploadedById);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const course = await Course.findById(assosiateWithId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const resource = await DocumentResource.create({ title, fileUrl, uploadedById, assosiateWithId });
        res.status(201).json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllResources = async (req, res) => {
    try {
        const resources = await DocumentResource.find()
            .populate("uploadedById", "firstName lastName email")
            .populate("assosiateWithId", "title code");
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getResourceById = async (req, res) => {
    try {
        const resource = await DocumentResource.findById(req.params.id)
            .populate("uploadedById", "firstName lastName email")
            .populate("assosiateWithId", "title code");
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateResource = async (req, res) => {
    try {
        if (req.body.uploadedById) {
            const instructor = await Instructor.findById(req.body.uploadedById);
            if (!instructor) return res.status(404).json({ message: "Instructor not found" });
        }

        if (req.body.assosiateWithId) {
            const course = await Course.findById(req.body.assosiateWithId);
            if (!course) return res.status(404).json({ message: "Course not found" });
        }

        const resource = await DocumentResource.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const resource = await DocumentResource.findByIdAndDelete(req.params.id);
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getResourcesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const resources = await DocumentResource.find({ assosiateWithId: courseId })
            .populate("uploadedById", "firstName lastName email")
            .populate("assosiateWithId", "title code");
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getResourcesByInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const resources = await DocumentResource.find({ uploadedById: instructorId })
            .populate("uploadedById", "firstName lastName email")
            .populate("assosiateWithId", "title code");
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
