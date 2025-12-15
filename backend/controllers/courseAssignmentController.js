import CourseAssignment from "../models/courseAssignmentModel.js";
import Instructor from "../models/instructorModel.js";
import Course from "../models/courseModel.js";
import Semester from "../models/semesterModel.js";

export const createCourseAssignment = async (req, res) => {
    try {
        const { instructorId, courseId, semesterId, preRequisite } = req.body;

        const instructor = await Instructor.findById(instructorId);
        if (!instructor) return res.status(404).json({ message: "Instructor not found" });

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        const semester = await Semester.findById(semesterId);
        if (!semester) return res.status(404).json({ message: "Semester not found" });

        if (preRequisite) {
            const preCourse = await Course.findById(preRequisite);
            if (!preCourse) return res.status(404).json({ message: "PreRequisite course not found" });
        }

        const courseAssignment = await CourseAssignment.create({
            instructorId, courseId, semesterId, preRequisite: preRequisite || null
        });

        res.status(201).json(courseAssignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllCourseAssignments = async (req, res) => {
    try {
        const courseAssignments = await CourseAssignment.find()
            .populate("instructorId", "firstName lastName email")
            .populate("courseId", "name code")
            .populate("semesterId", "name year")
            .populate("preRequisite", "name code");
        res.status(200).json(courseAssignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCourseAssignmentById = async (req, res) => {
    try {
        const courseAssignment = await CourseAssignment.findById(req.params.id)
            .populate("instructorId", "firstName lastName email")
            .populate("courseId", "name code")
            .populate("semesterId", "name year")
            .populate("preRequisite", "name code");
        if (!courseAssignment) return res.status(404).json({ message: "CourseAssignment not found" });
        res.status(200).json(courseAssignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateCourseAssignment = async (req, res) => {
    try {
        const { instructorId, courseId, semesterId, preRequisite } = req.body;

        if (instructorId) {
            const instructor = await Instructor.findById(instructorId);
            if (!instructor) return res.status(404).json({ message: "Instructor not found" });
        }

        if (courseId) {
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ message: "Course not found" });
        }

        if (semesterId) {
            const semester = await Semester.findById(semesterId);
            if (!semester) return res.status(404).json({ message: "Semester not found" });
        }

        if (preRequisite) {
            const preCourse = await Course.findById(preRequisite);
            if (!preCourse) return res.status(404).json({ message: "PreRequisite course not found" });
        }

        const courseAssignment = await CourseAssignment.findByIdAndUpdate(
            req.params.id,
            { instructorId, courseId, semesterId, preRequisite },
            { new: true }
        );

        if (!courseAssignment) return res.status(404).json({ message: "CourseAssignment not found" });
        res.status(200).json(courseAssignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteCourseAssignment = async (req, res) => {
    try {
        const courseAssignment = await CourseAssignment.findByIdAndDelete(req.params.id);
        if (!courseAssignment) return res.status(404).json({ message: "CourseAssignment not found" });
        res.status(200).json({ message: "CourseAssignment deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCourseAssignmentsByInstructor = async (req, res) => {
    try {
        const { instructorId } = req.params;
        const courseAssignments = await CourseAssignment.find({ instructorId })
            .populate("courseId", "name code")
            .populate("semesterId", "name year")
            .populate("preRequisite", "name code");
        res.status(200).json(courseAssignments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
