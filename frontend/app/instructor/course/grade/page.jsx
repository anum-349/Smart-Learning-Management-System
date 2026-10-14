"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../header/Header";
import NavBar from "../../../navbar/NavBar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function InstructorGradeEntry() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [columns, setColumns] = useState([]);
  const [marks, setMarks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id || !API_URL) { setError(!id ? "Please sign in to view grades." : "The backend API URL is not configured."); setLoading(false); return; }
    setInstructorId(id);
    fetch(`${API_URL}/api/instructor/courses/${id}`).then(async (response) => {
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to load courses.");
      setCourses(data); setCourseId(String(data[0]?.id || ""));
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!courseId || !instructorId) return;
    const loadGrades = async () => {
      setLoading(true); setError("");
      try {
        const [assignmentsResponse, quizzesResponse] = await Promise.all([
          fetch(`${API_URL}/api/assignments/instructor/${instructorId}`),
          fetch(`${API_URL}/api/quiz/course/${courseId}`),
        ]);
        const allAssignments = await assignmentsResponse.json(); const quizzes = await quizzesResponse.json();
        if (!assignmentsResponse.ok || !quizzesResponse.ok) throw new Error("Unable to load assessment grades.");
        const assignments = allAssignments.filter((item) => String(item.course_id) === courseId);
        const assessments = [
          ...assignments.map((item) => ({ ...item, kind: "assignment", label: item.title, max: Number(item.total_marks) })),
          ...quizzes.map((item) => ({ ...item, kind: "quiz", label: item.title, max: Number(item.total_marks) })),
        ];
        const details = await Promise.all(assessments.map(async (item) => {
          const url = item.kind === "assignment"
            ? `${API_URL}/api/assignments/${item.id}/submissions?instructor_id=${instructorId}`
            : `${API_URL}/api/quiz-submissions/quiz/${item.id}`;
          const response = await fetch(url); const rows = await response.json();
          if (!response.ok) throw new Error("Unable to load submissions.");
          return { item, rows };
        }));
        const students = new Map();
        for (const { item, rows } of details) {
          for (const row of rows) {
            const studentId = row.student_id;
            if (!students.has(studentId)) students.set(studentId, { student_id: studentId, student_name: row.student_name, registration_no: row.registration_no || "", marks: {} });
            students.get(studentId).marks[`${item.kind}-${item.id}`] = row.grade;
          }
        }
        setColumns(assessments); setMarks([...students.values()]);
      } catch (err) { setError(err.message); setColumns([]); setMarks([]); }
      finally { setLoading(false); }
    };
    loadGrades();
  }, [courseId, instructorId]);

  const selectedCourse = courses.find((course) => String(course.id) === courseId);
  const totals = useMemo(() => marks.map((student) => {
    const earned = columns.reduce((sum, item) => sum + (Number(student.marks[`${item.kind}-${item.id}`]) || 0), 0);
    const possible = columns.reduce((sum, item) => sum + item.max, 0);
    return { ...student, earned, possible, percentage: possible ? Math.round(earned / possible * 100) : 0 };
  }), [marks, columns]);

  return <div className="flex min-h-screen bg-light text-primary"><NavBar userType="Instructor" /><main className="ml-64 flex-1"><Header user="Instructor" notification={[]} />
    <div className="p-6"><div className="mb-5 flex items-center gap-2 text-sm"><button onClick={() => router.push("/instructor")}>Dashboard</button><span>/</span><button onClick={() => router.push("/instructor/course")}>Course</button><span>/</span><span>Grades</span></div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><h1 className="text-xl font-semibold">Grades · {selectedCourse?.code} {selectedCourse?.title}</h1><select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded border bg-white px-3 py-2">{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select></div>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      {loading ? <p>Loading grade data…</p> : !selectedCourse ? <p>No courses have been assigned to you.</p> : !columns.length ? <p className="rounded bg-white p-6 text-gray-600">No assignments, quizzes, or submitted grades for this course yet.</p> : <div className="overflow-auto rounded-xl bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-primary text-white"><tr><th className="sticky left-0 bg-primary p-3 text-left">Student</th>{columns.map((item) => <th key={`${item.kind}-${item.id}`} className="p-3 text-center">{item.label}<span className="block text-xs font-normal">/{item.max}</span></th>)}<th className="p-3">Total</th><th className="p-3">Percent</th></tr></thead><tbody className="divide-y">{totals.map((student) => <tr key={student.student_id}><td className="sticky left-0 bg-white p-3">{student.student_name}<span className="block text-xs text-gray-500">{student.registration_no}</span></td>{columns.map((item) => <td key={`${item.kind}-${item.id}`} className="p-3 text-center">{student.marks[`${item.kind}-${item.id}`] ?? "—"}</td>)}<td className="p-3 text-center font-semibold">{student.earned.toFixed(2)} / {student.possible.toFixed(2)}</td><td className="p-3 text-center">{student.percentage}%</td></tr>)}</tbody></table></div>}
      <p className="mt-3 text-xs text-gray-500">Grades shown here come from submitted quiz and assignment work.</p>
    </div></main></div>;
}
