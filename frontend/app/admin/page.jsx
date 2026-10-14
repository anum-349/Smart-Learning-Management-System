"use client";

import Link from 'next/link';
import {
    Users, BookOpen,
    UserPlus,
    Building2,
    UserCog,
    GraduationCap,
    University,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import Header from '../header/Header';
import NavBar from '../navbar/NavBar';
const EMPTY_METRICS = {
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalFaculties: 0,
    totalDepartments: 0,
    totalRequestsPending: 0
};

const MetricCard = ({ title, value, icon }) => (
    <div className={`p-5 rounded-xl shadow-lg border border-light bg-primary/80 transition-transform duration-300 hover:scale-[1.02]`}>
        <div className="flex items-center justify-between">
            <span className={`text-sm font-medium text-secondary`}>{title}</span>
            {icon}
        </div>
        <p className={`text-4xl font-extrabold text-textLight mt-2`}>
            {value.toLocaleString()}
        </p>
    </div>
);

const QuickActionButton = ({ title, icon, href, bgColor, hoverBgColor }) => (
    <Link
        href={href}
        className={`flex flex-col items-center justify-center p-5 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.05] ${bgColor} ${hoverBgColor} text-textLight border border-secondary`}
    >
        {icon}
        <span className="mt-2 text-sm font-semibold text-center">{title}</span>
    </Link>
);

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(EMPTY_METRICS);
    const [adminName, setAdminName] = useState("Admin");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard${query}`)
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
                setMetrics({
                    totalStudents: Number(data.totalStudents || 0),
                    totalInstructors: Number(data.totalInstructors || 0),
                    totalCourses: Number(data.totalCourses || 0),
                    totalFaculties: Number(data.totalFaculties || 0),
                    totalDepartments: Number(data.totalDepartments || 0),
                    totalRequestsPending: Number(data.totalRequestsPending || 0),
                });
                setAdminName(data.name || "Admin");
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const loggedInUserName = adminName.toUpperCase();

    return (
        <div className={`bg-textDark min-h-screen text-textLight`}>

            <NavBar userType={"Admin"} />
            <main className="flex-1 ml-64">
                <Header notification={[]} user={loggedInUserName} />

                <div className="p-6">

                    <h2 className="text-2xl font-bold mb-4 text-textLight"> Key System Metrics</h2>
                    {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
                    {loading && <p className="mb-4 text-secondary">Loading dashboard data…</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                        <MetricCard
                            title="Total Students"
                            value={metrics.totalStudents}
                            icon={<Users size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Faculties"
                            value={metrics.totalFaculties}
                            icon={<University size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Departments"
                            value={metrics.totalDepartments}
                            icon={<Building2 size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Instructors"
                            value={metrics.totalInstructors}
                            icon={<UserCog size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Courses"
                            value={metrics.totalCourses}
                            icon={<BookOpen size={24} className={`text-accent`} />}
                        />
                        <div className={`p-5 rounded-xl shadow-lg border border-accent bg-accentDark/20 transition-transform duration-300 hover:scale-[1.02]`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium text-secondary`}>Enrollment Requests Pending</span>
                                <UserPlus size={24} className={`text-accent`} />
                            </div>
                            <p className={`text-4xl font-extrabold text-accent mt-2`}>
                                {metrics.totalRequestsPending}
                            </p>
                        </div>
                    </div>

                    <hr className={`border-secondary/30 my-8`} />

                    <div className="grid grid-cols-1 gap-6">
                        <div className="lg:col-span-3">
                            <h2 className="text-2xl font-bold mb-4 text-textLight"> Quick Actions</h2>
                            <div className="grid grid-cols-4 gap-4">

                                <QuickActionButton
                                    title="Manage Faculties"
                                    icon={<University size={32} />}
                                    href="/admin/faculty"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Departments"
                                    icon={<Building2 size={32} />}
                                    href="/admin/department"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Programs"
                                    icon={<Building2 size={32} />}
                                    href="/admin/program"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Batches"
                                    icon={<Building2 size={32} />}
                                    href="/admin/batch"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Semesters"
                                    icon={<Building2 size={32} />}
                                    href="/admin/semester"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Courses"
                                    icon={<Building2 size={32} />}
                                    href="/admin/courses"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Course Assignment"
                                    icon={<Building2 size={32} />}
                                    href="/admin/course-assignment"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Semester Course Assignment"
                                    icon={<Building2 size={32} />}
                                    href="/admin/semester-course-assignment"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Course Registration"
                                    icon={<Building2 size={32} />}
                                    href="/admin/registration-request"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Course Content"
                                    icon={<Building2 size={32} />}
                                    href="/admin/course-content"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Students"
                                    icon={<GraduationCap size={32} />}
                                    href="/admin/student"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <QuickActionButton
                                    title="Manage Instructors"
                                    icon={<UserCog size={32} />}
                                    href="/admin/instructor"
                                    bgColor={`bg-primary/50`}
                                    hoverBgColor={`hover:bg-primary/20`}
                                />

                                <div className="hidden lg:block"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
