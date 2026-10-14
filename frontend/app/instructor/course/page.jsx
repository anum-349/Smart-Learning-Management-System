"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InstructorCoursePage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [content, setContent] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id || !API_URL) { setError(!id ? "Please sign in to view your courses." : "The backend API URL is not configured."); setLoading(false); return; }
    fetch(`${API_URL}/api/instructor/courses/${id}`).then(async (response) => {
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to load courses.");
      setCourses(data); setCourseId(String(data[0]?.id || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId) { setContent([]); return; }
    fetch(`${API_URL}/api/course-contents?courseId=${courseId}`).then(async (response) => {
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load course content.");
      setContent(Array.isArray(data) ? data : []);
    }).catch((err) => setError(err.message));
  }, [courseId]);

  const selected = courses.find((course) => String(course.id) === courseId);
  return <div className="flex min-h-screen bg-light text-primary"><NavBar userType="Instructor" /><main className="ml-64 flex-1"><Header user="Instructor" notification={[]} />
    <div className="p-6"><div className="mb-5 flex items-center gap-2 text-sm"><button onClick={() => router.push("/instructor")}>Dashboard</button><span>/</span><span>Courses</span></div>
      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm"><label className="font-medium">Select course<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="ml-3 rounded border px-3 py-2">{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select></label>
        {[["Attendance", "/instructor/course/attendance"], ["Assignments", "/instructor/assignment"], ["Quizzes", "/instructor/quiz"], ["Grades", "/instructor/course/grade"]].map(([label, href]) => <button key={href} onClick={() => router.push(href)} className="rounded border border-primary px-3 py-2">{label}</button>)}</div>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      {loading ? <p>Loading courses…</p> : !selected ? <p>No courses have been assigned to you.</p> : <><h1 className="mb-4 text-2xl font-semibold">{selected.code} · {selected.title}</h1><p className="mb-6 text-gray-600">Batch: {selected.batch || "—"} · Semester: {selected.semester_number || "—"}</p>
        <section className="rounded-xl bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-semibold">Course content</h2>{content.length ? <div className="grid gap-3 md:grid-cols-2">{content.map((item) => <article key={item.id} className="rounded-lg border p-4"><div className="mb-2 flex items-center gap-2 font-medium"><FileText size={18} />{item.title}</div><p className="mb-3 text-sm text-gray-600">{item.description || item.type}</p>{item.file_url && <a href={`${API_URL}${item.file_url}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Open resource</a>}</article>)}</div> : <p className="text-gray-600">No content has been published for this course yet.</p>}</section></>}
    </div></main></div>;
}
