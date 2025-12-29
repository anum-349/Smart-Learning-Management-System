"use client";

import { Bell } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";

const DayCard = ({ day, data }) => (
    <div className="bg-white rounded-xl border shadow-sm mb-8">
        <div className="px-6 py-4 border-b rounded-t-xl bg-textDark">
            <h2 className="text-lg font-semibold text-light">{day}</h2>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-primary/35 text-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left">Time</th>
                        <th className="px-6 py-3 text-left">Course</th>
                        <th className="px-6 py-3 text-left">Venue</th>
                    </tr>
                </thead>

                <tbody className="divide-y">
                    {data.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-3">{row.slot}</td>
                            <td className="px-6 py-3 font-medium">{row.course_name}</td>
                            <td className="px-6 py-3">{row.venue}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const initialNotifications = [
    { id: 1, text: "New course added", isRead: false, type: "general" },
];

export default function Timetable() {
    const [timetable, setTimetable] = useState([]);
    const [userId, setUserId] = useState(null);
    const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    const router = useRouter();

    useEffect(() => {
        const storeid = localStorage.getItem("userId")
        setUserId(storeid)
    }, [])
    useEffect(() => {
        if (!userId) return;

        const fetchTimetable = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/timetable/user/${userId}`
                );
                const data = await res.json();
                console.log(data)
                setTimetable(data);
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
            }
        };

        fetchTimetable();
    }, [userId]);

    const grouped = timetable.reduce((acc, item) => {
        acc[item.day] = acc[item.day] || [];
        acc[item.day].push(item);
        return acc;
    }, {});
    console.log(timetable.reduce((acc, item) => {
        acc[item.day] = acc[item.day] || [];
        acc[item.day].push(item);
        return acc;
    }, {}))

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Instructor"} />
            <main className="flex-1 ml-64">
                <Header user="Instructor" notification={initialNotifications} />

                <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Timetable</span>
                </div>

                <div className="min-h-screen bg-gray-100">
                    {/* CONTENT */}
                    <div className="max-w-7xl mx-auto px-6 pb-10">
                        {order.map((day) => {
                            if (grouped[day]) {
                                return <DayCard key={day} day={day} data={grouped[day]} />;
                            }
                            return null;
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}
