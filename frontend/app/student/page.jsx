"use client";

import Link from "next/link";
import {
    BookOpen,
    CheckCircle,
    Notebook,
    List,
    MessageCircle,
    Table,
    GraduationCap
} from "lucide-react";

import NavBar from "../navbar/NavBar";
import Header from "../header/Header";

/* ---------------- Dummy Data ---------------- */

const dummyStudent = {
    firstName: "Anum",
    lastName: "Kousar",
    email: "anum.kousar@example.com",
    enrollments: [
        {
            courseId: "CSC-101",
            code: "CSC-101",
            title: "Introduction to Computer Science",
            semester: 1,
            instructor: { firstName: "Theresa", lastName: "Flores" }
        },
        {
            courseId: "CSC-102",
            code: "CSC-102",
            title: "Data Structures & Algorithms",
            semester: 1,
            instructor: { firstName: "John", lastName: "Doe" }
        },
        {
            courseId: "MATH-101",
            code: "MATH-101",
            title: "Calculus I",
            semester: 1,
            instructor: { firstName: "Alice", lastName: "Smith" }
        }
    ]
};

const notifications = [
    { id: 1, text: "Assignment due tomorrow", isRead: false },
    { id: 2, text: "Quiz schedule updated", isRead: true }
];

/* ---------------- Reusable Components ---------------- */

const DashboardCard = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-primary text-white p-3">
            <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const CourseCard = ({
    courseTitle,
    courseCode,
    instructor,
    semester,
    icon: Icon,
    link
}) => (
    <Link href={link}>
        <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition cursor-pointer mb-2">
            <div className="flex items-center">
                <Icon size={20} className="text-orange-500 mr-3" />
                <div>
                    <p className="font-semibold text-primary">
                        {courseCode} – {courseTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                        Instructor: {instructor}
                    </p>
                </div>
            </div>
            <p className="text-sm text-gray-600">Semester {semester}</p>
        </div>
    </Link>
);

const ActivityItem = ({ icon: Icon, text, count, link }) => (
    <Link
        href={link}
        className="flex flex-col items-center text-primary hover:text-secondary transition relative"
    >
        <Icon size={28} className="mb-1" />
        <span className="text-sm text-center">{text}</span>
        {count && (
            <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">
                {count}
            </span>
        )}
    </Link>
);

/* ---------------- Student Dashboard ---------------- */

export default function StudentDashboard() {
    return (
        <div className="flex bg-light min-h-screen text-primary">
            {/* Sidebar */}
            <NavBar userType="Student" />

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <Header user="Student" notification={notifications} />

                <div className="container mx-auto p-6 pt-10">
                    <h2 className="text-xl font-semibold mb-6">
                        Welcome, {dummyStudent.firstName}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column – Courses */}
                        <div className="lg:col-span-2 space-y-6">
                            <DashboardCard title="My Enrolled Courses">
                                {dummyStudent.enrollments.map((course, i) => (
                                    <CourseCard
                                        key={i}
                                        icon={BookOpen}
                                        courseTitle={course.title}
                                        courseCode={course.code}
                                        instructor={`${course.instructor.firstName} ${course.instructor.lastName}`}
                                        semester={course.semester}
                                        link="/student/course"
                                    />
                                ))}
                            </DashboardCard>
                        </div>

                        {/* Right Column – Notices & Activities */}
                        <div className="lg:col-span-1 space-y-6">
                            <DashboardCard title="Student Notice Board">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <ActivityItem icon={Table} text="Timetable" link="/student/timetable" />
                                    <ActivityItem icon={GraduationCap} text="Results" link="/student/result" />
                                </div>
                            </DashboardCard>

                            <DashboardCard title="My Activities">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <ActivityItem
                                        icon={CheckCircle}
                                        text="Assignments"
                                        count={3}
                                        link="/student/assignment"
                                    />
                                    <ActivityItem
                                        icon={Notebook}
                                        text="Quizzes"
                                        count={1}
                                        link="/student/quiz"
                                    />
                                    <ActivityItem
                                        icon={List}
                                        text="Attendance"
                                        link="/student/attendance"
                                    />
                                    <ActivityItem
                                        icon={MessageCircle}
                                        text="Discussions"
                                        link="/student/discussion"
                                    />
                                </div>
                            </DashboardCard>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
