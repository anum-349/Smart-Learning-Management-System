"use client";
import Link from "next/link";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import React, { useEffect } from "react";
import {
    Bell, ChevronLeft, ChevronRight, PlusCircle, Clock, MapPin, Save, X
} from "lucide-react";

const initialNotifications = [
    { id: 1, text: "New course added", isRead: false, type: "general" },
];
const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const MOCK_EVENTS = [
    { id: 1, date: formatDate(new Date(2025, 11, 17)), title: "Grading Deadline", time: "17:00", location: "Online" },
    { id: 2, date: formatDate(new Date(2025, 11, 20)), title: "CS301 Lecture", time: "09:00", location: "Hall A1" },
    { id: 3, date: formatDate(new Date(2025, 11, 20)), title: "Office Hours", time: "14:00", location: "Room 205" },
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------ Calendar Generator (UNCHANGED) ------------------ */

const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    for (let i = firstDay.getDay(); i > 0; i--) {
        days.push(new Date(year, month, 1 - i));
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    while (days.length < 42) {
        days.push(new Date(year, month + 1, days.length - lastDay.getDate() + 1));
    }

    return days;
};

export default function Calendar() {

    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [events, setEvents] = React.useState(MOCK_EVENTS);
    const [selectedDate, setSelectedDate] = React.useState(formatDate(new Date()));
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newEvent, setNewEvent] = React.useState({ title: "", time: "", location: "" });

    const eventsOnSelectedDay = events
        .filter(e => e.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));

    const calendarDays = getCalendarDays(currentDate);
    const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const month = currentDate.getMonth() + 1;
                const year = currentDate.getFullYear();

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/${userType.toLowerCase()}s/${userId}/calendar?month=${month}&year=${year}`
                );
                const data = await response.json();

                setEvents(data);
            } catch (err) {
                console.error('Failed to fetch events:', err);
            }
        };

        fetchEvents();
    }, [currentDate, userType]);

    const handleAddEvent = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/${userType.toLowerCase()}s/${userId}/calendar`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...newEvent, date: selectedDate }),
                }
            );
            const addedEvent = await res.json();
            setEvents([...events, addedEvent]); // update local state
            setIsModalOpen(false);
            setNewEvent({ title: "", time: "", location: "" });
        } catch (err) {
            console.error(err);
            alert("Failed to add event");
        }
    }
    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Student"} />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={initialNotifications} />
                <div className="container mx-auto p-6 pt-10">
                    <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <Link href="/student" className="hover:text-accentDark">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span>Calendar</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Calendar Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">

                        {/* Month Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                                <ChevronLeft />
                            </button>
                            <h2 className="text-lg font-semibold">{monthName}</h2>
                            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                                <ChevronRight />
                            </button>
                        </div>

                        {/* Week Days */}
                        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
                            {DAYS_OF_WEEK.map(day => <div key={day}>{day}</div>)}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day, i) => {
                                const dateStr = formatDate(day);
                                const isSelected = dateStr === selectedDate;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`h-20 rounded-lg border p-2 text-sm
                                                ${isSelected ? "border-primary bg-primary/10" : "hover:bg-gray-100"}`}
                                    >
                                        <div className="font-semibold">{day.getDate()}</div>
                                        {events.filter(e => e.date === dateStr).length > 0 && (
                                            <span className="text-xs bg-primary text-white px-2 rounded-full">
                                                {events.filter(e => e.date === dateStr).length}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Events Sidebar */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Events</h3>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center text-sm text-primary"
                            >
                                <PlusCircle size={16} className="mr-1" /> Add
                            </button>
                        </div>

                        {eventsOnSelectedDay.length ? (
                            <div className="space-y-3">
                                {eventsOnSelectedDay.map(e => (
                                    <div key={e.id} className="border rounded-lg p-3">
                                        <p className="font-medium">{e.title}</p>
                                        <p className="text-sm text-gray-500 flex items-center">
                                            <Clock size={14} className="mr-1" /> {e.time}
                                        </p>
                                        {e.location && (
                                            <p className="text-sm text-gray-400 flex items-center">
                                                <MapPin size={14} className="mr-1" /> {e.location}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No events for this day.</p>
                        )}
                    </div>
                </div>
            </main>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 relative">
                        <button
                            className="absolute top-2 right-2"
                            onClick={() => setIsModalOpen(false)}
                        >
                            <X />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">Add Event</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="border p-2 rounded w-full mb-3"
                        />
                        <input
                            type="time"
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className="border p-2 rounded w-full mb-3"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="border p-2 rounded w-full mb-3"
                        />
                        <button
                            onClick={handleAddEvent}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}