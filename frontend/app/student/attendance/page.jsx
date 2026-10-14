"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { getStoredUserId, studentFetch, formatStudentDate } from "@/lib/student-api";

export default function StudentAttendancePage() {
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view your attendance.");
      setLoading(false);
      return;
    }
    Promise.all([
      studentFetch(`/api/students/${encodeURIComponent(userId)}/courses`),
      studentFetch(`/api/students/${encodeURIComponent(userId)}/attendance`),
    ]).then(([courseRows, attendanceRows]) => {
      setCourses(courseRows);
      setAttendance(attendanceRows);
      setSelectedCourseId((current) => current || String(courseRows[0]?.course_id || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const selectedCourse = courses.find((course) => String(course.course_id) === selectedCourseId);
  const sessions = useMemo(() => attendance.filter((item) => String(item.course_id) === selectedCourseId && item.session_id), [attendance, selectedCourseId]);
  const presentCount = sessions.filter((session) => session.status === "Present").length;
  const percentage = sessions.length ? Math.round((presentCount / sessions.length) * 100) : 0;
  const eligibility = sessions.length ? (percentage >= 75 ? "Eligible" : "Short Attendance") : "No sessions recorded";

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="mx-auto max-w-6xl p-8">
          <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Attendance Overview</h1><p className="text-gray-600">Your recorded attendance by enrolled course</p></div>
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {loading ? <p>Loading attendance…</p> : null}
          {!loading && courses.length === 0 && !error ? <p className="rounded-xl bg-white p-6 text-gray-600">No approved course enrollments are available.</p> : null}
          {courses.length > 0 && (
            <>
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="attendance-course" className="mb-1 block font-semibold text-gray-600">Select course</label>
                  <select id="attendance-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="w-full rounded-lg border p-3">
                    {courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.code || "Course"} — {course.title}</option>)}
                  </select>
                </div>
                <div><label className="mb-1 block font-semibold text-gray-600">Semester</label><p className="rounded-lg border bg-gray-100 p-3">{selectedCourse?.semester_number ? `Semester ${selectedCourse.semester_number}` : "—"}</p></div>
                <div><label className="mb-1 block font-semibold text-gray-600">Attendance status</label><div className={`flex items-center gap-2 rounded-lg border p-3 font-bold ${eligibility === "Eligible" ? "bg-green-50 text-green-700" : eligibility === "Short Attendance" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-700"}`}>{eligibility === "Eligible" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}{eligibility}</div></div>
              </div>
              <div className="overflow-x-auto rounded-xl border bg-white shadow-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100"><tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-center">Status</th></tr></thead>
                  <tbody className="divide-y divide-gray-200">
                    {sessions.length ? sessions.map((session) => {
                      const status = session.status || "Unmarked";
                      const color = status === "Present" ? "bg-green-100 text-green-700" : status === "Absent" ? "bg-red-100 text-red-700" : status === "Leave" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700";
                      return <tr key={session.session_id} className="hover:bg-gray-50"><td className="px-4 py-3 font-medium">{formatStudentDate(session.session_date)}</td><td className="px-4 py-3 text-center"><span className={`rounded-full px-3 py-1 text-sm font-bold ${color}`}>{status}</span></td></tr>;
                    }) : <tr><td colSpan={2} className="p-6 text-center text-gray-500">No attendance sessions have been recorded for this course.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end"><div className="rounded-lg border bg-gray-100 px-6 py-4 text-center"><p className="font-semibold text-gray-600">Attendance percentage</p><p className={`text-2xl font-bold ${percentage < 75 ? "text-red-600" : "text-green-600"}`}>{sessions.length ? `${percentage}%` : "—"}</p><p className="text-sm text-gray-500">{presentCount} present of {sessions.length} sessions</p></div></div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
