"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    BookOpen,
    Building2,
    LayoutDashboard,
    Settings,
    Users
} from "lucide-react";

const SidebarItem = ({ icon, label, href, active }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 px-6 py-3 transition ${
            active ? "bg-accentDark" : "hover:bg-accent"
        }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

export default function NavBar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-textDark text-white fixed h-full shadow-xl">
            <div className="px-6 py-5 text-xl font-bold border-b border-white/20">
                Admin Panel
            </div>

            <nav className="mt-4 space-y-1 font-medium">
                <SidebarItem
                    icon={<LayoutDashboard size={18} />}
                    label="Dashboard"
                    href="/admin"
                    active={pathname === "/admin"}
                />
                <SidebarItem
                    icon={<Users size={18} />}
                    label="Faculties"
                    href="/admin/faculty"
                    active={pathname === "/admin/faculty"}
                />
                <SidebarItem
                    icon={<Building2 size={18} />}
                    label="Departments"
                    href="/admin/department"
                    active={pathname === "/admin/department"}
                />
                <SidebarItem
                    icon={<BookOpen size={18} />}
                    label="Programs"
                    href="/admin/program"
                    active={pathname === "/admin/program"}
                />
                <SidebarItem
                    icon={<Users size={18} />}
                    label="Batches"
                    href="/admin/batch"
                    active={pathname === "/admin/batch"}
                />
                <SidebarItem
                    icon={<Users size={18} />}
                    label="Semester"
                    href="/admin/semester"
                    active={pathname === "/admin/semester"}
                />
                <SidebarItem
                    icon={<Settings size={18} />}
                    label="Settings"
                    href="/admin/settings"
                    active={pathname === "/admin/settings"}
                />
            </nav>
        </aside>
    );
}
