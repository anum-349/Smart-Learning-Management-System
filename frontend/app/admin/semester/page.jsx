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

/* ---------- Dummy Batches (replace with API later) ---------- */
const batchesData = [
    { _id: "b1", name: "Batch 2021" },
    { _id: "b2", name: "Batch 2022" },
    { _id: "b3", name: "Batch 2023" },
];

/* ---------- Dummy Semesters ---------- */
const semestersData = [
    {
        _id: "s1",
        semesterNumber: 1,
        startDate: "2025-01-20",
        endDate: "2025-06-15",
        batchId: { _id: "b1", name: "Batch 2021" }
    },
    {
        _id: "s2",
        semesterNumber: 2,
        startDate: "2025-08-01",
        endDate: "2025-12-20",
        batchId: { _id: "b2", name: "Batch 2022" }
    },
];

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
    { id: 2, text: 'New lesson added: "Advanced React Hooks"', isRead: false, type: "course" },
    { id: 3, text: "Welcome to your new dashboard!", isRead: true, type: "general" },
    { id: 4, text: "Instructor John Doe posted a new announcement.", isRead: false, type: "announcement" },
];

export default function SemesterManagement() {
    const [semesters, setSemesters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEdit, setIsEdit] = useState(false);

    const [updateData, setUpdateData] = useState({
        _id: "",
        semesterNumber: "",
        startDate: "",
        endDate: "",
        batchId: ""
    });

    const [newSemester, setNewSemester] = useState({
        semesterNumber: "",
        startDate: "",
        endDate: "",
        batchId: ""
    });

    useEffect(() => {
        setSemesters(semestersData);
    }, []);

    const filteredSemesters = semesters.filter((s) =>
        `${s.semesterNumber}`.includes(searchTerm)
    );

    /* ---------- Add Semester ---------- */
    const handleAddSemester = (e) => {
        e.preventDefault();
        const selectedBatch = batchesData.find(b => b._id === newSemester.batchId);

        setSemesters([
            ...semesters,
            {
                ...newSemester,
                _id: Date.now().toString(),
                batchId: selectedBatch
            }
        ]);

        setNewSemester({ semesterNumber: "", startDate: "", endDate: "", batchId: "" });
    };

    /* ---------- Edit ---------- */
    const handleUpdateSemester = (s) => {
        setIsEdit(true);
        setUpdateData({
            _id: s._id,
            semesterNumber: s.semesterNumber,
            startDate: s.startDate,
            endDate: s.endDate,
            batchId: s.batchId._id
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        const updatedList = semesters.map((s) =>
            s._id === updateData._id
                ? {
                    ...updateData,
                    batchId: batchesData.find(b => b._id === updateData.batchId)
                }
                : s
        );

        setSemesters(updatedList);
        setIsEdit(false);
    };

    /* ---------- Delete ---------- */
    const handleDeleteSemester = (id) => {
        if (confirm("Are you sure?")) {
            setSemesters(semesters.filter((s) => s._id !== id));
        }
    };

    const formData = isEdit ? updateData : newSemester;

    const handleChange = (field, value) => {
        isEdit
            ? setUpdateData({ ...updateData, [field]: value })
            : setNewSemester({ ...newSemester, [field]: value });
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
                        <span>Semesters</span>
                    </div>

                    {/* ---------- FORM ---------- */}
                    <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
                        <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
                            {isEdit ? "Update Semester" : "Create New Semester"}
                        </h2>

                        <form
                            onSubmit={isEdit ? handleUpdateSubmit : handleAddSemester}
                            className="grid md:grid-cols-4 gap-4"
                        >
                            <Input
                                label="Semester Number"
                                type="number"
                                value={formData.semesterNumber}
                                placeholder="e.g. 1"
                                onChange={(v) => handleChange("semesterNumber", v)}
                            />

                            <Input
                                label="Start Date"
                                type="date"
                                value={formData.startDate}
                                onChange={(v) => handleChange("startDate", v)}
                            />

                            <Input
                                label="End Date"
                                type="date"
                                value={formData.endDate}
                                onChange={(v) => handleChange("endDate", v)}
                            />

                            <Select
                                label="Batch"
                                value={formData.batchId}
                                onChange={(v) => handleChange("batchId", v)}
                                options={batchesData.map(b => ({
                                    value: b._id,
                                    label: b.name
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
                                {isEdit ? "Save Changes" : "Add Semester"}
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

                    {/* ---------- TABLE ---------- */}
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold text-primary">Existing Semesters</h2>

                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                                    placeholder="Search semester..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
                            <table className="w-full text-sm">
                                <thead className="bg-primary text-white">
                                    <tr>
                                        <Th>Semester</Th>
                                        <Th>Duration</Th>
                                        <Th>Batch</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSemesters.map((s) => (
                                        <tr key={s._id} className="hover:bg-gray-100">

                                            <Td>
                                                <span className="font-semibold text-primary">
                                                    Semester {s.semesterNumber}
                                                </span>
                                            </Td>

                                            <Td>
                                                {s.startDate} → {s.endDate}
                                            </Td>

                                            <Td className="text-primary font-semibold">
                                                {s.batchId.name}
                                            </Td>

                                            <Td>
                                                <button
                                                    onClick={() => handleUpdateSemester(s)}
                                                    className="text-primary hover:text-secondary mr-3"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteSemester(s._id)}
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

                        {filteredSemesters.length === 0 && (
                            <p className="text-center text-gray-500 py-6">
                                No semesters found.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ---------- Reusable Components ---------- */
const Input = ({ label, value, onChange, placeholder, type }) => (
    <div className="flex flex-col">
        <label className="text-xs text-secondary mb-1">{label}</label>
        <input
            type={type}
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

const Th = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
        {children}
    </th>
);

const Td = ({ children }) => (
    <td className="px-6 py-4 whitespace-nowrap text-primary">{children}</td>
);
