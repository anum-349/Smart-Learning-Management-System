import Course from "../models/courseModel.js";
import CourseContent from "../models/courseContentModel.js";

export const createContent = async (req, res) => {
    try {
        const { courseId } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const content = await CourseContent.create(req.body);
        res.status(201).json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllContent = async (req, res) => {
    try {
        const contents = await CourseContent.find()
            .populate("courseId", "name code");
        res.status(200).json(contents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getContentById = async (req, res) => {
    try {
        const content = await CourseContent.findById(req.params.id)
            .populate("courseId", "name code");
        if (!content) return res.status(404).json({ message: "Content not found" });
        res.status(200).json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateContent = async (req, res) => {
    try {
        if (req.body.courseId) {
            const course = await Course.findById(req.body.courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });
        }

        const content = await CourseContent.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!content) return res.status(404).json({ message: "Content not found" });
        res.status(200).json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteContent = async (req, res) => {
    try {
        const content = await CourseContent.findByIdAndDelete(req.params.id);
        if (!content) return res.status(404).json({ message: "Content not found" });
        res.status(200).json({ message: "Content deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getContentByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const contents = await CourseContent.find({ courseId })
            .populate("courseId", "name code");
        res.status(200).json(contents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
