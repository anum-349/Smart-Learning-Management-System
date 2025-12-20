"use client";

import React, { useState, FormEvent, useMemo } from 'react';
import { User, Mail, Award, CheckCircle, BookOpen } from 'lucide-react';
import Header from '@/app/header/Header';
import NavBar from '../../navbar/NavBar';
import Modal from '../../../components/ui/Modal';
import { useRouter } from 'next/navigation';

// --- MOCK USER PROFILE ---
const MOCK_STUDENT_PROFILE = {
    name: "Alex Johnson",
    regNo: "FA21-BSE-045",
    email: "alex.johnson@uni.edu",
    degree: "B.S. Software Engineering"
};

// --- MOCK DATA ---
const OFFERED_COURSES = [
    { id: 'C101', code: 'CS101', title: 'Programming Fundamentals', credits: 3, isCompulsory: true },
    { id: 'C102', code: 'MA105', title: 'Calculus I', credits: 3, isCompulsory: true },
    { id: 'C103', code: 'PH101', title: 'Applied Physics', credits: 3, isCompulsory: true },
    { id: 'C201', code: 'SE210', title: 'Software Requirement Engineering', credits: 3, isCompulsory: false },
    { id: 'C202', code: 'IS305', title: 'Ethical Hacking', credits: 3, isCompulsory: false },
    { id: 'C203', code: 'SS101', title: 'Islamic Studies', credits: 2, isCompulsory: true },
    { id: 'C204', code: 'EL200', title: 'Technical and Business Writing', credits: 3, isCompulsory: false },
];

const PREREQUISITES = [
    { courseId: 'C201', preReqCourseId: 'C101' },
    { courseId: 'C202', preReqCourseId: 'C201' },
];

const MOCK_STUDENT_GRADES = [
    { courseId: 'C101', grade: 'A' },
    { courseId: 'C201', grade: 'F' },
    { courseId: 'C103', grade: 'B+' },
];

const CourseEnrollmentTable = () => {
    const [studentRegNo, setStudentRegNo] = useState(MOCK_STUDENT_PROFILE.regNo);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(true); // Open by default

    const router = useRouter()
    
    const hasFailedPrereq = (courseId) => {
        const preReq = PREREQUISITES.find(p => p.courseId === courseId);
        if (!preReq) return false;
        const gradeRecord = MOCK_STUDENT_GRADES.find(g => g.courseId === preReq.preReqCourseId);
        return gradeRecord ? gradeRecord.grade === 'F' : false;
    };

    const enrollmentCourses = useMemo(() => {
        return OFFERED_COURSES.map(course => {
            if (hasFailedPrereq(course.id)) {
                const preReq = PREREQUISITES.find(p => p.courseId === course.id);
                const failedCourse = OFFERED_COURSES.find(c => c.id === preReq.preReqCourseId);
                if (failedCourse) return { ...failedCourse, isCompulsory: true, isFailedRetake: true };
            }
            return course;
        });
    }, []);

    const [selectedCourseIds, setSelectedCourseIds] = useState(enrollmentCourses.filter(c => c.isCompulsory).map(c => c.id));

    const totalCredits = enrollmentCourses.filter(c => selectedCourseIds.includes(c.id)).reduce((sum, c) => sum + c.credits, 0);

    const handleCourseToggle = (course) => {
        if (course.isCompulsory || (course).isFailedRetake) return;
        setSelectedCourseIds(prev =>
            prev.includes(course.id) ? prev.filter(id => id !== course.id) : [...prev, course.id]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!studentRegNo) { alert("Enter your registration number."); return; }
        if (totalCredits === 0) { alert("Select at least one course."); return; }
        if (totalCredits > 18) { alert("Credit limit exceeded (max 18)."); return; }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsEnrolled(true);
            const finalSelection = enrollmentCourses.filter(c => selectedCourseIds.includes(c.id));
            console.log("Enrollment Confirmed:", finalSelection.map(c => c.code));
        }, 1500);
    };

    if (isEnrolled) {
        return (
            <div className="min-h-screen bg-[#091211] flex items-center justify-center p-8">
                <div className="bg-[#192614] border-2 border-[#bb9c42] p-10 rounded-xl max-w-lg text-center shadow-2xl shadow-[#192614]">
                    <CheckCircle className="w-16 h-16 text-[#bb9c42] mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-4">Enrollment Submitted!</h1>
                    <p className="text-lg text-gray-300 mb-6">
                        Your course selections for <strong>FALL 2024</strong> semester have been recorded.
                    </p>
                    <div className="bg-[#354538] p-4 rounded-lg inline-block">
                        <p className="font-semibold text-gray-200">
                            Total Credits Enrolled: <span className='text-[#f9e67d]'>{totalCredits}</span>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => {setIsModalOpen(false); router.push("/student")}}
            title="Courses Enrollment"
        >
            <div className="max-w-5xl mx-auto p-3 rounded-xl shadow-lg bg-light border-2 border-textDark space-y-6">

                {/* Student Info */}
                <div className="p-4 bg-textDark rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-xl font-bold text-white flex items-center gap-2">
                            <User size={20} className='text-accent' />
                            Welcome, {MOCK_STUDENT_PROFILE.name}
                        </p>
                        <p className="text-sm text-gray-400">{MOCK_STUDENT_PROFILE.degree} | Reg No: {MOCK_STUDENT_PROFILE.regNo}</p>
                    </div>
                    <div className='text-lg font-bold text-accentDark'>Total Credits: {totalCredits}</div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Courses Table */}
                    <div className="overflow-x-auto rounded border border-textDark">
                        <table className="min-w-full divide-y divide-gray-400 text-gray-100">
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Code</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Course Title</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Cr. Hrs.</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Select</th>
                                </tr>
                            </thead>
                            <tbody className="bg-light divide-y divide-gray-600">
                                {enrollmentCourses.map((course, idx) => {
                                    const isSelected = selectedCourseIds.includes(course.id);
                                    const isFixed = course.isCompulsory || (course).isFailedRetake;
                                    const statusText = (course).isFailedRetake ? 'FAILED RETAKE' : (course.isCompulsory ? 'COMPULSORY' : 'OPTIONAL');
                                    const statusColor = (course).isFailedRetake ? 'text-accent font-bold' : (course.isCompulsory ? 'text-accentDark' : 'text-gray-400');
                                    return (
                                        <tr key={idx} className='hover:bg-primary transition-colors'>
                                            <td className={`px-4 py-4 whitespace-nowrap text-sm ${statusColor}`}>{statusText}</td>
                                            <td className="px-4 py-4 whitespace-nowrap hover:text-white text-sm font-medium text-gray-600">{course.code}</td>
                                            <td className="px-4 py-4 whitespace-nowrap hover:text-white text-sm text-gray-700">{course.title}</td>
                                            <td className="px-4 py-4 whitespace-nowrap hover:text-white text-center text-sm font-bold text-gray-800">{course.credits}</td>
                                            <td className="px-4 py-4 whitespace-nowrap hover:text-white text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleCourseToggle(course)}
                                                    disabled={isFixed || isLoading}
                                                    className={`w-5 h-5 rounded ${isFixed ? 'bg-gray-700 hover:text-white cursor-not-allowed' : 'bg-gray-800 border-gray-400 checked:bg-accentDark checked:border-transparent'}`}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Identity Confirmation */}
                    <div className='p-4 bg-primary rounded-xl space-y-4'>
                        <h2 className='text-accent font-bold text-lg'>Confirm Identity</h2>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Registration No:</label>
                            <div className="relative">
                                <Award size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-accent" />
                                <input
                                    type="text"
                                    value={studentRegNo}
                                    onChange={(e) => setStudentRegNo(e.target.value)}
                                    className="w-full p-2 pl-8 border border-[#192614] rounded-lg bg-textDark text-white text-sm"
                                    placeholder="FA21-BSE-045"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-white">Student Email:</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-accent" />
                                <input
                                    type="email"
                                    value={MOCK_STUDENT_PROFILE.email}
                                    readOnly
                                    className="w-full p-2 pl-8 border border-textDark rounded-lg bg-textDark text-gray-300 cursor-default text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-between items-center">
                        <div className='text-lg font-bold text-gray-800'>
                            Total Credits Selected: <span className='text-accentDark'>{totalCredits}</span>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-64 flex items-center justify-center py-3 px-4 rounded-lg font-bold transition duration-300 ${isLoading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-textDark text-light hover:bg-textDark/90 shadow-xl'}`}
                        >
                            {isLoading ? (
                                <span className='flex items-center gap-2 animate-pulse'>Processing...</span>
                            ) : (
                                'Confirm Enrollment'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default CourseEnrollmentTable;
