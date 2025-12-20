"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Header from "../../../header/Header";
import NavBar from "../../../navbar/NavBar";

// --- Mock Data ---
const MOCK_ASSESSMENTS = [
    { id: 'quiz', name: 'Quizzes (10%)', weightage: 10, maxScore: 10 },
    { id: 'assign', name: 'Assignments (20%)', weightage: 20, maxScore: 20 },
    { id: 'midterm', name: 'Midterm Exam (30%)', weightage: 30, maxScore: 30 },
    { id: 'final', name: 'Final Exam (40%)', weightage: 40, maxScore: 40 },
];

const MOCK_STUDENTS = [
    { studentId: 'S001', registrationNo: '4503-FOC/BSSE/F22', studentName: 'Anum Kousar', marks: { quiz: 8.5, assign: 16, midterm: 26, final: '' } },
    { studentId: 'S002', registrationNo: '4504-FOC/BSSE/F22', studentName: 'Bisma Iftikhar', marks: { quiz: 7.0, assign: 18, midterm: 22, final: '' } },
    { studentId: 'S003', registrationNo: '4505-FOC/BSSE/F22', studentName: 'Usman Ali', marks: { quiz: 9.5, assign: 15, midterm: 28, final: '' } },
];

const MOCK_COURSES = [
    { id: 'C101', code: 'CS202', title: 'Introduction to Database Systems', semester: 'FALL-I.2024', assessments: MOCK_ASSESSMENTS, students: MOCK_STUDENTS, creditHour: 3 }
];

// --- Main Component ---
const InstructorGradeEntry = () => {
    const router = useRouter();
    const instructorName = "Dr. Amir Hussain";

    const [selectedCourseId, setSelectedCourseId] = useState(MOCK_COURSES[0].id);
    const selectedCourse = MOCK_COURSES.find(c => c.id === selectedCourseId) || MOCK_COURSES[0];
    const [studentMarks, setStudentMarks] = useState(selectedCourse.students);

    useEffect(() => {
        setStudentMarks(selectedCourse.students);
    }, [selectedCourseId, selectedCourse]);

    const handleMarkChange = (studentId, assessmentId, value) => {
        setStudentMarks(prev => prev.map(student => {
            if (student.studentId === studentId) {
                const maxScore = selectedCourse.assessments.find(a => a.id === assessmentId)?.maxScore || 0;
                let numValue = value.trim() === '' ? '' : parseFloat(value);
                if (typeof numValue === 'number') {
                    if (numValue > maxScore) numValue = maxScore;
                    if (numValue < 0) numValue = 0;
                }
                return { ...student, marks: { ...student.marks, [assessmentId]: numValue } };
            }
            return student;
        }));
    };

    const calculateTotalScore = (student, assessments) =>
        assessments.reduce((sum, a) => {
            const mark = parseFloat(student.marks[a.id] || 0);
            return sum + (!isNaN(mark) ? (mark / a.maxScore) * a.weightage : 0);
        }, 0);

    const getGradePoint = (percentage) => {
        if (percentage >= 85) return 4.0;
        if (percentage >= 80) return 3.7;
        if (percentage >= 75) return 3.5;
        if (percentage >= 70) return 3.2;
        if (percentage >= 65) return 3.1;
        if (percentage >= 60) return 2.8;
        if (percentage >= 55) return 2.5;
        if (percentage >= 50) return 2.0;
        return 0;
    };

    const calculateGrade = (student, assessments, creditHours) => {
        const total = calculateTotalScore(student, assessments);
        const gradePoint = getGradePoint(total);
        const letterGrade =
            total >= 85 ? 'A+' :
                total >= 80 ? 'A' :
                    total >= 75 ? 'A-' :
                        total >= 70 ? 'B+' :
                            total >= 65 ? 'B' :
                                total >= 60 ? 'C+' :
                                    total >= 55 ? 'C' :
                                        total >= 50 ? 'D' : 'F';
        const qualityPoints = gradePoint * creditHours;
        return { totalScore: total, gradePoint, qualityPoints, letterGrade };
    };

    const handleSaveMarks = () => {
        console.log(studentMarks);
        alert(`Grades saved for ${selectedCourse.code} (${selectedCourse.semester})`);
    };

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Instructor"} />
            <main className="flex-1 ml-64">
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
                    <span className="font-medium text-gray-900">Grade</span>
                </div>

                <div className="p-6 overflow-x-auto">
                    <h1 className="text-xl font-bold text-gray-800 mb-6">{selectedCourse.code}: {selectedCourse.title}</h1>

                    {/* GRADES TABLE */}
                    <div className="overflow-x-auto border rounded-lg shadow-xl">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-textDark text-white sticky top-0">
                                <tr className='text-sm'>
                                    <th rowSpan={2} className="px-4 text-sm py-3 text-left text-nowrap">Student Name (Reg No.)</th>
                                    <th colSpan={selectedCourse.assessments.length} className="px-4 text-sm py-2 text-center">Assessment Items</th>
                                    <th rowSpan={2} className="px-4 text-sm py-3 text-center bg-red-700">TOTAL</th>
                                    <th rowSpan={2} className="px-4 py-3 text-center text-sm bg-red-700">GRADE</th>
                                    <th rowSpan={2} className="px-4 py-3 text-center text-sm bg-red-700">Quality Points</th>
                                </tr>
                                <tr>
                                    {selectedCourse.assessments.map(a => (
                                        <th key={a.id} className="px-2 py-1 text-center text-sm">{a.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {studentMarks.map(student => {
                                    const gradeInfo = calculateGrade(student, selectedCourse.assessments, selectedCourse.creditHour);
                                    return (
                                        <tr key={student.studentId} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium">{student.studentName}<br /><span className="text-xs text-gray-500">({student.registrationNo})</span></td>
                                            {selectedCourse.assessments.map(a => (
                                                <td key={a.id} className="px-2 py-1 text-center border-l">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={a.maxScore}
                                                        step={0.1}
                                                        value={student.marks[a.id]}
                                                        onChange={e => handleMarkChange(student.studentId, a.id, e.target.value)}
                                                        className="w-full text-center p-1 border rounded"
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center bg-accentDark font-bold text-white">{gradeInfo.totalScore.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center bg-accentDark font-bold text-white">{gradeInfo.letterGrade}</td>
                                            <td className="px-4 py-3 text-center bg-accentDark font-bold text-white">{gradeInfo.qualityPoints.toFixed(2)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSaveMarks} className="flex items-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/60">
                            Submit Grades
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default InstructorGradeEntry