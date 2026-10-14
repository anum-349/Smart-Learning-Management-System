"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { getStoredUserId, studentFetch, studentFileUrl, formatStudentDate } from "@/lib/student-api";

const badgeColors = {
  lecture: "bg-blue-100 text-blue-800",
  assignment: "bg-green-100 text-green-800",
  quiz: "bg-purple-100 text-purple-800",
};

export default function StudentNotesPage() {
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view course resources.");
      setLoading(false);
      return;
    }
    Promise.all([
      studentFetch(`/api/students/${encodeURIComponent(userId)}/courses`),
      studentFetch(`/api/students/${encodeURIComponent(userId)}/resources`),
    ]).then(([courseRows, resourceRows]) => {
      setCourses(courseRows);
      setResources(resourceRows);
      setSelectedCourseId((current) => current || String(courseRows[0]?.course_id || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const selectedCourse = courses.find((course) => String(course.course_id) === selectedCourseId);
  const filteredResources = useMemo(() => resources.filter((resource) => String(resource.course_id) === selectedCourseId), [resources, selectedCourseId]);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-slate-800">
      <NavBar userType="Student" />
      <main className="ml-64 flex flex-1 flex-col">
        <Header user="Student" notification={[]} />
        <div className="container mx-auto space-y-5 p-6 pt-10">
          <div className="text-sm text-gray-600"><a href="/student" className="hover:text-primary">Dashboard</a><span className="mx-2">/</span><span className="font-medium text-gray-900">Course resources</span></div>
          <h1 className="text-2xl font-bold">Course Notes & Resources</h1>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          <section className="flex flex-col gap-3 rounded-lg bg-white p-5 shadow sm:flex-row sm:items-center">
            <label htmlFor="course-select" className="font-semibold text-gray-700">Course</label>
            <select id="course-select" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-textDark" disabled={!courses.length}>
              {courses.length ? courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.code ? `${course.code} — ` : ""}{course.title}</option>) : <option value="">No enrolled courses</option>}
            </select>
          </section>
          <section className="overflow-hidden rounded-lg bg-white shadow">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-semibold text-gray-800">{selectedCourse?.title || "Published resources"}</h2>
              <span className="text-sm text-gray-500">{filteredResources.length} items</span>
            </div>
            {loading ? <p className="p-8 text-center text-gray-600">Loading resources…</p> : filteredResources.length === 0 ? (
              <div className="p-10 text-center text-gray-600"><FileText size={40} className="mx-auto mb-3 opacity-40" />No resources have been published for this course.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-primary text-light"><tr><th className="px-6 py-3 text-left">Title</th><th className="px-6 py-3 text-left">Type</th><th className="px-6 py-3 text-left">File</th><th className="px-6 py-3 text-left">Published</th></tr></thead>
                  <tbody className="divide-y text-primary/90">{filteredResources.map((resource) => {
                    const type = resource.type || resource.source;
                    const color = badgeColors[String(type).toLowerCase()] || "bg-gray-100 text-gray-700";
                    return <tr key={`${resource.source}-${resource.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{resource.title}</td>
                      <td className="px-6 py-3"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{type}</span></td>
                      <td className="px-6 py-3">{resource.file_path ? <a href={studentFileUrl(resource.file_path)} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">{resource.file_name || "Open file"}</a> : "—"}</td>
                      <td className="px-6 py-3 text-gray-600">{formatStudentDate(resource.created_at)}</td>
                    </tr>;
                  })}</tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
