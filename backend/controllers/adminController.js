
import Course from "../models/courseModel.js";
import Student from "../models/studentModel.js";
import Instructor from "../models/instructorModel.js";
import Faculty from "../models/facultyModel.js";
import Department from "../models/departmentModel.js";
import RegistrationRequest from "../models/registrationRequestModel.js";
import Admin from "../models/adminModel.js"

export const createAdmin = async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) return res.status(404).json({ error: "Admin not found" });
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const approveRegistrationRequest = async (req, res) => {
    try {
        const requestId = req.params.id;

        const request = await RegistrationRequest.findById(requestId);
        if (!request) return res.status(404).json({ error: "Request not found" });

        request.status = "Approved";
        await request.save();

        res.status(200).json({ message: "Registration Request Approved", data: request });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const generateReports = async (req, res) => {
    try {
        const report = {
            totalStudents: await Student.countDocuments(),
            totalInstructors: await Instructor.countDocuments(),
            totalCourses: await Course.countDocuments(),
            totalFacultys: await Faculty.countDocuments(),
            totalDepartments: await Department.countDocuments(),
            totalRequestsPending: await RegistrationRequest.countDocuments({ status: "Pending" }),
            generatedAt: new Date()
        };

        res.status(200).json({ message: "System Report", report });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
