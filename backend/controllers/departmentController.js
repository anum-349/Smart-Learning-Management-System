import Department from "../models/department.js";

// CREATE Department
export const createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);
        res.status(201).json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL Departments
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.status(200).json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET Department by ID
export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) return res.status(404).json({ error: "Department not found" });
        res.status(200).json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE Department
export const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!department) return res.status(404).json({ error: "Department not found" });
        res.status(200).json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) return res.status(404).json({ message: "Department not found" });
        res.status(200).json({ message: "Department and all related data deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};