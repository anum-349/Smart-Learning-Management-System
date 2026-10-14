"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart2 } from "lucide-react";
import NavBar from "../../../navbar/NavBar";
import Header from "../../../header/Header";
import { getStoredUserId, studentFetch, formatStudentDate } from "@/lib/student-api";

export default function CourseGradeDetails() {
  const [results, setResults] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view your grades.");
      setLoading(false);
      return;
    }
    const requestedCourse = new URLSearchParams(window.location.search).get("courseId");
    studentFetch(`/api/students/${encodeURIComponent(userId)}/results`)
      .then((rows) => {
        setResults(rows);
        const validId = rows.find((row) => String(row.course_id) === requestedCourse)?.course_id;
        setCourseId(String(validId || rows[0]?.course_id || ""));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const courses = useMemo(() => Array.from(new Map(results.map((row) => [row.course_id, row])).values()), [results]);
  const rows = results.filter((result) => String(result.course_id) === courseId);
  const earned = rows.reduce((sum, row) => sum + Number(row.obtained_marks || 0), 0);
  const total = rows.reduce((sum, row) => sum + Number(row.max_marks || 0), 0);

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="mx-auto max-w-6xl space-y-5 p-6 pt-10">
          <div className="flex items-center gap-2 text-sm text-gray-600"><Link href="/student">Dashboard</Link><span>/</span><Link href="/student/course">Courses</Link><span>/</span><span>Recorded grades</span></div>
          <h1 className="flex items-center gap-3 text-3xl font-bold"><BarChart2 size={30} />Course Performance</h1>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {loading ? <p>Loading grades…</p> : null}
          {!loading && !results.length && !error && <div className="rounded-xl bg-white p-8 text-center text-gray-600">There are no graded submissions yet. Official final grades are not stored in the current database.</div>}
          {courses.length > 0 && <>
            <select value={courseId} onChange={(event) => setCourseId(event.target.value)} className="w-full max-w-lg rounded-lg border bg-white p-3">{courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.course_code ? `${course.course_code} — ` : ""}{course.course_title}</option>)}</select>
            <section className="space-y-6 rounded-xl border border-textDark bg-white p-6 shadow-xl">
              <header className="border-b pb-4"><h2 className="text-2xl font-extrabold">{rows[0]?.course_title}</h2><p className="mt-1 text-gray-600">{rows[0]?.course_code || ""} · {rows[0]?.credits ?? "—"} credit hours</p></header>
              <div className="grid gap-4 sm:grid-cols-3"><Metric label="Graded items" value={rows.length} /><Metric label="Marks earned" value={`${earned.toFixed(2)} / ${total.toFixed(2)}`} /><Metric label="Recorded percentage" value={total ? `${((earned / total) * 100).toFixed(2)}%` : "—"} /></div>
              <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-300"><thead className="bg-primary text-white"><tr><th className="px-4 py-3 text-left">Assessment</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-center">Maximum</th><th className="px-4 py-3 text-center">Earned</th><th className="px-4 py-3 text-left">Feedback</th><th className="px-4 py-3 text-left">Date</th></tr></thead><tbody className="divide-y">{rows.map((row, index) => <tr key={`${row.assessment_type}-${row.course_id}-${index}`}><td className="px-4 py-3 font-medium">{row.assessment_title}</td><td className="px-4 py-3">{row.assessment_type}</td><td className="px-4 py-3 text-center">{row.max_marks}</td><td className="px-4 py-3 text-center font-bold text-accent">{row.obtained_marks}</td><td className="px-4 py-3">{row.feedback || "—"}</td><td className="px-4 py-3">{formatStudentDate(row.graded_at)}</td></tr>)}</tbody></table></div>
              <p className="text-sm italic text-gray-500">Only recorded graded assignments and quizzes are included. The database does not contain final course grades or an assessment weighting policy.</p>
            </section>
          </>}
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-lg bg-primary p-4 text-center text-white"><p className="text-sm text-gray-300">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}
