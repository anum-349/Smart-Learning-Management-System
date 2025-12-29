"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Save, RefreshCw, PlusCircle } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Td from "../../../components/Td";
import Th from "../../../components/Th";

export default function AdminSemesterCourseAssignment() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [departments, setDepartments] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [batches, setBatches] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [currentAssignments, setCurrentAssignments] = useState([]);

    const [selectedDeptId, setSelectedDeptId] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [selectedBatchId, setSelectedBatchId] = useState("");
    const [selectedSemesterId, setSelectedSemesterId] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    const [activeTab, setActiveTab] = useState("assign"); // assign | view
    const [allAssignments, setAllAssignments] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [editingAssignmentId, setEditingAssignmentId] = useState(null);

    // --- Fetch Departments ---
    useEffect(() => {
        fetch(`${API_URL}/departments`)
            .then(res => res.json())
            .then(setDepartments)
            .catch(console.error);
    }, [API_URL]);

    // --- Fetch Programs ---
    useEffect(() => {
        if (!selectedDeptId) return setPrograms([]);
        fetch(`${API_URL}/programs?departmentId=${selectedDeptId}`)
            .then(res => res.json())
            .then(setPrograms)
            .catch(console.error);
    }, [selectedDeptId, API_URL]);

    // --- Fetch Batches ---
    useEffect(() => {
        if (!selectedProgramId) return setBatches([]);
        fetch(`${API_URL}/batches?programId=${selectedProgramId}`)
            .then(res => res.json())
            .then(setBatches)
            .catch(console.error);
    }, [selectedProgramId, API_URL]);

    // --- Fetch Semesters ---
    useEffect(() => {
        if (!selectedBatchId) return setSemesters([]);
        fetch(`${API_URL}/semesters?batchId=${selectedBatchId}`)
            .then(res => res.json())
            .then(setSemesters)
            .catch(console.error);
    }, [selectedBatchId, API_URL]);

    // --- Fetch Courses for selected Semester ---
    useEffect(() => {
        if (!selectedSemesterId) return setCourses([]);

        fetch(`${API_URL}/courses?semesterId=${selectedSemesterId}`)
            .then(res => res.json())
            .then(setCourses)
            .catch(console.error);
    }, [selectedSemesterId]);

    // --- Fetch Existing Assignment for selected fields ---
    useEffect(() => {
        if (!selectedProgramId || !selectedSemesterId) return setCurrentAssignments([]);
        fetch(`${API_URL}/semester-course-assignments/${selectedProgramId}/${selectedSemesterId}`)
            .then(res => res.json())
            .then(data => setCurrentAssignments(data.assigned_course_ids || []))
            .catch(() => setCurrentAssignments([]));
    }, [selectedProgramId, selectedSemesterId, API_URL]);

    // --- Fetch all assignments for "View" tab ---
    useEffect(() => {
        if (activeTab === "view") {
            fetch(`${API_URL}/semester-course-assignments`)
                .then(res => res.json())
                .then(setAllAssignments)
                .catch(console.error);
        }
    }, [activeTab, API_URL]);

    // --- Toggle course ---
    const handleCourseToggle = (courseId) => {
        setCurrentAssignments(prev =>
            prev.includes(courseId)
                ? prev.filter(id => id !== courseId)
                : [...prev, courseId]
        );
    };

    const resetForm = () => {
        setIsEdit(false);
        setEditingAssignmentId(null);

        setSelectedDeptId("");
        setSelectedProgramId("");
        setSelectedBatchId("");
        setSelectedSemesterId("");

        setCurrentAssignments([]);
    };

    const handleDeleteAssignment = async (id) => {
        if (!confirm("Are you sure you want to delete this assignment?")) return;

        try {
            await fetch(`${API_URL}/semester-course-assignments/${id}`, {
                method: "DELETE",
            });

            setAllAssignments(prev => prev.filter(a => a.id !== id));

            setStatusMessage({
                type: "success",
                message: "Assignment deleted successfully!"
            });
        } catch (err) {
            console.error(err);
            setStatusMessage({
                type: "error",
                message: "Delete failed."
            });
        }
    };

    const handleSaveAssignment = async () => {
        if (!selectedProgramId || !selectedBatchId || !selectedSemesterId) {
            setStatusMessage({ type: "error", message: "Fill all fields first." });
            return;
        }

        setIsSaving(true);
        setStatusMessage(null);

        const payload = {
            program_id: selectedProgramId,
            batch_id: selectedBatchId,
            semester_id: selectedSemesterId,
            assigned_course_ids: currentAssignments,
        };

        try {
            const res = await fetch(
                isEdit
                    ? `${API_URL}/semester-course-assignments/${editingAssignmentId}`
                    : `${API_URL}/semester-course-assignments`,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            await res.json();

            setStatusMessage({
                type: "success",
                message: isEdit ? "Assignment updated successfully!" : "Assignment created successfully!"
            });

            resetForm(); // 👈 VERY IMPORTANT
            setActiveTab("view");

        } catch (err) {
            console.error(err);
            setStatusMessage({ type: "error", message: "Operation failed." });
        } finally {
            setIsSaving(false);
        }
    };
    const handleEditAssignment = (assignment) => {
        setIsEdit(true);
        setEditingAssignmentId(assignment.id);

        setSelectedDeptId(assignment.department_id);
        setSelectedProgramId(assignment.program_id);
        setSelectedBatchId(assignment.batch_id);
        setSelectedSemesterId(assignment.semester_id);

        // assignment.courses IS AN ARRAY OF IDS (not objects)
        setCurrentAssignments(assignment.courses);

        // 🔥 SWITCH TAB
        setActiveTab("assign");
    };

    // --- Reset form for new assignment ---
    const handleNewAssignment = () => {
        setSelectedDeptId("");
        setSelectedProgramId("");
        setSelectedBatchId("");
        setSelectedSemesterId("");
        setCurrentAssignments([]);
        setStatusMessage(null);
        setActiveTab("assign");
    };

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType="Admin" />
            <main className="flex-1 ml-64">
                <Header user="Admin" notification={[]} />

                <div className="container mx-auto p-6 pt-10">
                    {/* Breadcrumb */}
                    <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
                        <span>/</span>
                        <span>Semester Course Assignment</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("assign")}
                            className={`px-4 py-2 font-semibold ${activeTab === "assign" ? "border-b-2 border-accent text-accent" : "text-gray-500"}`}
                        >
                            Assign Courses
                        </button>
                        <button
                            onClick={() => setActiveTab("view")}
                            className={`px-4 py-2 font-semibold ${activeTab === "view" ? "border-b-2 border-accent text-accent" : "text-gray-500"}`}
                        >
                            View Assignments
                        </button>
                        <button onClick={handleNewAssignment} className="ml-auto flex items-center gap-1 px-4 py-2 bg-accentDark text-white rounded-xl hover:bg-accent">
                            <PlusCircle className="w-4 h-4" /> New Assignment
                        </button>
                    </div>

                    {activeTab === "assign" && (
                        <>
                            {/* Filters */}
                            <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-6">
                                <h2 className="text-xl font-bold mb-4">Select Program, Batch & Semester</h2>
                                <div className="grid md:grid-cols-4 gap-4">
                                    <select value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)} className="p-3 rounded-xl border border-gray-300">
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d.dept_id} value={d.dept_id}>{d.title}</option>)}
                                    </select>
                                    <select value={selectedProgramId} onChange={e => setSelectedProgramId(e.target.value)} className="p-3 rounded-xl border border-gray-300">
                                        <option value="">Select Program</option>
                                        {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                    </select>
                                    <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)} className="p-3 rounded-xl border border-gray-300">
                                        <option value="">Select Batch</option>
                                        {batches.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                                    </select>
                                    <select value={selectedSemesterId} onChange={e => setSelectedSemesterId(e.target.value)} className="p-3 rounded-xl border border-gray-300">
                                        <option value="">Select Semester</option>
                                        {semesters.map(s => <option key={s.id} value={s.id}>{s.semester_number}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Status */}
                            {statusMessage && <div className={`p-3 rounded-lg text-center font-semibold mb-4 ${statusMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{statusMessage.message}</div>}

                            {/* Courses Table */}
                            <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold">Available Courses</h2>
                                    <button onClick={handleSaveAssignment} disabled={isSaving} className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold text-white transition ${isSaving ? "bg-gray-500 cursor-not-allowed" : "bg-accentDark hover:bg-accent"}`}>
                                        {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Assignments ({currentAssignments.length})
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border border-gray-200 rounded-xl">
                                        <thead className="bg-primary text-white">
                                            <tr>
                                                <Th>Course Name</Th>
                                                <Th>Code</Th>
                                                <Th>Credits</Th>
                                                <Th>Assign</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {courses.map(course => {
                                                const assigned = currentAssignments.includes(course.id);
                                                return (
                                                    <tr key={course.id} className="hover:bg-gray-100">
                                                        <Td>{course.title}</Td>
                                                        <Td>{course.code}</Td>
                                                        <Td>{course.credit_hours}</Td>
                                                        <Td>
                                                            <input type="checkbox" checked={assigned} onChange={() => handleCourseToggle(course.id)} />
                                                        </Td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    {courses.length === 0 && <p className="text-center py-6 text-gray-500">No courses available.</p>}
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "view" && (
                        <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto">
                            <h2 className="text-lg font-bold mb-4">All Assignments</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border border-gray-200 rounded-xl">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <Th>Department</Th>
                                            <Th>Program</Th>
                                            <Th>Batch</Th>
                                            <Th>Semester</Th>
                                            <Th>Courses Assigned</Th>
                                            <Th>Action</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {allAssignments.map(assign => (
                                            <tr key={assign.id} className="hover:bg-gray-100">
                                                <Td>{assign.department_name}</Td>
                                                <Td>{assign.program_name}</Td>
                                                <Td>{assign.batch_name}</Td>
                                                <Td>{assign.semester}</Td>
                                                <Td>{assign.courses.length}</Td>
                                                <Td className="flex gap-3">
                                                    <button
                                                        onClick={() => handleEditAssignment(assign)}
                                                        className="text-primary hover:text-secondary"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteAssignment(assign.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Delete
                                                    </button>
                                                </Td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {allAssignments.length === 0 && <p className="text-center py-6 text-gray-500">No assignments found.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
