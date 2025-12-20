"use client"

import { useRouter } from "next/navigation";
import Header from "../header/Header";
import NavBar from "../navbar/NavBar";
import { useEffect, useState } from "react";

const initialNotifications = [
    { id: 1, text: "New course added", isRead: false, type: "general" },
];

const dummyStudent = {
  _id: "stu-001",
  userName: "anumkousar",
  firstName: "Anum",
  lastName: "Kousar",
  email: "anum.kousar@example.com",
  enrollments: [
    {
      courseId: "csc-101",
      code: "CSC-101",
      title: "Introduction to Computer Science",
      creditHour: 3,
      department: { _id: "dept-001", name: "Computer Science" },
      instructor: { _id: "inst-001", firstName: "Theresa", lastName: "Flores" },
      grade: "A",
      semester: 1,
      enrolledAt: "2025-01-10T10:00:00Z",
    },
    {
      courseId: "csc-102",
      code: "CSC-102",
      title: "Data Structures and Algorithms",
      creditHour: 3,
      department: { _id: "dept-001", name: "Computer Science" },
      instructor: { _id: "inst-002", firstName: "John", lastName: "Doe" },
      grade: "B+",
      semester: 1,
      enrolledAt: "2025-01-11T10:00:00Z",
    },
    {
      courseId: "math-101",
      code: "MATH-101",
      title: "Calculus I",
      creditHour: 4,
      department: { _id: "dept-002", name: "Mathematics" },
      instructor: { _id: "inst-003", firstName: "Alice", lastName: "Smith" },
      grade: "A-",
      semester: 1,
      enrolledAt: "2025-01-12T10:00:00Z",
    },
  ]
}

export default function StudentDashboard() {
    const [student, setStudent] = useState(dummyStudent);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const fetchStudent = async () => {
        // try {
        //     setLoading(true);
        //     const res = await fetch("http://localhost:5000/api/student/me", {
        //         headers: {
        //             "Content-Type": "application/json",
        //             Authorization: "Bearer lms", // replace with real token
        //         },
        //     });
        //     if (!res.ok) throw new Error("Failed to fetch student");
        //     const data: Student = await res.json();
        //     setStudent(data);
        // } catch (err) {
        //     console.error(err);
        //     alert("Error fetching student data");
        // } finally {
        //     setLoading(false);
        // }
    };

    useEffect(() => {
        fetchStudent();
    }, []);

    if (loading) return <p className="text-center mt-10 text-lg">Loading your dashboard...</p>;
    if (!student) return <p className="text-center mt-10 text-lg">No student data found.</p>;

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={initialNotifications} />
                <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
                        <h2 className="text-xl font-bold mb-2">Profile Information</h2>
                        <p><strong>Name:</strong> {student.firstName} {student.lastName}</p>
                        <p><strong>Username:</strong> {student.userName}</p>
                        <p><strong>Email:</strong> {student.email}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-bold mb-4">Enrolled Courses</h2>
                        {student.enrollments.length === 0 ? (
                            <p className="text-gray-600">You are not enrolled in any courses yet.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {student.enrollments.map((enroll) => (
                                    <div key={enroll.courseId} className="p-4 border rounded-xl shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
                                    onClick={()=> router.push("/student/course")}>
                                        <h3 className="font-bold text-lg">{enroll.title}</h3>
                                        <p className="text-sm text-gray-600">{enroll.code}</p>
                                        <p className="text-sm"><strong>Department:</strong> {enroll.department?.name || "N/A"}</p>
                                        <p className="text-sm"><strong>Instructor:</strong> {enroll.instructor ? `${enroll.instructor.firstName} ${enroll.instructor.lastName}` : "N/A"}</p>
                                        <p className="text-sm"><strong>Semester:</strong> {enroll.semester}</p>
                                        <p className="text-sm"><strong>Grade:</strong> {enroll.grade}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}