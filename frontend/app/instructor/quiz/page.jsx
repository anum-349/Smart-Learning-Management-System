"use client"

import { useRouter } from "next/navigation";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import { useState } from "react";
import CreateQuizDialog from './CreateQuizDialog'
import UpdateQuizModal from "./UpdateQuizDialog";
import GradeQuizModal from "./GradeQuizDialog";

const initialNotifications = [
    { id: 1, text: "New course added", isRead: false, type: "general" },
];

const coursesData = [
    {
        course: "Programming Fundamental",
        quizsData: [
            {
                id: 1,
                title: "Hands-on Exercise No. 1",
                file: "file.pdf",
                dueDate: "Nov 14, 2025",
                totalStudents: 30,
                submissions: 10,
                fileSize: "1404.61 KB",
                totalMarks: 10.0,
            },
            {
                id: 2,
                title: "Hands-on Exercise No. 2",
                file: "file.pdf",
                dueDate: "Nov 14, 2025",
                totalStudents: 30,
                submissions: 20,
                fileSize: "1086.99 KB",
                totalMarks: 10.0,
            },
        ],
    },
    {
        course: "OOD",
        quizsData: [
            {
                id: 1,
                title: "Hands-on Exercise No. 1",
                file: "file.pdf",
                dueDate: "Nov 14, 2025",
                totalStudents: 30,
                submissions: 10,
                fileSize: "1404.61 KB",
                totalMarks: 10.0,
            },
            {
                id: 2,
                title: "Hands-on Exercise No. 2",
                file: "file.pdf",
                dueDate: "Nov 14, 2025",
                totalStudents: 30,
                submissions: 20,
                fileSize: "1086.99 KB",
                totalMarks: 10.0,
            },
        ],
    },
];

export default function Quizs() {
    const router = useRouter();
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        alert("Delete an quiz.");
    };

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Instructor"} />
            <main className="flex-1 ml-64 ">
                <Header user="Instructor" notification={initialNotifications} />
                <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Quizs</span>
                </div>

                {coursesData.map((course, idx) => (
                    <div key={idx} className="mb-10 ml-5 mr-5">

                        {/* Course Header */}
                        <div className="bg-primary text-white rounded-t-xl px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{course.course}</h2>
                            <button
                                onClick={() => setOpen(true)}
                                className="bg-[#354538] px-4 py-2 rounded"
                            >
                                Create Quiz
                            </button>

                            <CreateQuizDialog
                                isOpen={open}
                                onClose={() => setOpen(false)}
                            />
                        </div>

                        {/* Quizs Table */}
                        <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Title</th>
                                        <th className="px-6 py-3 text-left">Exercise</th>
                                        <th className="px-6 py-3 text-left">Due Date</th>
                                        <th className="px-6 py-3 text-left">Submissions</th>
                                        <th className="px-6 py-3 text-left">Total Marks</th>
                                        <th className="px-6 py-3 text-left">Update</th>
                                        <th className="px-6 py-3 text-left">Delete</th>
                                        <th className="px-6 py-3 text-left">Grade</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {course.quizsData.map((quiz) => (
                                        <tr key={quiz.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">
                                                {quiz.title}
                                            </td>

                                            <td className="px-6 py-4 text-blue-600">
                                                <a href="#" className="hover:underline">
                                                    View File
                                                </a>
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {quiz.dueDate}
                                            </td>

                                            <td className="px-6 py-4">
                                                {quiz.submissions}
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-green-600">
                                                {quiz.totalMarks.toFixed(2)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    className="text-primary hover:underline"
                                                    onClick={() => setOpen(true)}>Update</button>

                                                <UpdateQuizModal
                                                    isOpen={open}
                                                    onClose={() => setOpen(false)}
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={handleDelete}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                            <td className="px-6 py-4">
                                                 <button
                                                    className="text-primary hover:underline"
                                                    onClick={() => setOpen(true)}>Grade</button>

                                                <GradeQuizModal
                                                    isOpen={open}
                                                    onClose={() => setOpen(false)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    )
}