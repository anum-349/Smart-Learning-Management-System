"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Edit,
    PlusCircle,
    Trash2,
    Building2,
    GraduationCap,
    LayoutDashboard,
    Users,
    BookOpen,
    Settings
} from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
    { id: 2, text: 'New lesson added: "Advanced React Hooks"', isRead: false, type: "course" },
    { id: 3, text: "Welcome to your new dashboard!", isRead: true, type: "general" },
    { id: 4, text: "Instructor John Doe posted a new announcement.", isRead: false, type: "announcement" },
];

const faculties = [
    { _id: "2222", title: "Comp", code: "FOC" },
    { _id: "2223", title: "Applied Science", code: "FOAS" },
    { _id: "2224", title: "Arts", code: "FOA" }
];

const departmentsData = [
    {
        _id: "1",
        title: "Computing",
        code: "FOC-562",
        facultyId: { _id: "2222", title: "Comp", code: "FOC" },
        headOfDept: { _id: "234567890", firstName: "Ali", lastName: "Akbar" }
    },
    {
        _id: "2",
        title: "Software Engineering",
        code: "FOC-961",
        facultyId: { _id: "2222", title: "Comp", code: "FOC" },
        headOfDept: { _id: "234567891", firstName: "Wajdan", lastName: "Akbar" }
    }
];

const instructorsData = [
    { _id: "234567890", firstName: "AliAN", lastName: "Akbar" },
    { _id: "234567891", firstName: "Ali", lastName: "Akbar" },
    { _id: "234567892", firstName: "Wajdan", lastName: "Akbar" }
];

export default function AdminDepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [instructors, setInstructors] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    const [updateData, setUpdateData] = useState({
        _id: "",
        title: "",
        code: "",
        facultyId: "",
        headOfDept: ""
    });

    const [newDepartment, setNewDepartment] = useState({
        title: "",
        code: "",
        facultyId: "",
        headOfDept: ""
    });

    useEffect(() => {
        setDepartments(departmentsData);
        setInstructors(instructorsData);
    }, []);

    const filteredDepartments = departments.filter(
        (d) =>
            d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${d.headOfDept.firstName} ${d.headOfDept.lastName}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const handleAddDepartment = (e) => {
        e.preventDefault();
        const selectedHOD = instructors.find(i => i._id === newDepartment.headOfDept);

        setDepartments([
            ...departments,
            {
                ...newDepartment,
                headOfDept: selectedHOD,
                facultyId: faculties.find(f => f._id === newDepartment.facultyId),
                _id: Date.now().toString()
            }
        ]);

        setNewDepartment({ title: "", code: "", facultyId: "", headOfDept: "" });
    };

    const handleUpdateDepartment = (dept) => {
        setIsEdit(true);
        setUpdateData({
            _id: dept._id,
            title: dept.title,
            code: dept.code,
            facultyId: dept.facultyId._id,
            headOfDept: dept.headOfDept._id
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        const updatedList = departments.map((d) =>
            d._id === updateData._id
                ? {
                    ...d,
                    title: updateData.title,
                    code: updateData.code,
                    facultyId: faculties.find(f => f._id === updateData.facultyId),
                    headOfDept: instructors.find(i => i._id === updateData.headOfDept)
                }
                : d
        );

        setDepartments(updatedList);
        setIsEdit(false);
    };

    const handleDeleteDepartment = (id) => {
        if (confirm("Are you sure? This action cannot be undone.")) {
            setDepartments(departments.filter((d) => d._id !== id));
        }
    };

    const formData = isEdit ? updateData : newDepartment;
    const handleChange = (field, value) => {
        isEdit
            ? setUpdateData({ ...updateData, [field]: value })
            : setNewDepartment({ ...newDepartment, [field]: value });
    };

    return (
        <div className="flex bg-light min-h-screen text-primary">

            {/* ---------- SIDEBAR ---------- */}
            <NavBar />

            {/* ---------- MAIN CONTENT ---------- */}
            <main className="flex-1 ml-64">
                <Header user="Admin" notification={initialNotifications} />

                <div className="container mx-auto p-6 pt-10">

                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
                        <span>/</span>
                        <span>Departments</span>
                    </div>

                    {/* FORM CARD */}
                    <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
                        <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
                            {isEdit ? "Update Department" : "Create New Department"}
                        </h2>

                        <form
                            onSubmit={isEdit ? handleUpdateSubmit : handleAddDepartment}
                            className="grid md:grid-cols-4 gap-4"
                        >
                            <Input
                                label="Department Name"
                                value={formData.title}
                                placeholder="e.g. Computing"
                                onChange={(v) => handleChange("title", v)}
                            />
                            <Input
                                label="Code"
                                value={formData.code}
                                placeholder="FOC-123"
                                onChange={(v) => handleChange("code", v)}
                            />

                            <Select
                                label="Faculty"
                                value={formData.facultyId}
                                onChange={(v) => handleChange("facultyId", v)}
                                options={faculties.map(f => ({
                                    value: f._id,
                                    label: `${f.code} — ${f.title}`
                                }))}
                            />

                            <Select
                                label="Head of Department"
                                value={formData.headOfDept}
                                onChange={(v) => handleChange("headOfDept", v)}
                                options={instructors.map(i => ({
                                    value: i._id,
                                    label: `${i.firstName} ${i.lastName}`
                                }))}
                            />

                            <button
                                type="submit"
                                className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white transition
                                    ${isEdit
                                        ? "bg-primary hover:bg-secondary/40"
                                        : "bg-accentDark hover:bg-accent"
                                    }`}
                            >
                                {isEdit ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                                {isEdit ? "Save Changes" : "Add Department"}
                            </button>

                            {isEdit && (
                                <button
                                    type="button"
                                    onClick={() => setIsEdit(false)}
                                    className="col-span-4 mt-2 py-2 rounded-xl bg-gray-400 hover:bg-gray-500 text-white"
                                >
                                    Cancel Update
                                </button>
                            )}
                        </form>
                    </div>

                    {/* TABLE SECTION */}
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold text-primary">Existing Departments</h2>

                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
                            <table className="w-full text-sm">
                                <thead className="bg-primary text-white">
                                    <tr>
                                        <Th>Department</Th>
                                        <Th>HOD</Th>
                                        <Th className="text-center">Faculty</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredDepartments.map((dept, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <Td>
                                                <div className="font-semibold text-primary">{dept.title}</div>
                                                <div className="text-xs text-accentDark font-mono">
                                                    ({dept.code})
                                                </div>
                                            </Td>

                                            <Td>
                                                {dept.headOfDept.firstName}{" "}
                                                {dept.headOfDept.lastName}
                                            </Td>

                                            <Td className="text-center text-primary font-semibold">
                                                {dept.facultyId.title}
                                                <GraduationCap className="inline ml-1" size={14} />
                                            </Td>

                                            <Td>
                                                <button
                                                    onClick={() => handleUpdateDepartment(dept)}
                                                    className="text-primary hover:text-secondary mr-3"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteDepartment(dept._id)}
                                                    className="text-accentDark hover:text-accent"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredDepartments.length === 0 && (
                            <p className="text-center text-gray-500 py-6">
                                No departments found.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

const Input = ({ label, value, onChange, placeholder }) => (
    <div className="flex flex-col">
        <label className="text-xs text-secondary mb-1">{label}</label>
        <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-accentDark"
        />
    </div>
);

const Select = ({ label, value, onChange, options }) => (
    <div className="flex flex-col">
        <label className="text-xs text-secondary mb-1">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-3 py-2 cursor-pointer focus:ring-accentDark"
        >
            <option value="">Select...</option>
            {options.map((op, idx) => (
                <option key={idx} value={op.value}>
                    {op.label}
                </option>
            ))}
        </select>
    </div>
);

const Th = ({ children, className }) => (
    <th className={`px-6 py-3 text-left text-xs uppercase tracking-wider ${className}`}>
        {children}
    </th>
);

const Td = ({ children, className }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-primary text-left ${className}`}>
        {children}
    </td>
);