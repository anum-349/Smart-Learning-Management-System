"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Save } from "lucide-react";
import NavBar from "../../../navbar/NavBar";
import Header from "../../../header/Header";
import { useRouter } from "next/navigation";

// --- MOCK DATA ---
const MOCK_COURSES_ATTENDANCE = [
    {
        id: "A101",
        code: "CS202",
        title: "Introduction to Database Systems",
        semester: "FALL-I.2024",
        roster: [
            { studentId: "S001", registrationNo: "4503-FOC/BSSE/F22", studentName: "Anum Kousar", status: "Present" },
            { studentId: "S002", registrationNo: "4504-FOC/BSSE/F22", studentName: "Bisma Iftikhar", status: "Absent" },
            { studentId: "S003", registrationNo: "4505-FOC/BSSE/F22", studentName: "Usman Ali", status: "Present" },
            { studentId: "S004", registrationNo: "4506-FOC/BSSE/F22", studentName: "Fahad Khan", status: "Leave" },
            { studentId: "S005", registrationNo: "4507-FOC/BSSE/F22", studentName: "Sana Malik", status: "Present" },
        ],
    },
    {
        id: "A102",
        code: "SE273",
        title: "Software Design and Architecture",
        semester: "FALL-I.2024",
        roster: [
            { studentId: "S001", registrationNo: "4503-FOC/BSSE/F22", studentName: "Anum Kousar", status: "Present" },
            { studentId: "S002", registrationNo: "4504-FOC/BSSE/F22", studentName: "Bisma Iftikhar", status: "Present" },
            { studentId: "S003", registrationNo: "4505-FOC/BSSE/F22", studentName: "Usman Ali", status: "Present" },
            { studentId: "S004", registrationNo: "4506-FOC/BSSE/F22", studentName: "Fahad Khan", status: "Present" },
            { studentId: "S005", registrationNo: "4507-FOC/BSSE/F22", studentName: "Sana Malik", status: "Present" },
        ],
    },
];

// Semester session dates
const SEMESTER_SESSIONS = [
    { date: 'Oct-02' },
    { date: 'Oct-09' },
    { date: 'Oct-16' },
    { date: 'Oct-23' },
    { date: 'Nov-02' },
    { date: 'Nov-09' },
    { date: 'Nov-16' },
    { date: 'Nov-23' },
    { date: 'Dec-05' },
    { date: 'Dec-12' },
    { date: 'Dec-19' },
    { date: 'Dec-26' },
];

// Dummy student data with varied attendance statuses
const DUMMY_STUDENTS = [
    {
        studentId: 'S001',
        registrationNo: '4503-FOC/BSSE/F22',
        studentName: 'Anum Kousar',
        sessions: [
            { date: 'Oct-02', status: 'Present' },
            { date: 'Oct-09', status: 'Absent' },
            { date: 'Oct-16', status: 'Present' },
            { date: 'Oct-23', status: 'Leave' },
            { date: 'Nov-02', status: 'Present' },
            { date: 'Nov-09', status: 'Present' },
            { date: 'Nov-16', status: 'Absent' },
            { date: 'Nov-23', status: 'Present' },
            { date: 'Dec-05', status: 'Present' },
            { date: 'Dec-12', status: 'Leave' },
            { date: 'Dec-19', status: 'Present' },
            { date: 'Dec-26', status: 'Present' },
        ],
        evaluation: 85
    },
    {
        studentId: 'S002',
        registrationNo: '4504-FOC/BSSE/F22',
        studentName: 'Bisma Iftikhar',
        sessions: [
            { date: 'Oct-02', status: 'Absent' },
            { date: 'Oct-09', status: 'Absent' },
            { date: 'Oct-16', status: 'Present' },
            { date: 'Oct-23', status: 'Present' },
            { date: 'Nov-02', status: 'Leave' },
            { date: 'Nov-09', status: 'Present' },
            { date: 'Nov-16', status: 'Present' },
            { date: 'Nov-23', status: 'Absent' },
            { date: 'Dec-05', status: 'Present' },
            { date: 'Dec-12', status: 'Present' },
            { date: 'Dec-19', status: 'Present' },
            { date: 'Dec-26', status: 'Leave' },
        ],
        evaluation: 70
    },
    {
        studentId: 'S003',
        registrationNo: '4505-FOC/BSSE/F22',
        studentName: 'Usman Ali',
        sessions: [
            { date: 'Oct-02', status: 'Present' },
            { date: 'Oct-09', status: 'Present' },
            { date: 'Oct-16', status: 'Present' },
            { date: 'Oct-23', status: 'Absent' },
            { date: 'Nov-02', status: 'Present' },
            { date: 'Nov-09', status: 'Present' },
            { date: 'Nov-16', status: 'Present' },
            { date: 'Nov-23', status: 'Present' },
            { date: 'Dec-05', status: 'Present' },
            { date: 'Dec-12', status: 'Present' },
            { date: 'Dec-19', status: 'Absent' },
            { date: 'Dec-26', status: 'Present' },
        ],
        evaluation: 90
    },
    {
        studentId: 'S004',
        registrationNo: '4506-FOC/BSSE/F22',
        studentName: 'Fahad Khan',
        sessions: [
            { date: 'Oct-02', status: 'Leave' },
            { date: 'Oct-09', status: 'Leave' },
            { date: 'Oct-16', status: 'Present' },
            { date: 'Oct-23', status: 'Present' },
            { date: 'Nov-02', status: 'Leave' },
            { date: 'Nov-09', status: 'Absent' },
            { date: 'Nov-16', status: 'Present' },
            { date: 'Nov-23', status: 'Present' },
            { date: 'Dec-05', status: 'Leave' },
            { date: 'Dec-12', status: 'Present' },
            { date: 'Dec-19', status: 'Present' },
            { date: 'Dec-26', status: 'Present' },
        ],
        evaluation: 80
    },
    {
        studentId: 'S005',
        registrationNo: '4507-FOC/BSSE/F22',
        studentName: 'Sana Malik',
        sessions: [
            { date: 'Oct-02', status: 'Present' },
            { date: 'Oct-09', status: 'Present' },
            { date: 'Oct-16', status: 'Present' },
            { date: 'Oct-23', status: 'Present' },
            { date: 'Nov-02', status: 'Present' },
            { date: 'Nov-09', status: 'Present' },
            { date: 'Nov-16', status: 'Present' },
            { date: 'Nov-23', status: 'Present' },
            { date: 'Dec-05', status: 'Present' },
            { date: 'Dec-12', status: 'Present' },
            { date: 'Dec-19', status: 'Present' },
            { date: 'Dec-26', status: 'Present' },
        ],
        evaluation: 95
    },
];

// --- COMPONENT ---
export default function InstructorAttendance() {
    const [activeTab, setActiveTab] = useState("take");
    const [selectedCourseId, setSelectedCourseId] = useState(MOCK_COURSES_ATTENDANCE[0].id);
    const selectedCourse = MOCK_COURSES_ATTENDANCE.find(c => c.id === selectedCourseId) || MOCK_COURSES_ATTENDANCE[0];
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
    const [currentAttendance, setCurrentAttendance] = useState(selectedCourse.roster);
    const [students, setStudents] = useState(DUMMY_STUDENTS);

    const router = useRouter()
    // Update roster on course change
    useEffect(() => {
        setCurrentAttendance(selectedCourse.roster);
    }, [selectedCourseId, selectedCourse.roster]);

    const handleStatusChange = (studentId, newStatus) => {
        setCurrentAttendance(prev => prev.map(s => s.studentId === studentId ? { ...s, status: newStatus } : s));
    };

    const handleSaveAttendance = () => {
        console.log("Attendance Saved:", { course: selectedCourse.code, date: attendanceDate, attendance: currentAttendance });
        alert(`Attendance for ${selectedCourse.code} on ${attendanceDate} saved successfully!`);
    };

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Instructor"} />
            <main className="flex-1 ml-64 ">
                <Header user="Instructor" notification={[]} />

                <div className="text-sm text-gray-600 mb-6 pt-5 pl-5">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span
                        onClick={() => router.push("/instructor/course")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Course
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Attendance</span>
                </div>

                <div className="p-6 pt-0 max-w-7xl mx-auto">

                    {/* Tabs */}
                    <div className="flex border-b border-gray-300 mb-6">
                        <button
                            className={`px-6 py-3 font-semibold transition ${activeTab === "take" ? "border-b-4 border-accentDark text-accentDark" : "text-gray-600 hover:text-gray-800"}`}
                            onClick={() => setActiveTab("take")}
                        >
                            Take Attendance
                        </button>
                        <button
                            className={`px-6 py-3 font-semibold transition ${activeTab === "view" ? "border-b-4 border-accentDark text-accentDark" : "text-gray-600 hover:text-gray-800"}`}
                            onClick={() => setActiveTab("view")}
                        >
                            View Attendance
                        </button>
                    </div>

                    {/* Course Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <span className="block text-gray-600 font-semibold mb-1">Course Title</span>
                            <p className="bg-gray-100 border border-primary p-3 rounded-lg">{selectedCourse.title}</p>
                        </div>
                        <div>
                            <span className="block text-gray-600 font-semibold mb-1">Semester</span>
                            <p className="bg-gray-100 border border-primary p-3 rounded-lg">{selectedCourse.semester}</p>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {activeTab === "take" && (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-600 font-semibold mb-1">Date</label>
                                    <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="p-3 border rounded-lg w-full md:w-1/3" />
                                </div>

                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Student Name</th>
                                                <th className="px-4 py-2 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentAttendance.map(student => (
                                                <tr key={student.studentId} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2">{student.studentName} <span className="text-xs text-gray-400">({student.registrationNo})</span></td>
                                                    <td className="px-4 py-2 flex justify-center space-x-2">
                                                        {["Present", "Absent", "Leave"].map(status => (
                                                            <button key={status}
                                                                onClick={() => handleStatusChange(student.studentId, status)}
                                                                className={`px-3 py-1 rounded-lg font-semibold transition ${student.status === status
                                                                    ? status === "Present" ? "bg-primary text-white" :
                                                                        status === "Absent" ? "bg-red-600 text-white" :
                                                                            "bg-accentDark text-white"
                                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                                    }`}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button onClick={handleSaveAttendance} className="flex items-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-textDark transition">
                                        Save Attendance
                                    </button>
                                </div>
                            </>
                        )}

                        {activeTab === "view" && (
                            <div className="border max-w-4xl relative rounded-lg flex flex-col">

                                {/* Main Table Container */}
                                <div className="overflow-auto flex-1">
                                    <table className="min-w-max table-auto divide-y divide-gray-300 border-collapse">
                                        <thead className="bg-gray-100 sticky top-0 z-30">
                                            <tr>
                                                <th className="px-4 py-3 text-left sticky left-0 bg-gray-100 z-40 border-b shadow-[inset_-1px_0_0_0_#e5e7eb]">
                                                    Student Name
                                                </th>
                                                {SEMESTER_SESSIONS.map((session, idx) => (
                                                    <th key={idx} className="px-4 py-3 text-center text-sm font-semibold text-gray-600 border-b">
                                                        {session.date}
                                                    </th>
                                                ))}
                                                <th className="px-4 py-3 text-center sticky right-0 bg-gray-100 z-40 border-b shadow-[inset_1px_0_0_0_#e5e7eb]">
                                                    Attendance %
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {students.map((student) => {                                                
                                                // Calculations
                                                const totalPresent = student.sessions.filter(s => s.status === 'Present').length;
                                                const percentage = student.sessions.length
                                                    ? Math.round((totalPresent / student.sessions.length) * 100)
                                                    : 0;

                                                return (
                                                    <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                                                        {/* Sticky Name */}
                                                        <td className="px-4 py-3 sticky left-0 bg-white z-20 whitespace-nowrap border-r shadow-[inset_-1px_0_0_0_#e5e7eb]">
                                                            <p className="font-medium text-gray-900">{student.studentName}</p>
                                                            <p className="text-xs text-gray-500">{student.registrationNo}</p>
                                                        </td>

                                                        {/* Dynamic Session Data */}
                                                        {student.sessions.map((session, idx) => (
                                                            <td key={idx} className="px-4 py-3 text-center whitespace-nowrap">
                                                                <span className={`text-sm font-bold ${session.status === "Absent" ? "text-red-600" :
                                                                    session.status === "Leave" ? "text-yellow-500" :
                                                                        "text-green-600"
                                                                    }`}>
                                                                    {session.status[0]}
                                                                </span>
                                                            </td>
                                                        ))}

                                                        {/* Sticky Percentage */}
                                                        <td className={`px-4 py-3 text-center font-bold sticky right-0 bg-white z-20 border-l shadow-[inset_1px_0_0_0_#e5e7eb] ${percentage < 75 ? "text-red-600" : "text-green-600"
                                                            }`}>
                                                            {percentage}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <button className="px-4 py-2 mt-10 m-3 rounded bg-primary hover:bg-textDark  text-light">
                                        Export Attendance as excel sheet
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
