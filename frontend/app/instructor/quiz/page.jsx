"use client"

import { useRouter } from "next/navigation";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import { useState } from "react";
import CreateQuizDialog from './CreateQuizDialog'
import UpdateQuizModal from "./UpdateQuizDialog";
import GradeQuizModal from "./GradeQuizDialog";
import { useEffect } from "react";

const initialNotifications = [
    { id: 1, text: "New course added", isRead: false, type: "general" },
];


export default function Quizs() {
    const router = useRouter();

    const [courses, setCourses] = useState([]);
    const [courseQuizzes, setCourseQuizzes] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openGrade, setOpenGrade] = useState(false);
    const [userId, setUserId] = useState(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL

    useEffect(() => {
        const storedId = localStorage.getItem("userId");
        if (storedId) setUserId(storedId);
    }, []);

    useEffect(() => {
        if (!userId) return;
        const fetchCourses = async () => {
            try {
                const res = await fetch(`${API_URL}/course-assignments/instructor/${userId}`)
                const data = await res.json()
                console.log(data)
                setCourses(data)
            } catch (err) {
                console.log(err)
            }
        }
        fetchCourses()
    }, [userId])

    const fetchAllQuizzes = async () => {
        const quizzesMap = {};
        for (const course of courses) {
            try {
                const res = await fetch(`${API_URL}/quiz/course/${course.course_id}`);
                const data = await res.json();
                console.log(data)
                quizzesMap[course.course_id] = data;
            } catch (err) {
                console.error(`Error fetching quizzes for course ${course.course_id}:`, err);
                quizzesMap[course.course_id] = [];
            }
        }
        setCourseQuizzes(quizzesMap);
    };

    useEffect(() => {
        if (!courses.length) return;
        fetchAllQuizzes();
    }, [courses]);

    const handleDelete = async (quizId, courseId) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const res = await fetch(`${API_URL}/quiz/${quizId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete quiz");
            }

            fetchAllQuizzes()

            alert("✅ Quiz deleted successfully");
        } catch (err) {
            console.error(err);
            alert("❌ " + err.message);
        }
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

                {courses.map((course, idx) => (
                    <div key={idx} className="mb-10 ml-5 mr-5">

                        {/* Course Header */}
                        <div className="bg-primary text-white rounded-t-xl px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{course.title}</h2>
                            <button
                                onClick={() => {
                                    setSelectedCourse({title: course.title,courseId: course.course_id});
                                    setOpenCreate(true);
                                }}
                                className="bg-[#354538] px-4 py-2 rounded"
                            >Create Quiz
                            </button>
                            <CreateQuizDialog
                                isOpen={openCreate}
                                courseId={selectedCourse?.courseId}
                                courseTitle={selectedCourse?.title}
                                onClose={() => { setOpenCreate(false); fetchAllQuizzes() }}
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
                                    {(courseQuizzes[course.course_id] || []).map((quiz) => (
                                        <tr key={quiz.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium">
                                                {quiz.title}
                                            </td>

                                            <td className="px-6 py-4 text-blue-600 w-64 text-sm">
                                                <a href={`http://localhost:5000/${quiz.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline">
                                                    {quiz.file_name}
                                                </a>
                                            </td>

                                            <td className="px-6 w-full py-4 text-gray-700">
                                                {quiz.deadline
                                                    ? new Date(quiz.deadline).toLocaleString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                    : "-"}
                                            </td>

                                            <td className="px-6 py-4">
                                                {quiz.submissions}
                                            </td>

                                            <td className="px-6 py-4 font-semibold text-green-600">
                                                {quiz.total_marks}
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    className="text-primary hover:underline"
                                                    onClick={() => {
                                                        setSelectedQuiz({ quiz, courseTitle: course.title });
                                                        setOpenUpdate(true);
                                                    }}
                                                >
                                                    Update
                                                </button>
                                                <UpdateQuizModal
                                                    isOpen={openUpdate}
                                                    quiz={selectedQuiz?.quiz}
                                                    course={selectedQuiz?.courseTitle}
                                                    onClose={() => {setOpenUpdate(false); fetchAllQuizzes()}}
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDelete(quiz.id, course.course_id)}
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Delete
                                                </button>
                                            </td>

                                            <td className="px-6 py-4">
                                                <button
                                                    className="text-primary hover:underline"
                                                    onClick={() => {
                                                        setSelectedQuiz(quiz);
                                                        setOpenGrade(true);
                                                    }}
                                                >
                                                    Grade
                                                </button>
                                                <GradeQuizModal
                                                    isOpen={openGrade}
                                                    quizId={selectedQuiz?.id}
                                                    onClose={() => {setOpenGrade(false); fetchAllQuizzes()}}
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