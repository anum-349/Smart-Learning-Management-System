"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Zap, CheckCircle, Notebook, List, NotepadText, ExternalLink, MessageCircle, Table
} from "lucide-react";
import NavBar from "../navbar/NavBar";
import Header from "../header/Header";

// Reusable DashboardCard
const DashboardCard = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-primary text-white p-3">
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
    </div>
);

// Reusable CourseCard
const CourseCard = ({ courseTitle, courseCode, courseBatch, courseSemester, icon: Icon, link }) => (
    <Link href={link}>
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors duration-200 mb-2 cursor-pointer">
            <div className="flex items-center">
                <Icon size={20} className="text-orange-500 mr-3" />
                <div>
                    <p className="font-semibold text-primary">{courseCode} - {courseTitle}</p>
                    <p className="text-sm text-gray-600">Batch: {courseBatch}</p>

                </div>
            </div>
            <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">Semester: {courseSemester}</p>
            </div>
        </div>
    </Link>
);

// Reusable ActivityItem
const ActivityItem = ({ icon: Icon, text, count, link }) => (
    <Link href={link} className="flex flex-col items-center text-primary hover:text-secondary transition-colors duration-200 relative">
        <Icon size={28} className="mb-1" />
        <span className="text-sm text-center">{text}</span>
        {count && <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">{count}</span>}
    </Link>
);

export default function InstructorHome() {
    const [notifications] = useState([
        { id: 1, text: "New Assignment Posted", isRead: false },
        { id: 2, text: "Quiz 2 Graded", isRead: true },
    ]);

    const [courses, setCourses] = useState([]);
    const [userId, setUserId] = useState("")

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const localStorageId = localStorage.getItem("userId");
        setUserId(localStorageId)
    }, [])

    useEffect(() => {
        if (!userId) return;
        const fetchCourses = async () => {
            try {
                const res = await fetch(`${API_URL}/instructor/courses/${userId}`);
                const data = await res.json();
                setCourses(data)
                console.log(data)
            } catch (err) {
                console.log(err)
            }
        }
        fetchCourses()
    }, [userId])
    return (
        <div className="flex bg-light min-h-screen text-primary">
            {/* Sidebar */}
            <NavBar userType={"Instructor"} />

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <Header user="Instructor" notification={notifications} />

                <div className="container mx-auto p-6 pt-10">
                    <h2 className="text-xl font-semibold mb-6">Home</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Courses */}
                        <div className="lg:col-span-2 space-y-6">
                            <DashboardCard title="My Courses">
                                {courses.map((course, i) => (
                                    <CourseCard
                                        key={i}
                                        icon={Zap}
                                        courseTitle={course.title}
                                        courseCode={course.code}
                                        courseBatch={course.batch}
                                        courseSemester={course.semester_number}
                                        link="/instructor/course"
                                    />
                                ))}
                            </DashboardCard>
                        </div>

                        {/* Right Column: Notice Board & Activities */}
                        <div className="lg:col-span-1 space-y-6">
                            <DashboardCard title="Notice Board">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <Link href="/instructor/notes" className="flex flex-col items-center text-primary hover:text-secondary">
                                        <NotepadText size={28} className="mb-1" />
                                        <span className="text-sm">Notes</span>
                                    </Link>
                                    <Link href="/instructor/timetable" className="flex flex-col items-center text-primary hover:text-secondary">
                                        <Table size={28} className="mb-1" />
                                        <span className="text-sm">Timetable</span>
                                    </Link>
                                </div>
                            </DashboardCard>

                            <DashboardCard title="My Activities">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <ActivityItem icon={CheckCircle} text="Assignments" count={4} link="/instructor/assignment" />
                                    <ActivityItem icon={Notebook} text="Quizzes" link="/instructor/quiz" />
                                    <ActivityItem icon={List} text="Attendance" link="/instructor/course/attendance" />
                                    <ActivityItem icon={MessageCircle} text="Discussion" link="/instructor/discussion" />
                                </div>
                            </DashboardCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
