"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");

const LetterAvatar = ({ name, size = 32, textSize = "text-sm", bgColor = "bg-secondary" }) => {
    const initial = (name || "User").trim().charAt(0).toUpperCase();

    return (
        <div
            className={`flex items-center justify-center rounded-full font-bold text-white ${bgColor} ${textSize}`}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                lineHeight: `${size}px`,
            }}
        >
            {initial}
        </div>
    );
};

export default function Header({ user, notification }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(Array.isArray(notification) ? notification : []);
    const [profile, setProfile] = useState({ name: user || "User", picture: "", role: "" });
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        let active = true;
        const userId = window.localStorage.getItem("userId");
        const role = window.localStorage.getItem("lms_role") || user || "";
        const roleKey = role.toLowerCase();
        setProfile((current) => ({ ...current, role: roleKey }));
        const profilePath = {
            admin: `/api/admin/profile/${encodeURIComponent(userId || "")}`,
            instructor: `/api/registration/instructor/profile/${encodeURIComponent(userId || "")}`,
            student: `/api/students/profile/${encodeURIComponent(userId || "")}`,
        }[roleKey];

        const loadProfile = async () => {
            if (!userId || !API_URL || !profilePath) return;
            try {
                const response = await fetch(`${API_URL}${profilePath}`, { cache: "no-store" });
                if (!response.ok) return;
                const data = await response.json();
                if (!active) return;
                const picture = data.profile_picture
                    ? (/^https?:\/\//i.test(data.profile_picture)
                        ? data.profile_picture
                        : `${API_URL}/${String(data.profile_picture).replaceAll("\\", "/").replace(/^\/+/, "")}`)
                    : "";
                setProfile({
                    name: data.full_name || data.fullname || data.name || user || "User",
                    picture,
                    role: roleKey,
                });
                setImageFailed(false);
            } catch {
                // Keep the role or name passed by the page if profile loading fails.
            }
        };

        const refreshProfile = () => loadProfile();
        loadProfile();
        window.addEventListener("lms:profile-updated", refreshProfile);
        return () => {
            active = false;
            window.removeEventListener("lms:profile-updated", refreshProfile);
        };
    }, [user]);

    const hasUnread = useMemo(() => notifications.some((n) => !n.isRead), [notifications]);

    const togglePanel = () => setIsOpen((prev) => !prev);

    const markAllRead = () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    const handleNotificationClick = (id) =>
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );

    return (
        <div className="relative">

            {/* HEADER */}
            <header className="flex items-center justify-between bg-textDark p-4 shadow-sm shadow-secondary">
                <Link
                    href={profile.role === "admin" ? "/admin" : profile.role === "student" ? "/student" : "/instructor"}
                    aria-label="Aetheron LMS home"
                    className="flex min-w-0 items-center gap-3"
                >
                    <Image
                        src="/logo.png"
                        alt="Aetheron LMS logo"
                        width={64}
                        height={64}
                        priority
                        className="h-12 w-12 shrink-0 rounded-md object-cover sm:h-14 sm:w-14"
                    />
                    <h1 className="hidden truncate text-xl font-bold text-textLight sm:block">
                        Learning Management System
                    </h1>
                </Link>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={togglePanel}
                        className="p-2 rounded-full hover:bg-secondary/30 transition-colors relative"
                    >
                        <Bell size={20} className="text-accentDark" />

                        {hasUnread && (
                            <span className="absolute top-0 right-0 h-2 w-2 rounded-full ring-2 ring-textDark bg-accentDark"></span>
                        )}
                    </button>

                    {/* USER SECTION */}
                    <Link
                        href={profile.role === "admin" ? "/admin/settings" : profile.role === "student" ? "/student/profile" : "/instructor/profile"}
                        className="flex items-center space-x-2"
                    >
                        {profile.picture && !imageFailed ? (
                            <img
                                src={profile.picture}
                                alt=""
                                onError={() => setImageFailed(true)}
                                className="h-8 w-8 rounded-full border border-white/30 object-cover"
                            />
                        ) : (
                            <LetterAvatar
                                name={profile.name}
                                size={32}
                                textSize="text-sm"
                                bgColor="bg-accentDark"
                            />
                        )}
                        <span className="max-w-40 truncate font-semibold text-textLight">{profile.name}</span>
                    </Link>
                </div>
            </header>

            <div
                className={`fixed right-0 h-full w-[350px] bg-light border-l border-secondary 
                shadow-xl transform transition-transform duration-300 z-50 flex flex-col
                ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                <div className="flex items-center justify-between p-4 bg-primary border-b border-secondary text-textLight">
                    <h3 className="font-bold">Notifications</h3>

                    {hasUnread && (
                        <button
                            onClick={markAllRead}
                            className="bg-secondary text-textLight px-3 py-1 rounded text-xs hover:bg-textDark transition"
                        >
                            Mark All Read
                        </button>
                    )}
                </div>

                <ul className="flex-1 overflow-y-auto">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            onClick={() => handleNotificationClick(n.id)}
                            className={`
                                cursor-pointer px-4 py-3 text-textDark text-sm border-b border-secondary/30
                                transition-all 
                                ${!n.isRead ?
                                    "bg-light font-semibold text-primary border-l-4 border-textDark border-b-secondary/30 pl-3"
                                    :
                                    "hover:bg-light"
                                }
                            `}
                        >
                            {n.text}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
