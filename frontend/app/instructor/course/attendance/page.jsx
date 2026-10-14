"use client";

import { useEffect, useMemo, useState } from "react";
import NavBar from "../../../navbar/NavBar";
import Header from "../../../header/Header";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const today = () => new Date().toISOString().slice(0, 10);

export default function InstructorAttendance() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today());
  const [roster, setRoster] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("take");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id || !API_URL) { setError(!id ? "Please sign in to view attendance." : "The backend API URL is not configured."); setLoading(false); return; }
    setInstructorId(id);
    fetch(`${API_URL}/api/instructor/courses/${id}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load courses.");
      setCourses(data); setCourseId(String(data[0]?.id || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId || !instructorId) return;
    const load = async () => {
      setError("");
      try {
        const [rosterResponse, historyResponse] = await Promise.all([
          fetch(`${API_URL}/api/attendance/course/${courseId}?instructor_id=${instructorId}&date=${date}`),
          fetch(`${API_URL}/api/attendance/course/${courseId}/history?instructor_id=${instructorId}`),
        ]);
        const rosterData = await rosterResponse.json(); const historyData = await historyResponse.json();
        if (!rosterResponse.ok || !historyResponse.ok) throw new Error(rosterData.error || historyData.error || "Unable to load attendance.");
        setRoster(rosterData); setHistory(historyData);
      } catch (err) { setError(err.message); }
    };
    load();
  }, [courseId, date, instructorId]);

  const sessions = useMemo(() => [...new Set(history.map((entry) => String(entry.attendance_date).slice(0, 10)))].sort(), [history]);
  const students = useMemo(() => {
    const byStudent = new Map();
    for (const entry of history) {
      if (!byStudent.has(entry.student_id)) byStudent.set(entry.student_id, { ...entry, sessions: {} });
      if (entry.attendance_date) byStudent.get(entry.student_id).sessions[String(entry.attendance_date).slice(0, 10)] = entry.status;
    }
    return [...byStudent.values()];
  }, [history]);

  const save = async () => {
    setSaving(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/attendance/course/${courseId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructor_id: instructorId, date, records: roster.map(({ student_id, status }) => ({ student_id, status })) }),
      });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to save attendance.");
      const historyResponse = await fetch(`${API_URL}/api/attendance/course/${courseId}/history?instructor_id=${instructorId}`);
      setHistory(await historyResponse.json());
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const course = courses.find((item) => String(item.id) === courseId);
  return <div className="flex min-h-screen bg-light text-primary"><NavBar userType="Instructor" /><main className="ml-64 flex-1"><Header user="Instructor" notification={[]} />
    <div className="p-6"><div className="mb-5 flex items-center gap-2 text-sm"><button onClick={() => router.push("/instructor")}>Dashboard</button><span>/</span><span>Attendance</span></div>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      <div className="mb-5 flex flex-wrap items-end gap-4 rounded-xl bg-white p-4 shadow-sm">
        <label className="grid gap-1 text-sm">Course<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded border px-3 py-2">{courses.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.title}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded border px-3 py-2" /></label>
        <button onClick={() => setTab("take")} className={`rounded px-4 py-2 ${tab === "take" ? "bg-primary text-white" : "border"}`}>Take attendance</button>
        <button onClick={() => setTab("view")} className={`rounded px-4 py-2 ${tab === "view" ? "bg-primary text-white" : "border"}`}>View history</button>
      </div>
      <h1 className="mb-4 text-xl font-semibold">{course?.code} · {course?.title}</h1>
      {loading ? <p>Loading courses…</p> : !courseId ? <p>No courses have been assigned to you.</p> : tab === "take" ? <section className="overflow-x-auto rounded-xl bg-white p-5 shadow-sm">
        {!roster.length ? <p>No enrolled students found for this course.</p> : <><table className="w-full text-sm"><thead><tr className="text-left"><th className="p-3">Student</th><th className="p-3">Registration</th><th className="p-3">Status for {date}</th></tr></thead><tbody className="divide-y">{roster.map((student) => <tr key={student.student_id}><td className="p-3">{student.student_name}</td><td className="p-3">{student.registration_no || "—"}</td><td className="space-x-2 p-3">{["Present", "Absent", "Leave"].map((status) => <button key={status} onClick={() => setRoster((rows) => rows.map((row) => row.student_id === student.student_id ? { ...row, status } : row))} className={`rounded px-3 py-1 ${student.status === status ? "bg-primary text-white" : "bg-gray-100"}`}>{status}</button>)}</td></tr>)}</tbody></table><div className="mt-4 flex justify-end"><button disabled={saving} onClick={save} className="rounded bg-primary px-5 py-2 text-white disabled:opacity-50">{saving ? "Saving…" : "Save attendance"}</button></div></>}
      </section> : <section className="overflow-auto rounded-xl bg-white p-5 shadow-sm">{!students.length ? <p>No attendance has been recorded for this course.</p> : <table className="min-w-full text-sm"><thead><tr><th className="sticky left-0 bg-white p-3 text-left">Student</th>{sessions.map((session) => <th key={session} className="p-3">{new Date(`${session}T00:00:00`).toLocaleDateString()}</th>)}<th className="p-3">Attendance</th></tr></thead><tbody className="divide-y">{students.map((student) => { const attended = Object.values(student.sessions).filter((status) => status === "Present").length; const rate = sessions.length ? Math.round(attended / sessions.length * 100) : 0; return <tr key={student.student_id}><td className="sticky left-0 bg-white p-3">{student.student_name}<div className="text-xs text-gray-500">{student.registration_no}</div></td>{sessions.map((session) => <td key={session} className="p-3 text-center">{student.sessions[session] || "—"}</td>)}<td className="p-3 text-center font-semibold">{rate}%</td></tr>; })}</tbody></table>}</section>}
    </div>
  </main></div>;
}
