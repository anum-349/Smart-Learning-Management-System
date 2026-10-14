"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Modal from "../../../components/ui/Modal";
import { getStoredUserId, studentFetch, studentFileUrl, formatStudentDate } from "@/lib/student-api";

export default function StudentAssignments() {
  const [userId, setUserId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAssignments = async (id) => {
    const data = await studentFetch(`/api/students/${encodeURIComponent(id)}/assignments`);
    setAssignments(data);
  };

  useEffect(() => {
    const id = getStoredUserId();
    setUserId(id);
    if (!id) {
      setError("Please sign in to view assignments.");
      setLoading(false);
      return;
    }
    loadAssignments(id).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const groupedAssignments = useMemo(() => assignments.reduce((groups, assignment) => {
    const key = assignment.course_id;
    if (!groups[key]) groups[key] = { id: key, title: assignment.course_title, code: assignment.course_code, assignments: [] };
    groups[key].assignments.push(assignment);
    return groups;
  }, {}), [assignments]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedAssignment || !file || !userId) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("student_id", userId);
      body.append("file", file);
      await studentFetch(`/api/assignments/${selectedAssignment.id}/submissions`, { method: "POST", body });
      await loadAssignments(userId);
      setSelectedAssignment(null);
      setFile(null);
      setNotice("Assignment submitted successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="p-6">
          <div className="mb-6 text-sm text-gray-600"><a href="/student" className="hover:text-primary">Dashboard</a><span className="mx-2">/</span><span className="font-medium text-gray-900">Assignments</span></div>
          <h1 className="mb-5 text-2xl font-bold">Assignments</h1>
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{notice}</p>}
          {loading ? <p>Loading assignments…</p> : null}
          {!loading && !assignments.length && !error ? <p className="rounded-xl bg-white p-6 text-gray-600">There are no assignments for your enrolled courses.</p> : null}
          {Object.values(groupedAssignments).map((course) => (
            <section key={course.id} className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <h2 className="bg-primary px-6 py-4 text-xl font-semibold text-white">{course.code ? `${course.code} — ` : ""}{course.title}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50"><tr><th className="px-5 py-3 text-left">Title</th><th className="px-5 py-3 text-left">Assignment file</th><th className="px-5 py-3 text-left">Due date</th><th className="px-5 py-3 text-left">Status / grade</th><th className="px-5 py-3 text-left">Submission</th><th className="px-5 py-3 text-left">Action</th></tr></thead>
                  <tbody className="divide-y">
                    {course.assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium">{assignment.title}<p className="mt-1 text-xs text-gray-500">Maximum: {assignment.total_marks} marks</p></td>
                        <td className="px-5 py-4">{assignment.file_path ? <a className="text-blue-600 hover:underline" href={studentFileUrl(assignment.file_path)} target="_blank" rel="noreferrer">{assignment.file_name || "Open assignment"}</a> : "—"}</td>
                        <td className="px-5 py-4">{formatStudentDate(assignment.deadline)}</td>
                        <td className="px-5 py-4"><span className={assignment.status === "Graded" ? "font-semibold text-green-700" : assignment.status === "Submitted" ? "font-semibold text-blue-700" : "font-semibold text-amber-700"}>{assignment.status}</span>{assignment.grade != null && <p className="mt-1 text-gray-600">{assignment.grade} / {assignment.total_marks}{assignment.feedback ? ` · ${assignment.feedback}` : ""}</p>}</td>
                        <td className="px-5 py-4">{assignment.submitted_file_path ? <a className="text-blue-600 hover:underline" href={studentFileUrl(assignment.submitted_file_path)} target="_blank" rel="noreferrer">{assignment.submitted_file_name || "View submission"}</a> : "—"}</td>
                        <td className="px-5 py-4"><button type="button" className="flex items-center gap-2 text-primary hover:underline" onClick={() => { setSelectedAssignment(assignment); setFile(null); }}><Upload size={16} />{assignment.submission_id ? "Resubmit" : "Submit"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Modal isOpen={!!selectedAssignment} onClose={() => !submitting && setSelectedAssignment(null)} title={`Submit: ${selectedAssignment?.title || "Assignment"}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Choose your submission file. A new upload replaces the previous submission.</p>
          <input type="file" className="w-full rounded-md border border-gray-300 p-2" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          <button type="submit" disabled={!file || submitting} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit assignment"}</button>
        </form>
      </Modal>
    </div>
  );
}
