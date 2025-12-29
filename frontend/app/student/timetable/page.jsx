"use client";

import { useEffect, useState } from "react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import { MapPin } from "lucide-react";

// Optional: You can extract all unique time slots from backend if needed
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function StudentTimetable() {
    const [timetableData, setTimetableData] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : 5;
    const userId = 5

    useEffect(() => {
        if (!userId) return;

        const fetchTimetable = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/timetable/student/${userId}`);
                const data = await res.json();

                // Extract unique time slots dynamically
                const slots = Array.from(new Set(data.map(item => item.time))).sort(
                    (a, b) => a.localeCompare(b)
                );

                setTimeSlots(slots);
                setTimetableData(data);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
                setIsLoading(false);
            }
        };

        fetchTimetable();
    }, [userId]);

    const getScheduleCell = (day, time) =>
        timetableData.find(item => item.day === day && item.time === time);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-primary bg-light">
                <p>Loading timetable...</p>
            </div>
        );
    }

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={[]} />

                <div className="overflow-x-auto m-10 rounded-2xl border border-textDark shadow-lg">
                    <div className={`grid grid-cols-${DAYS_OF_WEEK.length + 1} min-w-[900px]`}>
                        {/* Time Column */}
                        <div className="sticky left-0 z-10 bg-light border-r border-textDark">
                            <div className="h-12 p-3 font-bold text-center border-b border-textDark bg-textDark text-white">Time</div>
                            {timeSlots.map(time => (
                                <div
                                    key={time}
                                    className="h-24 p-2 bg-primary/90 text-white flex items-center justify-center border-b border-textDark text-sm font-semibold"
                                >
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="border-r border-textDark">
                                <div className="h-12 p-3 font-bold text-center border-b border-textDark bg-textDark text-white sticky top-0 z-10">
                                    {day}
                                </div>
                                {timeSlots.map(time => {
                                    const schedule = getScheduleCell(day, time);
                                    return (
                                        <div
                                            key={time}
                                            className="h-24 p-2 border-b border-textDark flex flex-col justify-center items-center bg-gray-50 hover:bg-accentDark group ease-in-out transition"
                                        >
                                            {schedule ? (
                                                <>
                                                    <p className="font-bold text-gray-900 text-center group-hover:text-gray-200">
                                                        {schedule.course}
                                                    </p>
                                                    <p className="text-xs text-gray-600 group-hover:text-gray-300 flex items-center gap-1">
                                                        <MapPin size={12} /> {schedule.location}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-gray-400 group-hover:text-gray-300 text-sm text-center">
                                                    -- No Class --
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
