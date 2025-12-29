"use client";

import Link from 'next/link';
import {
    Users, BookOpen, Clock,
    UserPlus,
    Layers,
    CalendarDays,
    Building2,
    Library,
    UserCheck,
    UserCog,
    GraduationCap,
    University,
} from 'lucide-react';

import Header from '../header/Header';
import NavBar from '../navbar/NavBar';
const MOCK_ADMIN_DATA = {
    totalStudents: 4125,
    totalInstructors: 154,
    totalCourses: 310,
    totalFacultys: 45,
    totalDepartments: 80,
    totalRequestsPending: 90
};

const adminName = "Sana Abbasi";

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

const initialNotifications = [
    { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
    { id: 2, text: 'New lesson added: "Advanced React Hooks"', isRead: false, type: "course" },
    { id: 3, text: "Welcome to your new dashboard!", isRead: true, type: "general" },
    { id: 4, text: "Instructor John Doe posted a new announcement.", isRead: false, type: "announcement" },
];

const AdminDashboard = () => {
    const loggedInUserName = adminName.toUpperCase();

    return (
        <div className={`bg-textDark min-h-screen text-textLight`}>

            <NavBar userType={"Admin"} />
            <main className="flex-1 ml-64">
                <Header notification={initialNotifications} user={loggedInUserName} />

                <div className="p-6">

                    <h2 className="text-2xl font-bold mb-4 text-textLight"> Key System Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                        <MetricCard
                            title="Total Students"
                            value={MOCK_ADMIN_DATA.totalStudents}
                            icon={<Users size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Faculties"
                            value={MOCK_ADMIN_DATA.totalFacultys}
                            icon={<University size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Departments"
                            value={MOCK_ADMIN_DATA.totalDepartments}
                            icon={<Building2 size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Instructors"
                            value={MOCK_ADMIN_DATA.totalInstructors}
                            icon={<UserCog size={24} className={`text-accent`} />}
                        />
                        <MetricCard
                            title="Total Courses"
                            value={MOCK_ADMIN_DATA.totalCourses}
                            icon={<BookOpen size={24} className={`text-accent`} />}
                        />
                        <div className={`p-5 rounded-xl shadow-lg border border-accent bg-accentDark/20 transition-transform duration-300 hover:scale-[1.02]`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium text-secondary`}>Applications Pending</span>
                                <UserPlus size={24} className={`text-accent`} />
                            </div>
                            <p className={`text-4xl font-extrabold text-accent mt-2`}>
                                {MOCK_ADMIN_DATA.totalRequestsPending}
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

                                {/* <QuickActionButton
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
                                /> */}

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