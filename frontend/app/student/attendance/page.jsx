"use client";

import React, { useState, useMemo } from "react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

/* ================= MOCK DATA ================= */

const STUDENT_COURSES = [
  {
    id: "C101",
    code: "CS202",
    title: "Introduction to Database Systems",
    semester: "Fall 2024",
    sessions: [
      { date: "Oct-02", status: "Present" },
      { date: "Oct-09", status: "Absent" },
      { date: "Oct-16", status: "Present" },
      { date: "Oct-23", status: "Leave" },
      { date: "Nov-02", status: "Present" },
      { date: "Nov-09", status: "Present" },
      { date: "Nov-16", status: "Absent" },
      { date: "Nov-23", status: "Present" },
      { date: "Dec-05", status: "Present" },
      { date: "Dec-12", status: "Leave" },
      { date: "Dec-19", status: "Present" },
      { date: "Dec-26", status: "Present" },
    ],
  },
  {
    id: "C102",
    code: "SE273",
    title: "Software Design & Architecture",
    semester: "Fall 2024",
    sessions: [
      { date: "Oct-03", status: "Present" },
      { date: "Oct-10", status: "Present" },
      { date: "Oct-17", status: "Present" },
      { date: "Oct-24", status: "Present" },
      { date: "Nov-03", status: "Present" },
      { date: "Nov-10", status: "Present" },
      { date: "Nov-17", status: "Present" },
      { date: "Nov-24", status: "Present" },
      { date: "Dec-06", status: "Present" },
      { date: "Dec-13", status: "Present" },
      { date: "Dec-20", status: "Present" },
      { date: "Dec-27", status: "Present" },
    ],
  },
];

/* ================= COMPONENT ================= */

export default function StudentAttendancePage() {
  const [selectedCourseId, setSelectedCourseId] = useState(
    STUDENT_COURSES[0].id
  );

  const selectedCourse =
    STUDENT_COURSES.find((c) => c.id === selectedCourseId) ||
    STUDENT_COURSES[0];

  /* ===== Attendance Evaluation ===== */
  const evaluation = useMemo(() => {
    const total = selectedCourse.sessions.length;
    const present = selectedCourse.sessions.filter(
      (s) => s.status === "Present"
    ).length;

    const percentage = Math.round((present / total) * 100);

    let status = "Eligible";
    if (percentage < 75) status = "Short Attendance";

    return { percentage, status };
  }, [selectedCourse]);

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType="Student" />

      <main className="flex-1 ml-64">
        <Header user="Student" notification={[]} />

        <div className="p-8 max-w-6xl mx-auto">

          {/* ================= HEADER ================= */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Overview
            </h1>
            <p className="text-gray-600">
              View your semester attendance course-wise
            </p>
          </div>

          {/* ================= COURSE SELECTOR ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block font-semibold text-gray-600 mb-1">
                Select Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                {STUDENT_COURSES.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-600 mb-1">
                Semester
              </label>
              <p className="p-3 bg-gray-100 rounded-lg border">
                {selectedCourse.semester}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-600 mb-1">
                Attendance Status
              </label>
              <div
                className={`p-3 rounded-lg border font-bold flex items-center gap-2
                ${
                  evaluation.status === "Eligible"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {evaluation.status === "Eligible" ? (
                  <CheckCircle size={18} />
                ) : (
                  <AlertTriangle size={18} />
                )}
                {evaluation.status}
              </div>
            </div>
          </div>

          {/* ================= ATTENDANCE TABLE ================= */}
          <div className="bg-white rounded-xl shadow-lg border overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {selectedCourse.sessions.map((session, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {session.date}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold
                        ${
                          session.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : session.status === "Absent"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= SUMMARY ================= */}
          <div className="mt-6 flex justify-end">
            <div className="bg-gray-100 border rounded-lg px-6 py-4 text-center">
              <p className="text-gray-600 font-semibold">
                Attendance Percentage
              </p>
              <p
                className={`text-2xl font-bold
                ${
                  evaluation.percentage < 75
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {evaluation.percentage}%
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
