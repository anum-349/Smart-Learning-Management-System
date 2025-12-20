"use client";

import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import { MapPin, Bell } from 'lucide-react';

const initialNotifications = [
    { id: 1, text: "New course added", isRead: false, type: "general" },
];

const TIME_SLOTS = ['08:00 - 09:30', '09:30 - 11:00', '11:00 - 12:30', '14:00 - 15:30'];
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const getScheduleCell = (day, time) => TIMETABLE_DATA.find(item => item.day === day && item.time === time);

export default function Timetable() {
    const [timetableData, setTimetableData] = useState([]);
    const studentId = "12"

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${studentId}/timetable`);
                const data = await res.json();
                setTimetableData(data);
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
            }
        };

        fetchTimetable();
    }, [studentId]);

    const getScheduleCell = (day, time) =>
        timetableData.find(item => item.day === day && item.time === time);

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={initialNotifications} />

                <div className="overflow-x-auto m-10 rounded-2xl border border-textDark shadow-lg">
                    <div className="grid grid-cols-6 min-w-[900px]">
                        {/* Time Column */}
                        <div className="sticky left-0 z-10 bg-light border-r border-textDark">
                            <div className="h-12 p-3 font-bold text-center border-b border-textDark bg-textDark text-white">Time</div>
                            {TIME_SLOTS.map(time => (
                                <div key={time} className="h-24 p-2 bg-primary/90 text-white flex items-center justify-center border-b border-textDark text-sm font-semibold">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {DAYS_OF_WEEK.map(day => (
                            <div key={day} className="border-r border-textDark">
                                <div className="h-12 p-3 font-bold text-center border-b border-textDark bg-textDark text-white sticky top-0 z-10">{day}</div>
                                {TIME_SLOTS.map(time => {
                                    const schedule = getScheduleCell(day, time);
                                    return (
                                        <div key={time} className="h-24 p-2 border-b border-textDark flex flex-col justify-center items-center bg-gray-50 hover:bg-accentDark group ease-in-out transition">
                                            {schedule ? (
                                                <>
                                                    <p className="font-bold text-gray-900 text-center group-hover:text-gray-200">{schedule.course}</p>
                                                    <p className="text-xs text-gray-600 group-hover:text-gray-300 flex items-center gap-1">
                                                        <MapPin size={12} /> {schedule.location}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-gray-400  group-hover:text-gray-300 text-sm text-center">-- No Class --</p>
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
