"use client";

import React from 'react';
import { BookOpen, Award, CheckCircle, BarChart2, Bell, Clock, Download } from 'lucide-react';
import NavBar from '../../../navbar/NavBar';
import Header from '../../../header/Header';

const GRADE_POINT_MAP = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0,
    'I': 0.0, 'W': 0.0, 'P': 0.0, 'NA': 0.0,
};

const getGradePoint = (grade) => GRADE_POINT_MAP[grade.toUpperCase()] || 0.0;

const MOCK_COURSE_RESULT = {
    semester: "FALL-I.2024",
    courseCode: "CS202",
    courseTitle: "Introduction to Database Systems",
    credits: 4,
    instructor: "Dr. Amir Hussain",
    finalGrade: "B+",
    totalMarks: 100,
    totalObtained: 83.0,
    assessments: [
        { name: "Sessional/Quizzes (Average)", weightage: 10, maxMarks: 10, obtainedMarks: 8.5 },
        { name: "Assignments/Projects", weightage: 20, maxMarks: 20, obtainedMarks: 16.0 },
        { name: "Midterm Examination", weightage: 30, maxMarks: 30, obtainedMarks: 26.0 },
        { name: "Final Examination", weightage: 40, maxMarks: 40, obtainedMarks: 32.5 },
    ],
};

const studentName = "Anum Kousar";

const CourseResultDetail = () => {
    const data = MOCK_COURSE_RESULT;
    const loggedInUserName = studentName.toUpperCase();
    const finalPercentage = ((data.totalObtained / data.totalMarks) * 100).toFixed(2);
    const finalGradePoint = getGradePoint(data.finalGrade);
    const totalObtainedMarks = data.assessments.reduce((sum, item) => sum + item.obtainedMarks, 0);

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Student"} />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={[]} />
                <div className="p-6 pt-0 max-w-7xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center text-sm text-gray-900 mb-4 mt-6 space-x-2">
                        <a href={'/student/dashboard'} className="hover:text-[#354538]">Dashboard</a>
                        <span>/</span>
                        <a href={'/student/course'} className="hover:text-[#354538]">Course</a>
                        <span>/</span>
                        <span className="font-semibold">{data.courseCode} Grade</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                        <BarChart2 size={32} className="mr-3" />
                        Course Performance: {data.courseCode}
                    </h1>

                    {/* Course Card */}
                    <div className="bg-light shadow-2xl border border-textDark p-8 rounded-xl space-y-6">
                        {/* Header */}
                        <div className="border-b border-gray-800 pb-3 mb-6">
                            <h2 className="text-3xl font-extrabold text-textDark">{data.courseTitle}</h2>
                            <p className="text-xl text-textDark/80 mt-1">{data.courseCode} ({data.credits} Cr. Hrs.)</p>
                            <p className="text-md text-gray-600">Instructor: {data.instructor}</p>
                        </div>

                        {/* Summary Metrics */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="p-4 rounded-lg bg-primary border border-textDark shadow-md">
                                <p className="text-sm font-semibold text-light">Final Grade</p>
                                <span className={`text-2xl font-extrabold ${data.finalGrade === 'A' ? 'text-accentDark' : data.finalGrade.startsWith('B') ? 'text-accent' : 'text-red-400'}`}>{data.finalGrade}</span>
                            </div>
                            <div className="p-4 rounded-lg bg-primary border border-textDark shadow-md">
                                <p className="text-sm font-semibold text-light">Grade Point</p>
                                <span className="text-2xl font-extrabold text-accent">{finalGradePoint.toFixed(1)}</span>
                            </div>
                            <div className="p-4 rounded-lg bg-primary border border-textDark shadow-md">
                                <p className="text-sm font-semibold text-light">Total Marks</p>
                                <span className="text-xl font-extrabold text-white">{data.totalObtained.toFixed(1)} / {data.totalMarks}</span>
                            </div>
                            <div className="p-4 rounded-lg bg-primary border border-textDark shadow-md">
                                <p className="text-sm font-semibold text-light">Percentage</p>
                                <span className="text-xl font-extrabold text-white">{finalPercentage}%</span>
                            </div>
                        </div>

                        {/* Assessment Table */}
                        <div>
                            <h4 className="text-xl font-bold text-textDark mb-3 flex items-center">
                                Assessment Breakdown
                            </h4>
                            <div className="overflow-x-auto rounded-lg">
                                <table className="min-w-full divide-y divide-gray-600 border border-textDark">
                                    <thead className="bg-primary text-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs uppercase tracking-wider">Assessment Item</th>
                                            <th className="px-4 py-3 text-center text-xs uppercase tracking-wider">Weightage (%)</th>
                                            <th className="px-4 py-3 text-center text-xs uppercase tracking-wider">Max Marks</th>
                                            <th className="px-4 py-3 text-center text-xs uppercase tracking-wider">Obtained Marks</th>
                                            <th className="px-4 py-3 text-center text-xs uppercase tracking-wider">Contribution</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-light divide-y divide-gray-600 text-gray-200">
                                        {data.assessments.map((item, idx) => (
                                            <tr key={idx} className="text-primary">
                                                <td className="px-4 py-3 font-semibold">{item.name}</td>
                                                <td className="px-4 py-3 text-center">{item.weightage}%</td>
                                                <td className="px-4 py-3 text-center">{item.maxMarks.toFixed(1)}</td>
                                                <td className="px-4 py-3 text-center font-bold text-accent">{item.obtainedMarks.toFixed(1)}</td>
                                                <td className="px-4 py-3 text-center">{((item.obtainedMarks / item.maxMarks) * item.weightage).toFixed(1)} / {item.weightage}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-textDark text-accentDark font-bold">
                                        <tr>
                                            <td className="px-4 py-3 text-right">TOTAL:</td>
                                            <td className="px-4 py-3 text-center">100%</td>
                                            <td className="px-4 py-3 text-center">{data.totalMarks.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-center">{totalObtainedMarks.toFixed(1)}</td>
                                            <td className="px-4 py-3 text-center">{data.totalObtained.toFixed(1)} / 100</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="text-sm italic text-gray-500 mt-4 space-y-1">
                            <p>* Final grades are subject to confirmation by the Examination Board.</p>
                            <p>* Marks for Quizzes and Assignments reflect the total aggregated score.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseResultDetail;
