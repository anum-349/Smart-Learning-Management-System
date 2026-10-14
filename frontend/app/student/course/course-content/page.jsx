"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import Header from "../../../header/Header";
import NavBar from "../../../navbar/NavBar";
import { getStoredUserId, studentFetch, studentFileUrl, formatStudentDate } from "@/lib/student-api";

export default function StudentCourseContent() {
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view course content.");
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

  const selectedCourse = courses.find((course) => String(course.course_id) === selectedCourseId);
  const filtered = useMemo(() => resources.filter((resource) => String(resource.course_id) === selectedCourseId), [resources, selectedCourseId]);

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="container mx-auto space-y-5 p-6 pt-10">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Link href="/student">Dashboard</Link><span>/</span><Link href="/student/course">Courses</Link><span>/</span><span>Course content</span></div>
          <h1 className="text-2xl font-bold">Course Content</h1>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          <div className="rounded-xl bg-white p-5 shadow-sm"><label htmlFor="course-content-select" className="mr-3 font-semibold">Course</label><select id="course-content-select" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="rounded-lg border p-2">{courses.length ? courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.code ? `${course.code} — ` : ""}{course.title}</option>) : <option value="">No enrolled courses</option>}</select></div>
          {loading ? <p>Loading course content…</p> : selectedCourse && <h2 className="text-xl font-semibold">{selectedCourse.title}</h2>}
          {!loading && filtered.length === 0 && !error ? <div className="rounded-xl bg-white p-10 text-center text-gray-600"><FileText size={38} className="mx-auto mb-3 opacity-40" />No content has been published for this course.</div> : null}
          <div className="space-y-3">{filtered.map((item) => <article key={`${item.source}-${item.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm"><div><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-gray-500">{item.type || item.source} · {formatStudentDate(item.created_at)}</p></div>{item.file_path ? <a href={studentFileUrl(item.file_path)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><Download size={16} />{item.file_name || "Download file"}</a> : <span className="text-sm text-gray-500">No file attached</span>}</article>)}</div>
        </div>
      </main>
    </div>
  );
}
