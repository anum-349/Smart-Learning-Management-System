"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Search,
    Edit,
    PlusCircle,
    Trash2,
    GraduationCap,
} from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
    { id: 2, text: 'New lesson added: "Advanced React Hooks"', isRead: false, type: "course" },
    { id: 3, text: "Welcome to your new dashboard!", isRead: true, type: "general" },
    { id: 4, text: "Instructor John Doe posted a new announcement.", isRead: false, type: "announcement" },
];

export default function AdminDepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [instructors, setInstructors] = useState([]);
    const [faculties, setFaculties] = useState([])
    const [isEdit, setIsEdit] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL

    const [updateData, setUpdateData] = useState({
        id: "",
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

    const fetchDepartments = async () => {
        const resDept = await fetch(`${API_URL}/departments`);
        const deptData = await resDept.json();
        setDepartments(deptData);
        console.log(deptData)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get all departments
                fetchDepartments()

                // Get all instructors (HOD options)
                const resInstr = await fetch(`${API_URL}/instructor/hods`);
                const instrData = await resInstr.json();
                setInstructors(instrData);

                // Get all faculties (for dropdown)
                const resFac = await fetch(`${API_URL}/faculties`);
                const facData = await resFac.json();
                setFaculties(facData ? facData : []);
            } catch (err) {
                console.error(err);
                alert("Failed to fetch data");
            }
        };

        fetchData();
    }, []);

    const handleAddDepartment = async (e) => {
        e.preventDefault();

        console.log(newDepartment)
        if (!newDepartment.title || !newDepartment.code || !newDepartment.facultyId) {
            alert("Fill all fields");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/departments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newDepartment.title,
                    code: newDepartment.code,
                    faculty_id: newDepartment.facultyId,
                    head_of_dept_id: newDepartment.headOfDept
                })
            });

            if (!res.ok) throw new Error("Failed to create department");
            const created = await res.json();

            fetchDepartments()
            setNewDepartment({ title: "", code: "", facultyId: "", headOfDept: "" });
            alert("Department added successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleUpdateDepartment = (dept) => {
        setIsEdit(true);
        setUpdateData({
            id: dept.dept_id,
            title: dept.title,
            code: dept.code,
            facultyId: dept.faculty_id,
            headOfDept: dept.user_id
        });
    };
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        console.log(updateData)
        try {
            const res = await fetch(`${API_URL}/departments/${updateData.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: updateData.title,
                    code: updateData.code,
                    faculty_id: updateData.facultyId,
                    head_of_dept_id: updateData.headOfDept
                })
            });

            if (!res.ok) throw new Error("Failed to update department");
            const updated = await res.json();
            fetchDepartments()
            setIsEdit(false);
            alert("Department updated successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const handleDeleteDepartment = async (id) => {
        console.log(id)
        if (!confirm("Are you sure?")) return;

        try {
            const res = await fetch(`${API_URL}/departments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete department");

            fetchDepartments()
            alert("Department deleted successfully");
        } catch (err) {
            console.error(err);
            alert(err.message);
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
            <NavBar userType={"Admin"} />

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
                                placeholder="e.g. Software Engineering"
                                onChange={(v) => handleChange("title", v)}
                            />
                            <Input
                                label="Code"
                                value={formData.code}
                                placeholder="DOF-123"
                                onChange={(v) => handleChange("code", v)}
                            />

                            <Select
                                label="Faculty"
                                value={formData.facultyId}
                                onChange={(v) => { handleChange("facultyId", v); console.log(v) }}
                                 options={[
                                    { value: "", label: "-- Select Faculty --" },
                                    ...faculties.map((d) => ({ value: d.code, label: d.title })),
                                ]}
                            />

                            <Select
                                label="Head of Department"
                                value={formData.headOfDept}
                                onChange={(v) => { handleChange("headOfDept", v) }}
                                 options={[
                                    { value: "", label: "-- Select HOD --" },
                                    ...instructors.map((d) => ({ value: d.id, label: d.full_name })),
                                ]}
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
                                    {departments.map((dept, index) => (
                                        <tr key={index} className="hover:bg-gray-100">
                                            <Td>
                                                <div className="font-semibold text-primary">{dept.title}</div>
                                                <div className="text-xs text-accentDark font-mono">
                                                    ({dept.code})
                                                </div>
                                            </Td>

                                            <Td>
                                                {dept.hod}
                                            </Td>

                                            <Td className="text-center text-primary font-semibold">
                                                {dept.faculty_title}
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
                                                    onClick={() => handleDeleteDepartment(dept.dept_id)}
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

                        {departments.length === 0 && (
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