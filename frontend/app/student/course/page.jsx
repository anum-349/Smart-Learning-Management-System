
"use client";

import React, { useState, useMemo } from 'react';
import {
    ChevronDown, ChevronUp, Clock, BookOpen, Zap,
    PlayCircle, FileText, CheckCircle, Download, ListChecks,
    Users, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavBar from '../../navbar/NavBar';
import Header from '../../header/Header';
import Link from 'next/link';

const mockCourseData = {
    title: "Web Development Fundamentals (CS504)",
    instructor: "Prof. Jane A. Doe",
    progressPercent: 65,
    credits: 3,
    duration: "16 Weeks",
    prerequisites: "None",
    description: "This course introduces the fundamental concepts of front-end and back-end web development, covering HTML5, CSS3, JavaScript ES6+, and modern framework concepts. By the end of this course, students will be able to build and deploy full-stack web applications.",
    modules: [
        {
            id: 1,
            title: "Module 1: HTML & Core Structure",
            lessons: [
                { id: 101, title: 'Lecture 1.1: Introduction to HTML', type: 'Video', duration: '12 min', isCompleted: true },
                { id: 102, title: 'Reading: HTML Semantics', type: 'Reading', duration: '20 min', isCompleted: true },
                { id: 103, title: 'Quiz: Module 1 Checkpoint', type: 'Quiz', duration: '10 min', isCompleted: true },
            ]
        },
        {
            id: 2,
            title: "Module 2: CSS and Responsive Design",
            lessons: [
                { id: 201, title: 'Lecture 2.1: CSS Selectors and Box Model', type: 'Video', duration: '18 min', isCompleted: true },
                { id: 202, title: 'Hands-on Lab: Flexbox Challenge', type: 'Download', duration: '1 hr', isCompleted: false },
                { id: 203, title: 'Lecture 2.2: Responsive Layouts (Media Queries)', type: 'Video', duration: '15 min', isCompleted: false },
            ]
        },
        {
            id: 3,
            title: "Module 3: JavaScript Core",
            lessons: [
                { id: 301, title: 'Reading: Variables, Types, and Operators', type: 'Reading', duration: '30 min', isCompleted: false },
                { id: 302, title: 'Lecture 3.1: Functions and Scope', type: 'Video', duration: '25 min', isCompleted: false },
                { id: 303, title: 'Assignment 2: JS Calculator (Due Nov 30)', type: 'Download', duration: '5 hr', isCompleted: false },
            ]
        }
    ]
};

// Helper to get lesson icon
const getLessonIcon = ( type ) => {
    switch (type) {
        case 'Video': return PlayCircle;
        case 'Reading': return FileText;
        case 'Quiz': return ListChecks;
        case 'Download': return Download;
        default: return BookOpen;
    }
};

const DetailItem = ({ Icon, label, value }) => (
    <div className="flex justify-between items-center bg-textDark p-3 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2">
            <Icon size={20} className="text-accentDark" />
            <span className="font-medium text-gray-300">{label}</span>
        </div>
        <span className="font-semibold text-white">{value}</span>
    </div>
);

const ProgressBar = ({ percent }) => (
    <div className="w-full bg-gray-700 rounded-full h-3">
        <div
            className="h-3 rounded-full bg-accentDark transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
        />
    </div>
);

const CourseDetailPage = () => {
    const course = mockCourseData;
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedModule, setExpandedModule] = useState(1);

    const totalLessons = useMemo(() => course.modules.reduce((acc, m) => acc + m.lessons.length, 0), [course.modules]);
    const completedLessons = useMemo(() => course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.isCompleted).length, 0), [course.modules]);

    const toggleModule = (id) => setExpandedModule(expandedModule === id ? null : id);

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Student"} />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={[]} />
                <div className="container mx-auto p-6 pt-10">
                    <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <Link href="/student" className="hover:text-accentDark">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span>Course</span>
                    </div>
                </div>

                <div className="p-6 pt-0">
                    {/* Course Banner */}
                    <div className="bg-light p-6 rounded-2xl shadow-2xl mb-8">
                        <div className="flex justify-end items-center mb-4">
                            <button
                            onClick={() => router.push('/student/course/view-grades')}
                                className="px-4 py-2 bg-textDark text-white rounded-lg hover:bg-primary transition"
                            >
                                View Grades
                            </button>
                        </div>
                        <h1 className="text-4xl font-extrabold text-textDark mb-2">{course.title}</h1>
                        <p className="text-gray-800 mb-4">Instructor: <span className="text-white font-semibold">{course.instructor}</span></p>
                        <div className="bg-textDark p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Progress</p>
                                <p className="text-3xl font-bold text-accent">{course.progressPercent}%</p>
                            </div>
                            <div className="flex-1">
                                <ProgressBar percent={course.progressPercent} />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-400 mb-6 space-x-4">
                        <button
                            className={`py-2 px-4 font-semibold transition ${activeTab === 'overview' ? 'border-b-4 border-accentDark text-accent' : 'text-gray-800 hover:text-accentDark'}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`py-2 px-4 font-semibold transition ${activeTab === 'content' ? 'border-b-4 border-accentDark text-accent' : 'text-gray-800 hover:text-accentDark'}`}
                            onClick={() => setActiveTab('content')}
                        >
                            Course Content ({course.modules.length} Modules)
                        </button>
                    </div>

                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {activeTab === 'overview' && (
                                <div className="bg-light p-6 rounded-xl shadow-inner text-gray-600 space-y-6">
                                    <h2 className="text-xl font-bold text-textDark">Course Description</h2>
                                    <p>{course.description}</p>
                                    <h2 className="text-xl font-bold text-primary">Key Stats</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem Icon={ListChecks} label="Lessons Completed" value={`${completedLessons}/${totalLessons}`} />
                                        <DetailItem Icon={Users} label="Instructor" value={course.instructor} />
                                        <DetailItem Icon={BookOpen} label="Credits" value={course.credits.toString()} />
                                        <DetailItem Icon={Zap} label="Prerequisites" value={course.prerequisites} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && course.modules.map(module => {
                                const isExpanded = expandedModule === module.id;
                                const ModuleIcon = BookOpen;
                                return (
                                    <div key={module.id} className="bg-primary rounded-xl shadow-md border border-textDark overflow-hidden">
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className="flex justify-between items-center p-4 w-full text-left text-gray-200 hover:bg-[#091211] transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">{module.title}</span>
                                            </div>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {isExpanded && (
                                            <div className="p-4 border-t border-gray-700 bg-light space-y-2">
                                                {module.lessons.map(lesson => {
                                                    const LessonIcon = getLessonIcon(lesson.type);
                                                    return (
                                                        <div key={lesson.id} className={`flex justify-between items-center p-3 rounded-lg transition-colors ${lesson.isCompleted ? 'bg-textDark/90 hover:bg-textDark' : 'hover:bg-textDark/90 bg-textDark'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <LessonIcon size={18} className={lesson.isCompleted ? 'text-accent' : 'text-accentDark'} />
                                                                <span className={`${lesson.isCompleted ? 'line-through text-gray-400' : 'text-white'}`}>{lesson.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={14} /> {lesson.duration}</span>
                                                                {lesson.isCompleted ? <CheckCircle size={18} className="text-accentDark" /> : <span className="text-xs text-red-400 font-medium">Pending</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 mt-6 lg:mt-0 space-y-4">
                            <div className="bg-light p-6 rounded-xl shadow-lg border border-textDark space-y-3">
                                <h3 className="text-xl font-bold text-primary border-b border-gray-700 pb-2">Course Details</h3>
                                <DetailItem Icon={Clock} label="Duration" value={course.duration} />
                                <DetailItem Icon={BookOpen} label="Total Lessons" value={totalLessons.toString()} />
                                <DetailItem Icon={Zap} label="Effort Level" value="Intermediate" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CourseDetailPage