"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, FileText, Users, Download } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { getStoredUserId, studentFetch, studentFileUrl, formatStudentDate } from "@/lib/student-api";

export default function StudentCoursePage() {
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view your courses.");
      setLoading(false);
      return;
    }
    const requestedId = new URLSearchParams(window.location.search).get("courseId");
    Promise.all([
      studentFetch(`/api/students/${encodeURIComponent(userId)}/courses`),
      studentFetch(`/api/students/${encodeURIComponent(userId)}/resources`),
    ]).then(([courseRows, resourceRows]) => {
      setCourses(courseRows);
      setResources(resourceRows);
      setSelectedCourseId(String(courseRows.find((course) => String(course.course_id) === requestedId)?.course_id || courseRows[0]?.course_id || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const course = courses.find((item) => String(item.course_id) === selectedCourseId);
  const courseResources = useMemo(() => resources.filter((item) => String(item.course_id) === selectedCourseId), [resources, selectedCourseId]);

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="container mx-auto space-y-6 p-6 pt-10">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Link href="/student" className="hover:text-accentDark">Dashboard</Link><span>/</span><span>Courses</span></div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {loading ? <p>Loading course information…</p> : !courses.length ? <p className="rounded-xl bg-white p-6 text-gray-600">No approved course enrollments are available.</p> : <>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-primary p-6 text-white shadow-lg">
              <div><p className="mb-2 text-sm text-gray-300">Select an enrolled course</p><select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="max-w-full rounded-lg border border-gray-500 bg-textDark px-3 py-2 text-white">{courses.map((item) => <option key={item.course_id} value={item.course_id}>{item.code ? `${item.code} — ` : ""}{item.title}</option>)}</select></div>
              <Link href={`/student/course/view-grades?courseId=${course?.course_id || ""}`} className="rounded-lg bg-textDark px-4 py-2 font-medium text-white hover:bg-black">View recorded grades</Link>
            </div>
            {course && <>
              <section className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-gray-500">{course.code || "Course"}</p><h1 className="mt-1 text-3xl font-extrabold text-textDark">{course.title}</h1><p className="mt-2 text-gray-600">Instructor: {course.instructors || "Not assigned"}</p></div><BookOpen className="text-orange-500" size={32} /></div>
                <div className="grid gap-3 sm:grid-cols-3"><Metric icon={Users} label="Instructor" value={course.instructors || "Not assigned"} /><Metric icon={BookOpen} label="Credits" value={course.credits ?? "—"} /><Metric icon={Clock} label="Semester" value={course.semester_number ? `Semester ${course.semester_number}` : "—"} /></div>
              </section>
              <div className="flex gap-4 border-b border-gray-300"><button onClick={() => setActiveTab("overview")} className={`px-4 py-2 font-semibold ${activeTab === "overview" ? "border-b-4 border-accentDark text-primary" : "text-gray-600"}`}>Overview</button><button onClick={() => setActiveTab("content")} className={`px-4 py-2 font-semibold ${activeTab === "content" ? "border-b-4 border-accentDark text-primary" : "text-gray-600"}`}>Published content ({courseResources.length})</button></div>
              {activeTab === "overview" ? <section className="rounded-xl bg-white p-6 shadow-sm"><h2 className="mb-2 text-xl font-bold">Course information</h2><p className="text-gray-600">Course materials, assignments, quizzes, attendance, and graded work for this course are loaded from your enrolled course records.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={`/student/notes?courseId=${course.course_id}`} className="rounded-lg bg-primary px-4 py-2 text-white">Course notes</Link><Link href="/student/assignment" className="rounded-lg border px-4 py-2">Assignments</Link><Link href="/student/quiz" className="rounded-lg border px-4 py-2">Quizzes</Link><Link href="/student/attendance" className="rounded-lg border px-4 py-2">Attendance</Link></div></section> : <section className="space-y-3">{courseResources.length ? courseResources.map((item) => <article key={`${item.source}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4"><div className="flex items-center gap-3"><FileText className="text-accentDark" size={20} /><div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-gray-600">{item.type || item.source} · {formatStudentDate(item.created_at)}</p></div></div>{item.file_path ? <a href={studentFileUrl(item.file_path)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><Download size={16} />{item.file_name || "Open file"}</a> : <span className="text-sm text-gray-500">No file attached</span>}</article>) : <p className="rounded-xl bg-white p-6 text-gray-600">No content has been published for this course.</p>}</section>}
            </>}
          </>}
        </div>
      </main>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <div className="flex items-center justify-between gap-2 rounded-lg bg-primary p-3 text-white"><span className="flex items-center gap-2 text-sm text-gray-300"><Icon size={18} />{label}</span><span className="text-right font-semibold">{value}</span></div>;
}
