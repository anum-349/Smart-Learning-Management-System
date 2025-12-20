import Course from "../models/courseModel.js";
import Department from "../models/facultyModel.js";

export const createCourse = async (req, res) => {
    try {
        const { title, code, creditHours, departmentId } = req.body;

        const department = await Department.findById(departmentId);
        if (!department) return res.status(404).json({ message: "Department not found" });

        const course = await Course.create({ title, code, creditHours, departmentId });
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate("departmentId", "name");
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate("departmentId", "name");
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateCourse = async (req, res) => {
    try {
        if (req.body.departmentId) {
            const department = await Department.findById(req.body.departmentId);
            if (!department) return res.status(404).json({ message: "Department not found" });
        }

        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.status(200).json({ message: "Course and all related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCourseAssignmentsIds = async (courseId) => {
    const CourseAssignment = (await import("../models/courseAssignmentModel.js")).default;
    const assignments = await CourseAssignment.find({ courseId }).select("_id");
    return assignments.map(a => a._id);
};

export const getCoursesByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const courses = await Course.find({ departmentId });
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
