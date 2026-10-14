"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GradeQuizModal({ isOpen, onClose, quiz, quizId, instructorId }) {
  const id = quiz?.id || quizId;
  const maxMarks = Number(quiz?.total_marks) || 10;
  const [submissions, setSubmissions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !isOpen) return;
    setError("");
    fetch(`${API_URL}/api/quiz-submissions/quiz/${id}`).then(async (response) => {
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load submissions.");
      setSubmissions(data);
      const first = data.find((item) => item.id && item.grade === null);
      setSelectedId(first?.id ?? null); setGrade(first?.grade ?? ""); setFeedback(first?.feedback ?? "");
    }).catch((err) => setError(err.message));
  }, [id, isOpen]);

  const select = (item) => { setSelectedId(item.id); setGrade(item.grade ?? ""); setFeedback(item.feedback ?? ""); };
  const submit = async (event) => {
    event.preventDefault();
    if (!selectedId) return;
    try {
      const response = await fetch(`${API_URL}/api/quiz-submissions/${selectedId}/grade`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade: Number(grade), feedback, instructor_id: instructorId }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to save grade.");
      setSubmissions((items) => items.map((item) => item.id === selectedId ? { ...item, grade: result.grade, feedback: result.feedback, status: "Graded" } : item));
    } catch (err) { setError(err.message); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Quiz Submissions">
    {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
    {!submissions.length ? <p className="py-6 text-center text-gray-600">No quiz submissions have been received.</p> : <div className="space-y-4">
      <div className="max-h-64 overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th className="p-2">Student</th><th className="p-2">Status</th><th className="p-2">Submitted</th><th className="p-2">Grade</th></tr></thead><tbody className="divide-y">{submissions.map((item) => <tr key={item.student_id} onClick={() => item.id && select(item)} className={`${item.id ? "cursor-pointer" : ""} ${item.id === selectedId ? "bg-indigo-50" : ""}`}><td className="p-2">{item.student_name}<span className="block text-xs text-gray-500">{item.registration_no}</span></td><td className="p-2">{item.status}</td><td className="p-2">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : "—"}</td><td className="p-2">{item.id ? `${item.grade ?? "Ungraded"} / ${maxMarks}` : "—"}</td></tr>)}</tbody></table></div>
      {selectedId && <form onSubmit={submit} className="space-y-3 border-t pt-4"><label className="block text-sm">Grade (maximum {maxMarks})<input type="number" required min="0" max={maxMarks} step="0.01" value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="block text-sm">Feedback<textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label><button className="rounded bg-primary px-4 py-2 text-white">Save grade</button></form>}
    </div>}
  </Modal>;
}
