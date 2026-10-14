"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import CreateAssignmentDialog from "./CreateAssignmentDialog";
import UpdateAssignmentModal from "./UpdateAssignmentDialog";
import GradeAssignmentModal from "./GradeAssignmentDialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Assignments() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [dialog, setDialog] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (id) => {
    const [courseResponse, assignmentResponse] = await Promise.all([
      fetch(`${API_URL}/api/instructor/courses/${id}`),
      fetch(`${API_URL}/api/assignments/instructor/${id}`),
    ]);
    if (!courseResponse.ok || !assignmentResponse.ok) throw new Error("Unable to load assignments.");
    setCourses(await courseResponse.json());
    setAssignments(await assignmentResponse.json());
  };

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id || !API_URL) {
      setError(!id ? "Please sign in to view assignments." : "The backend API URL is not configured.");
      setLoading(false);
      return;
    }
    setInstructorId(id);
    loadData(id).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    await loadData(instructorId);
  };

  const deleteAssignment = async (assignment) => {
    if (!confirm(`Delete “${assignment.title}”?`)) return;
    const response = await fetch(`${API_URL}/api/assignments/${assignment.id}?instructor_id=${instructorId}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error || "Unable to delete assignment.");
      return;
    }
    await refresh();
  };

  const visibleCourses = selectedCourse ? courses.filter((course) => String(course.id) === selectedCourse) : courses;

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType="Instructor" />
      <main className="flex-1 ml-64">
        <Header user="Instructor" notification={[]} />
        <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
          <button onClick={() => router.push("/instructor")} className="hover:text-primary">Dashboard</button>
          <span className="mx-2">/</span><span className="font-medium text-gray-900">Assignments</span>
        </div>
        <section className="mx-5 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
          <label className="flex items-center gap-3">Course
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="rounded border px-3 py-2">
              <option value="">All courses</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}
            </select>
          </label>
          <button disabled={!courses.length} onClick={() => setDialog("create")} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50">Create Assignment</button>
        </section>
        {error && <p role="alert" className="mx-5 mb-4 text-red-600">{error}</p>}
        {loading ? <p className="p-6">Loading assignments…</p> : visibleCourses.map((course) => {
          const courseAssignments = assignments.filter((assignment) => String(assignment.course_id) === String(course.id));
          return <section key={course.id} className="mb-10 mx-5 overflow-hidden rounded-xl border bg-white shadow-sm">
            <h2 className="bg-primary px-6 py-4 text-xl font-semibold text-white">{course.code} · {course.title}</h2>
            {courseAssignments.length ? <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-gray-50"><tr>{["Title", "File", "Deadline", "Submissions", "Marks", "Actions"].map((label) => <th key={label} className="px-5 py-3 text-left">{label}</th>)}</tr></thead>
              <tbody className="divide-y">{courseAssignments.map((assignment) => <tr key={assignment.id}>
                <td className="px-5 py-3 font-medium">{assignment.title}<p className="text-xs text-gray-500">{assignment.description}</p></td>
                <td className="px-5 py-3">{assignment.file_path ? <a className="text-blue-600 underline" href={`${API_URL}/${assignment.file_path.replaceAll("\\", "/")}`} target="_blank" rel="noreferrer">{assignment.file_name || "Download"}</a> : "—"}</td>
                <td className="px-5 py-3">{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3">{assignment.submissions_count}</td>
                <td className="px-5 py-3">{assignment.total_marks}</td>
                <td className="space-x-3 whitespace-nowrap px-5 py-3">
                  <button className="text-primary underline" onClick={() => { setSelectedAssignment(assignment); setDialog("update"); }}>Edit</button>
                  <button className="text-primary underline" onClick={() => { setSelectedAssignment(assignment); setDialog("grade"); }}>Grade</button>
                  <button className="text-red-600 underline" onClick={() => deleteAssignment(assignment)}>Delete</button>
                </td>
              </tr>)}</tbody>
            </table></div> : <p className="p-6 text-gray-600">No assignments for this course.</p>}
          </section>;
        })}
        {!loading && !error && !visibleCourses.length && <p className="p-6 text-gray-600">No courses have been assigned to you.</p>}
      </main>
      <CreateAssignmentDialog isOpen={dialog === "create"} courses={courses} instructorId={instructorId} onClose={() => setDialog("")} onSaved={refresh} />
      <UpdateAssignmentModal isOpen={dialog === "update"} assignment={selectedAssignment} instructorId={instructorId} onClose={() => setDialog("")} onSaved={refresh} />
      <GradeAssignmentModal isOpen={dialog === "grade"} assignment={selectedAssignment} instructorId={instructorId} onClose={() => setDialog("")} />
    </div>
  );
}
