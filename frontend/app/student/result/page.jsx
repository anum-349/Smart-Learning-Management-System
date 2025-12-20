"use client";

import React, { useState, useMemo } from "react";
import { Award, Bell, Download } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";

// LetterAvatar, getGradePoint, calculateQualityPoints, MOCK_SEMESTER_DATA remain unchanged
const MOCK_SEMESTER_DATA = {
    "FALL-I.2024": {
        registrationNo: "4503-FOC/BSSE/F22",
        studentName: "Anum Kousar",
        fatherName: "Muhammad Ayaz Khan",
        faculty: "Computing and Information Technology",
        department: "Software Engineering",
        degreeProgram: "BS Software Engineering",
        semester: "FALL-I.2024",
        results: [
            { code: 'CS202', title: 'Introduction to Database Systems', credits: 4, grade: 'B+', marks: 82 },
            { code: 'IS375', title: 'Information Security', credits: 3, grade: 'A', marks: 91 },
            { code: 'SE273', title: 'Software Design and Architecture', credits: 3, grade: 'A', marks: 95 },
            { code: 'MG115', title: 'Intro to Social Media Marketing', credits: 3, grade: 'B', marks: 78 },
            { code: 'CS202', title: 'Web Engineering', credits: 3, grade: 'A', marks: 92 },
        ],
        cumulativeGPA: 3.514,
        status: "Degree In Progress",
        percentage: "77.12",
        issuedOn: "November 19, 2025",
        pdfUrl: "/pdfs/Lecture01.pdf"
    },
    "SPRING-2024": {
        registrationNo: "4503-FOC/BSSE/F22",
        studentName: "Anum Kousar",
        fatherName: "Muhammad Ayaz Khan",
        faculty: "Computing and Information Technology",
        department: "Software Engineering",
        degreeProgram: "BS Software Engineering",
        semester: "SPRING-2024",
        results: [],
        cumulativeGPA: 0,
        status: "Not Available",
        percentage: "0",
        issuedOn: "N/A",
        pdfUrl: "/pdfs/Lecture01.pdf"
    }
};

const GRADE_POINT_MAP = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

const getGradePoint = (grade) => {
    return GRADE_POINT_MAP[grade.toUpperCase()] || 0.0;
};

const calculateQualityPoints = (grade, credits) => {
    const gradePoint = getGradePoint(grade);
    const qualityPoints = gradePoint * credits;
    return parseFloat(qualityPoints.toFixed(2));
};

const StudentResult = () => {
    const availableSemesters = Object.keys(MOCK_SEMESTER_DATA);
    const [selectedSemester, setSelectedSemester] = useState("FALL-I.2024");
    const [resultData, setResultData] = useState(MOCK_SEMESTER_DATA["FALL-I.2024"]);

    const loggedInUserName = resultData.studentName.toUpperCase();

    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester);
        setResultData(MOCK_SEMESTER_DATA[semester]);
    };

    const handleDownloadPDF = () => {
        if (!resultData.pdfUrl) return console.log("PDF not available.");
        const link = document.createElement("a");
        link.href = resultData.pdfUrl;
        link.download = `${resultData.semester}_Result.pdf`;
        link.click();
    };

    const { semesterGPA } = useMemo(() => {
        let totalQualityPoints = 0;
        let totalCredits = 0;
        resultData.results.forEach((course) => {
            totalQualityPoints += calculateQualityPoints(course.grade, course.credits);
            totalCredits += course.credits;
        });
        const sgpa = totalCredits ? totalQualityPoints / totalCredits : 0;
        return { semesterGPA: parseFloat(sgpa.toFixed(3)) };
    }, [resultData.results]);

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType="Student" />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={[]} />

                <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
                    <span
                        onClick={() => router.push("/student")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Results</span>
                </div>

                {/* Semester Selector */}
                <div className="max-w-4xl mx-auto mb-6">
                    <label className="block mb-2 font-semibold text-gray-700">Select Semester</label>
                    <select
                        value={selectedSemester}
                        onChange={(e) => handleSemesterChange(e.target.value)}
                        className="w-sm p-3 rounded-lg border border-gray-300 bg-primary text-light font-semibold"
                    >
                        {availableSemesters.map((sem, i) => (
                            <option key={i} value={sem}>
                                {sem}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Result Card */}
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                    {/* Student Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="md:col-span-2 space-y-1 text-sm text-gray-700">
                            <p><strong>Registration No:</strong> {resultData.registrationNo}</p>
                            <p><strong>Student Name:</strong> {resultData.studentName}</p>
                            <p><strong>Father's Name:</strong> {resultData.fatherName}</p>
                            <p><strong>Faculty:</strong> {resultData.faculty}</p>
                            <p><strong>Department:</strong> {resultData.department}</p>
                            <p><strong>Degree Program:</strong> {resultData.degreeProgram}</p>
                        </div>
                        <div className="flex justify-center md:justify-end">
                            <div className="w-36 h-36 border-2 border-gray-900 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                                Student Photo
                            </div>
                        </div>
                    </div>

                    {/* Courses Table */}
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm border border-gray-300 rounded-lg">
                            <thead className="bg-textDark rounded-t-2xl text-white sticky top-0">
                                <tr>
                                    <th className="p-2 text-left">Course Code</th>
                                    <th className="p-2 text-left">Course Title</th>
                                    <th className="p-2 text-center">Credits</th>
                                    <th className="p-2 text-center">Marks</th>
                                    <th className="p-2 text-center">Grade</th>
                                    <th className="p-2 text-center">Quality Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultData.results.length ? (
                                    resultData.results.map((course, i) => (
                                        <tr key={i} className="border-t hover:bg-gray-100">
                                            <td className="p-2">{course.code}</td>
                                            <td className="p-2">{course.title}</td>
                                            <td className="p-2 text-center">{course.credits}</td>
                                            <td className="p-2 text-center">{course.marks}%</td>
                                            <td className="p-2 text-center font-semibold text-accent">{course.grade}</td>
                                            <td className="p-2 text-center">{calculateQualityPoints(course.grade, course.credits)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-4 text-center text-gray-500">
                                            No results available for this semester.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-center">
                        <div className="p-4 rounded-lg bg-primary text-gray-300 font-bold">SGPA<br />{semesterGPA.toFixed(3)}</div>
                        <div className="p-4 rounded-lg bg-primary text-gray-300 font-bold">CGPA<br />{resultData.cumulativeGPA.toFixed(3)}</div>
                        <div className="p-4 rounded-lg bg-primary text-gray-300 font-bold">Percentage<br />{resultData.percentage}%</div>
                        <div className="p-4 rounded-lg bg-primary text-gray-300 font-bold">Status<br />{resultData.status}</div>
                    </div>

                    <p className="text-right text-xs text-gray-500">Results Issued On: <span className="text-gray-800">{resultData.issuedOn}</span></p>
                </div>

                {/* Download Button */}
                <div className="max-w-4xl mx-auto mb-5 mt-6 flex justify-end">
                    <button
                        className="flex items-center px-6 py-3 bg-textDark text-white rounded-lg font-semibold shadow hover:bg-primary/90 transition"
                        onClick={handleDownloadPDF}
                    >
                        <Download size={20} className="mr-2" /> Download PDF
                    </button>
                </div>
            </main>
        </div>
    );
};

export default StudentResult;
