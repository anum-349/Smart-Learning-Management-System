"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit, PlusCircle, Trash2, GraduationCap } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
];

export default function AdminProgramManagement() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newProgram, setNewProgram] = useState({
        title: "",
        code: "",
        durationYears: "",
        departmentId: "",
    });

    const [updateData, setUpdateData] = useState({
        id: "",
        title: "",
        code: "",
        durationYears: "",
        departmentId: "",
    });

    const fetchPrograms = async () => {
        const progRes = await fetch(`${API_URL}/programs`);
        const progData = await progRes.json();
        setPrograms(progData);
    }
    // Fetch programs & departments on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setIsLoading(true);

            // Fetch programs
            fetchPrograms()

            // Fetch departments
            const deptRes = await fetch(`${API_URL}/departments`);
            const deptData = await deptRes.json();
            setDepartments(deptData);
        } catch (err) {
            console.error("Error fetching programs or departments:", err);
            alert("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPrograms = programs.filter((p) =>
        [p.title, p.code, p.departmentId?.title]
            .some((item) => (item ?? "").toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // ---------------- CREATE PROGRAM ----------------
    const handleAddProgram = async (e) => {
        e.preventDefault();
        if (!newProgram.title || !newProgram.code || !newProgram.departmentId) {
            alert("Please fill all fields.");
            return;
        }
        console.log(newProgram.departmentId)
        console.log(newProgram)

        try {
            const res = await fetch(`${API_URL}/programs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newProgram.title,
                    code: newProgram.code,
                    duration_years: newProgram.durationYears,
                    department_id: newProgram.departmentId,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create program");
            }

            const createdProgram = await res.json();
            // Map department info
            fetchPrograms()
            setNewProgram({ title: "", code: "", durationYears: "", departmentId: "" });
            alert("Program created successfully!");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // ---------------- UPDATE PROGRAM ----------------
    const handleUpdateProgram = (prog) => {
        setIsEdit(true);
        setUpdateData({
            id: prog.id,
            title: prog.title,
            code: prog.code,
            durationYears: prog.durationYears,
            departmentId: prog.departmentId
        });
    };

    useEffect(() => {
        departments.map((d) => ({ value: d.dept_id, label: d.title }))
    }, [])
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        if (!updateData.title || !updateData.code || !updateData.departmentId) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/programs/${updateData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: updateData.title,
                    code: updateData.code,
                    duration_years: updateData.durationYears,
                    department_id: updateData.departmentId,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to update program");
            }

            const updatedProgram = await res.json();
            const dept = departments.find((d) => d.id === updatedProgram.department_id);

            fetchPrograms()

            setIsEdit(false);
            alert("Program updated successfully!");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // ---------------- DELETE PROGRAM ----------------
    const handleDeleteProgram = async (id) => {
        if (!confirm("Are you sure you want to delete this program?")) return;

        try {
            const res = await fetch(`${API_URL}/programs/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to delete program");
            }

            fetchPrograms()
            alert("Program deleted successfully!");
        } catch (err) {
            console.error(err);
            alert(err.message);
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
            <NavBar userType={"Admin"} />
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
                                onChange={(v) => { handleChange("departmentId", v); }}
                                options={[
                                    { value: "", label: "-- Select Department --" },
                                    ...departments.map((d) => ({ value: d.dept_id, label: d.title })),
                                ]}
                            />

                            <button
                                type="submit"
                                className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white transition
                  ${isEdit ? "bg-primary hover:bg-secondary" : "bg-accentDark hover:bg-accent"}`}
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
                                    {filteredPrograms.map((prog) => (
                                        <tr key={prog.id} className="hover:bg-gray-100">
                                            <Td>
                                                <div className="font-semibold text-primary">{prog.title}</div>
                                                <div className="text-xs text-accentDark font-mono">({prog.code})</div>
                                            </Td>

                                            <Td>{prog.durationYears}</Td>

                                            <Td className="text-center text-primary font-semibold">
                                                {prog.departmentId?.title}
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
                                                    onClick={() => handleDeleteProgram(prog.id)}
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
                            <p className="text-center text-gray-500 py-6">No Programs found.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
