import Instructor from "../models/instructor.js";

export const createInstructor = async (req, res) => {
    try {
        const {
            name, email, password,
            rank,
            officeTimingId,
            employmentTypeId,
            status,
            facultyId,
            reason,
            researchSpeciality,
            qualifications
        } = req.body;

        const newInstructor = await Instructor.create({
            name,
            email,
            password,
            role: "Instructor", 
            rank,
            officeTimingId,
            employmentTypeId,
            status,
            facultyId,
            reason,
            researchSpeciality,
            qualifications
        });

        res.status(201).json({
            success: true,
            message: "Instructor created successfully",
            data: newInstructor
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find()
            .populate("facultyId", "name")
            .populate("qualifications");

        res.status(200).json({ success: true, data: instructors });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getInstructorById = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id)
            .populate("facultyId", "name")
            .populate("qualifications");

        if (!instructor)
            return res.status(404).json({ error: "Instructor not found" });

        res.status(200).json({ success: true, data: instructor });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const updateInstructor = async (req, res) => {
    try {
        const updated = await Instructor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
            .populate("qualifications")
            .populate("facultyId", "name");

        if (!updated)
            return res.status(404).json({ error: "Instructor not found" });

        res.status(200).json({
            success: true,
            message: "Instructor updated successfully",
            data: updated
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const deleteInstructor = async (req, res) => {
    try {
        const deleted = await Instructor.findOneAndDelete({ _id: req.params.id });

        if (!deleted)
            return res.status(404).json({ error: "Instructor not found" });

        res.status(200).json({
            success: true,
            message: "Instructor and related data deleted successfully"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const getInstructorsByFaculty = async (req, res) => {
    try {
        const instructors = await Instructor.find({
            facultyId: req.params.deptId
        });

        res.status(200).json({ success: true, data: instructors });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const addQualification = async (req, res) => {
    try {
        const { qualificationId } = req.body;

        const updated = await Instructor.findByIdAndUpdate(
            req.params.id,
            { $push: { qualifications: qualificationId } },
            { new: true }
        );

        res.status(200).json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
