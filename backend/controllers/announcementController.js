import Announcement from "../models/announcementModel.js";

export const createData = async (req, res) => {
    try {
        const data = await Announcement.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllData = async (req, res) => {
    try {
        const data = await Announcement.find()
            .populate("courseAssignmentId", "title description");
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getDataById = async (req, res) => {
    try {
        const data = await Announcement.findById(req.params.id)
            .populate("courseAssignmentId", "title description");
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateData = async (req, res) => {
    try {
        const data = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteData = async (req, res) => {
    try {
        const data = await Announcement.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ error: "Not Found" });
        res.status(200).json({ message: "Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAnnouncementsByCourseAssignment = async (req, res) => {
    try {
        const { courseAssignmentId } = req.params;
        const announcements = await Announcement.find({ courseAssignmentId })
            .populate("courseAssignmentId", "title description"); 
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getAnnouncementsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const announcements = await Announcement.find()
            .populate({
                path: "courseAssignmentId",
                match: { courseId },
                select: "courseId teacherId sectionId"
            });

        const filtered = announcements.filter(a => a.courseAssignmentId !== null);

        res.status(200).json(filtered);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};