"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { getStoredUserId, studentFetch, formatStudentDate } from "@/lib/student-api";

export default function StudentResult() {
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view your results.");
      setLoading(false);
      return;
    }
    Promise.all([
      studentFetch(`/api/students/profile/${encodeURIComponent(userId)}`),
      studentFetch(`/api/students/${encodeURIComponent(userId)}/results`),
    ]).then(([studentProfile, assessmentResults]) => {
      setProfile(studentProfile);
      setResults(assessmentResults);
      const firstCourse = assessmentResults[0]?.course_id;
      setSelectedCourseId(String(firstCourse || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const courses = useMemo(() => Array.from(new Map(results.map((row) => [row.course_id, row])).values()), [results]);
  const selectedRows = results.filter((row) => String(row.course_id) === selectedCourseId);
  const obtained = selectedRows.reduce((sum, row) => sum + Number(row.obtained_marks || 0), 0);
  const maximum = selectedRows.reduce((sum, row) => sum + Number(row.max_marks || 0), 0);
  const percentage = maximum ? (obtained / maximum) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="mx-auto max-w-5xl space-y-6 p-6 pt-10">
          <div className="text-sm text-gray-600"><Link href="/student" className="hover:text-primary">Dashboard</Link><span className="mx-2">/</span><span className="font-medium text-gray-900">Results</span></div>
          <h1 className="flex items-center gap-3 text-2xl font-bold"><Award size={26} />Recorded Assessment Results</h1>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {loading ? <p>Loading results…</p> : null}
          {!loading && profile && <section className="grid gap-3 rounded-xl bg-white p-5 text-sm shadow sm:grid-cols-2"><p><strong>Registration no:</strong> {profile.registration_no || "—"}</p><p><strong>Student:</strong> {profile.fullname || profile.username || "—"}</p><p><strong>Father’s name:</strong> {profile.father_name || "—"}</p><p><strong>Program:</strong> {profile.program || "—"}</p><p><strong>Department:</strong> {profile.department || "—"}</p><p><strong>Current semester:</strong> {profile.semester_number ? `Semester ${profile.semester_number}` : "—"}</p></section>}
          {!loading && !results.length && !error && <section className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm">No graded assignment or quiz submissions are available yet. Official semester results are not stored in the current database.</section>}
          {courses.length > 0 && <>
            <div><label htmlFor="result-course" className="mb-2 block font-semibold">Course</label><select id="result-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="w-full max-w-lg rounded-lg border bg-white p-3">{courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.course_code ? `${course.course_code} — ` : ""}{course.course_title}</option>)}</select></div>
            <section className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mb-5 border-b pb-4"><h2 className="text-2xl font-bold">{selectedRows[0]?.course_title}</h2><p className="text-gray-600">{selectedRows[0]?.course_code || ""} {selectedRows[0]?.credits != null ? `· ${selectedRows[0].credits} credit hours` : ""}</p></div>
              <div className="mb-5 grid gap-4 sm:grid-cols-3"><Summary label="Graded assessments" value={selectedRows.length} /><Summary label="Marks earned" value={`${obtained.toFixed(2)} / ${maximum.toFixed(2)}`} /><Summary label="Recorded percentage" value={maximum ? `${percentage.toFixed(2)}%` : "—"} /></div>
              <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-primary text-white"><tr><th className="p-3 text-left">Assessment</th><th className="p-3 text-left">Type</th><th className="p-3 text-center">Marks</th><th className="p-3 text-left">Feedback</th><th className="p-3 text-left">Recorded</th></tr></thead><tbody className="divide-y">{selectedRows.map((row, index) => <tr key={`${row.assessment_type}-${row.course_id}-${index}`}><td className="p-3 font-medium">{row.assessment_title}</td><td className="p-3">{row.assessment_type}</td><td className="p-3 text-center font-semibold">{row.obtained_marks} / {row.max_marks}</td><td className="p-3">{row.feedback || "—"}</td><td className="p-3">{formatStudentDate(row.graded_at)}</td></tr>)}</tbody></table></div>
              <p className="mt-4 text-sm text-gray-500">These totals include only graded assignment and quiz submissions. Official grades and GPA are not available from the current database.</p>
            </section>
          </>}
        </div>
      </main>
    </div>
  );
}

function Summary({ label, value }) {
  return <div className="rounded-lg bg-primary p-4 text-center text-white"><p className="text-sm text-gray-300">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;
}
