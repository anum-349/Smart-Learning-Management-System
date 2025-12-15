"use client";

import { Bell } from "lucide-react";
import { useMemo, useState } from "react";

const LetterAvatar = ({ name, size = 32, textSize = "text-sm", bgColor = "bg-secondary" }) => {
    const initial = name.trim().charAt(0).toUpperCase();

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
    const [notifications, setNotifications] = useState(notification);

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
                <h1 className="text-2xl font-bold text-textLight">
                    Learning Management System
                </h1>

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
                    <div className="flex items-center space-x-2">
                        <LetterAvatar
                            name={user}
                            size={32}
                            textSize="text-sm"
                            bgColor="bg-accentDark"
                        />
                        <span className="font-semibold text-secondary">{user}</span>
                    </div>
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
