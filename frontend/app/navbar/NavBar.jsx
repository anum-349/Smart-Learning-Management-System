"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Table, Calendar, LogOut, Settings, LayoutDashboard, Users, Building2, BookOpen } from "lucide-react";

const SidebarItem = ({ icon, label, href, active }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-6 py-3 transition ${active ? "bg-accentDark" : "hover:bg-accent"
            }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const AdminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Users, label: "Faculties", href: "/admin/faculty" },
    { icon: Building2, label: "Departments", href: "/admin/department" },
    { icon: BookOpen, label: "Programs", href: "/admin/program" },
    { icon: Users, label: "Batches", href: "/admin/batch" },
    { icon: Users, label: "Semester", href: "/admin/semester" },
    { icon: LogOut, label: "Logout", href: "/login" },
];

const InstructorLinks = [
    { icon: Home, label: "Dashboard", href: "/instructor" },
    { icon: User, label: "Profile", href: "/instructor/profile" },
    { icon: Table, label: "Timetable", href: "/instructor/timetable" },
    { icon: Calendar, label: "Calendar", href: "/instructor/calendar" },
    { icon: LogOut, label: "Logout", href: "/login" },
];

const StudentLinks = [
    { icon: Home, label: "Dashboard", href: "/student" },
    { icon: User, label: "Profile", href: "/student/profile" },
    { icon: Table, label: "Timetable", href: "/student/timetable" },
    { icon: Calendar, label: "Calendar", href: "/student/calendar" },
    { icon: LogOut, label: "Logout", href: "/login" },
];


export default function NavBar({ userType }) {
    const pathname = usePathname();

    const links = userType === "Admin"
        ? AdminLinks
        : userType === "Instructor"
            ? InstructorLinks
            : StudentLinks;

    return (
        <aside className="w-64 bg-textDark text-white fixed h-full shadow-xl">
            <div className="px-6 py-5 text-xl font-bold border-b border-white/20">
                {userType} Panel
            </div>

            <nav className="mt-4 space-y-1 font-medium">
                {links.map((link) =>
                    "href" in link && "icon" in link ? (
                        <SidebarItem
                            key={link.href}
                            icon={<link.icon size={18} />}
                            label={link.label}
                            href={link.href}
                            active={pathname === link.href}
                        />
                    ) : null
                )}
            </nav>
        </aside>
    );
}
