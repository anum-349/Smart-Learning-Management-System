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

const facultysData = [{
    _id: '234567890',
    title: "Computing",
    code: "FOC-562",
    departmentCount: 50,
    dean: {
        _id: '234567890',
        firstName: "Ali",
        lastName: "Akbar"
    }
}, {
    _id: '234567891',
    title: "Computing",
    code: "FOC-562",
    departmentCount: 50,
    dean: {
        _id: '234567891',
        firstName: "Ali",
        lastName: "Akbar"
    }
}];

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
    { id: 2, text: 'New lesson added: "Advanced React Hooks"', isRead: false, type: "course" },
    { id: 3, text: "Welcome to your new dashboard!", isRead: true, type: "general" },
    { id: 4, text: "Instructor John Doe posted a new announcement.", isRead: false, type: "announcement" },
];

const instructorsData = [
    {
        _id: '234567890',
        firstName: "AliAN",
        lastName: "Akbar"
    }, {
        _id: '234567891',
        firstName: "Ali",
        lastName: "Akbar"
    }, {
        _id: '234567892',
        firstName: "Wajdan",
        lastName: "Akbar"
    },
]
export default function AdminFacultyManagement() {
    const [facultys, setFacultys] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [instructors, setInstructors] = useState([])
    const [isEdit, setIsEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [updateData, setUpdateData] = useState({
        _id: '',
        title: '',
        code: '',
        dean: ''
    });

    const [newFaculty, setNewFaculty] = useState({
        title: '',
        code: '',
        dean: {
            _id: '',
            firstName: '',
            lastName: '',
            email: ''
        }
    });

    useEffect(() => {
        fetchAllData();
    }, [])

    const fetchAllData = async () => {
        setIsLoading(true);
        setInstructors(instructorsData)
        setFacultys(facultysData)
        setIsLoading(false);
    };

    const filteredFacultys = facultys.filter(d =>
        (d.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (d.code?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    const handleAddFaculty = (e) => {
        e.preventDefault();

        if (!newFaculty.title || !newFaculty.code || !newFaculty.dean) {
            alert("Please fill all fields.");
            return;
        }

        const selectedDean = instructors.find(i => i._id === newFaculty.dean);

        setFacultys(prev => [
            ...prev,
            {
                ...newFaculty,
                dean: selectedDean,
                departmentCount: 0, // default
                _id: Date.now().toString()
            }
        ]);

        setNewFaculty({
            title: '',
            code: '',
            dean: ''
        });
    };

    const handleUpdateFaculty = (facl) => {
        setIsEdit(true);
        setUpdateData({
            _id: facl._id,
            title: facl.title,
            code: facl.code,
            dean: facl.dean?._id || ""
        });
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        const updatedList = facultys.map((d) =>
            d._id === updateData._id
                ? {
                    ...d,
                    title: updateData.title,
                    code: updateData.code,
                    dean: instructors.find(i => i._id === updateData.dean)
                }
                : d
        );

        setFacultys(updatedList)
        setIsEdit(false);
    };

    const handleDeleteFaculty = async (id) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;

        setFacultys(prev => prev.filter(d => d._id !== id));
        alert("Faculty deleted successfully!");
    };

    const usedHeadIds = facultys
        .map(d => d.dean?._id)
        .filter((id) => !id);

    const availableDeans = instructors.filter(instr =>
        instr._id === updateData.dean ||
        !usedHeadIds.includes(instr._id)
    );

    const formData = isEdit ? updateData : newFaculty;
    const handleChange = (field, value) => {
        isEdit
            ? setUpdateData({ ...updateData, [field]: value })
            : setNewFaculty({ ...newFaculty, [field]: value });
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
                        <span>Facultys</span>
                    </div>

                    {/* FORM CARD */}
                    <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
                        <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
                            {isEdit ? "Update Faculty" : "Create New Faculty"}
                        </h2>

                        <form
                            onSubmit={isEdit ? handleUpdateSubmit : handleAddFaculty}
                            className="grid md:grid-cols-3 gap-4"
                        >
                            <Input
                                label="Faculty Name"
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
                                label="Dean"
                                value={formData.dean}
                                onChange={(v) => handleChange("dean", v)}
                                options={availableDeans.map(i => ({
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
                                {isEdit ? "Save Changes" : "Add Faculty"}
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
                            <h2 className="text-lg font-bold text-primary">Existing Facultys</h2>

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
                                        <Th>Faculty</Th>
                                        <Th>Dean</Th>
                                        <Th className="text-center">Departments</Th>
                                        <Th>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredFacultys.map((facl, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <Td>
                                                <div className="font-semibold text-primary">{facl.title}</div>
                                                <div className="text-xs text-accentDark font-mono">
                                                    ({facl.code})
                                                </div>
                                            </Td>

                                            <Td>
                                                {facl.dean.firstName}{" "}
                                                {facl.dean.lastName}
                                            </Td>

                                            <Td className="text-center text-primary font-semibold">
                                                {facl.departmentCount}
                                                <GraduationCap className="inline ml-1" size={14} />
                                            </Td>

                                            <Td>
                                                <button
                                                    onClick={() => handleUpdateFaculty(facl)}
                                                    className="text-primary hover:text-secondary mr-3"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteFaculty(facl._id)}
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

                        {filteredFacultys.length === 0 && (
                            <p className="text-center text-gray-500 py-6">
                                No Facultys found.
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
