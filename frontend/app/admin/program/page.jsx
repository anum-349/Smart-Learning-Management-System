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

const departmentsData = [
    { _id: "234567891", title: "Computing", code: "FOC-562" },
    { _id: "234567892", title: "Engineering", code: "FENG-123" },
];

const programsData = [
    {
        _id: "234567890",
        title: "BS CS",
        code: "FOC-562",
        durationYears: 4,
        departmentId: { _id: "234567891", title: "Computing", code: "FOC-562" },
    },
    {
        _id: "234567891",
        title: "BS SE",
        code: "FOC-563",
        durationYears: 4,
        departmentId: { _id: "234567891", title: "Computing", code: "FOC-562" },
    },
];

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
];
export default function AdminProgramManagement() {
    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [isEdit, setIsEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newProgram, setNewProgram] = useState({
        title: "",
        code: "",
        durationYears: "",
        departmentId: {
            _id: '',
            title: ''
        },
    });

    const [updateData, setUpdateData] = useState({
        _id: "",
        title: "",
        code: "",
        durationYears: "",
        departmentId: "",
    });

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setPrograms(programsData);
            setDepartments(departmentsData);
            setIsLoading(false);
        }, 500);
    }, []);

    const filteredPrograms = programs.filter((p) =>
        [p.title, p.code].some((item) =>
            (item ?? "").toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleAddProgram = (e) => {
        e.preventDefault();

        if (!newProgram.title || !newProgram.code || !newProgram.departmentId) {
            alert("Please fill all fields.");
            return;
        }

        const dept = departments.find((d) => d._id === newProgram.departmentId);

        const newEntry = {
            ...newProgram,
            _id: Date.now().toString(),
            departmentId: dept,
        };

        setPrograms((prev) => [...prev, newEntry]);

        setNewProgram({
            title: "",
            code: "",
            durationYears: "",
            departmentId: "",
        });
    };

    const handleUpdateProgram = (prog) => {
        setIsEdit(true);
        setUpdateData({
            _id: prog._id,
            title: prog.title,
            code: prog.code,
            durationYears: prog.durationYears,
            departmentId: prog.departmentId?._id || "",
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();


        const dept = departments.find((d) => d._id === updateData.departmentId);
        if (!dept) return alert("Invalid department selected!");

        setPrograms((prev) =>
            prev.map((p) =>
                p._id === updateData._id
                    ? {
                        ...p,
                        title: updateData.title,
                        code: updateData.code,
                        durationYears: updateData.durationYears,
                        departmentId: dept,
                    }
                    : p
            )
        );

        setIsEdit(false);
    };

    const handleDeleteProgram = (id) => {
        if (confirm("Are you sure you want to delete this program?")) {
            setPrograms((prev) => prev.filter((p) => p._id !== id));
        }
    };

    const formData = isEdit ? updateData : newProgram;
    const handleChange = (field, value) => {
        isEdit
            ? setUpdateData({ ...updateData, [field]: value })
            : setNewProgram({ ...newProgram, [field]: value });
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
                        <span>Programs</span>
                    </div>

                    {/* FORM CARD */}
                    <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
                        <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
                            {isEdit ? "Update Program" : "Create New Program"}
                        </h2>

                        <form
                            onSubmit={isEdit ? handleUpdateSubmit : handleAddProgram}
                            className="grid md:grid-cols-3 gap-4"
                        >
                            <Input
                                label="Program Name"
                                value={formData.title}
                                placeholder="e.g. BSSE"
                                onChange={(v) => handleChange("title", v)}
                            />
                            <Input
                                label="Code"
                                value={formData.code}
                                placeholder="BSSE-123"
                                onChange={(v) => handleChange("code", v)}
                            />

                            <Input
                                label="Duration"
                                value={formData.durationYears}
                                placeholder="4"
                                onChange={(v) => handleChange("durationYears", v)}
                            />

                            <Select
                                label="Department"
                                value={formData.departmentId}
                                onChange={(v) => handleChange("departmentId", v)}
                                options={departments.map(i => ({
                                    value: i._id,
                                    label: i.title
                                }))}
                            />

                            <button
                                type="submit"
                                className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white transition
                                    ${isEdit
                                        ? "bg-primary hover:bg-secondary"
                                        : "bg-accentDark hover:bg-accent"
                                    }`}
                            >
                                {isEdit ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                                {isEdit ? "Save Changes" : "Add Program"}
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
                            <h2 className="text-lg font-bold text-primary">Existing Programs</h2>

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
                                        <Th>Program</Th>
                                        <Th>Duration</Th>
                                        <Th className="text-center">Department</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPrograms.map((prog, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <Td>
                                                <div className="font-semibold text-primary">{prog.title}</div>
                                                <div className="text-xs text-accentDark font-mono">
                                                    ({prog.code})
                                                </div>
                                            </Td>

                                            <Td>
                                                {prog.durationYears}
                                            </Td>

                                            <Td className="text-center text-primary font-semibold">
                                                {prog.departmentId.title}
                                                <GraduationCap className="inline ml-1" size={14} />
                                            </Td>

                                            <Td>
                                                <button
                                                    onClick={() => handleUpdateProgram(prog)}
                                                    className="text-primary hover:text-secondary mr-3"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteProgram(prog._id)}
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

                        {filteredPrograms.length === 0 && (
                            <p className="text-center text-gray-500 py-6">
                                No Programs found.
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
