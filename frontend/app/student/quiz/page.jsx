"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Modal from "../../../components/ui/Modal";
import { getStoredUserId, studentFetch, studentFileUrl, formatStudentDate } from "@/lib/student-api";

export default function StudentQuizzes() {
  const [userId, setUserId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadQuizzes = async (id) => setQuizzes(await studentFetch(`/api/students/${encodeURIComponent(id)}/quizzes`));

  useEffect(() => {
    const id = getStoredUserId();
    setUserId(id);
    if (!id) {
      setError("Please sign in to view quizzes.");
      setLoading(false);
      return;
    }
    loadQuizzes(id).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const groupedQuizzes = useMemo(() => quizzes.reduce((groups, quiz) => {
    const key = quiz.course_id;
    if (!groups[key]) groups[key] = { id: key, title: quiz.course_title, code: quiz.course_code, quizzes: [] };
    groups[key].quizzes.push(quiz);
    return groups;
  }, {}), [quizzes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedQuiz || !file || !userId) return;
    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("student_id", userId);
      body.append("file", file);
      await studentFetch(`/api/quiz-submissions/${selectedQuiz.id}/submit`, { method: "POST", body });
      await loadQuizzes(userId);
      setSelectedQuiz(null);
      setFile(null);
      setNotice("Quiz submission uploaded successfully.");
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
          <div className="mb-6 text-sm text-gray-600"><a href="/student" className="hover:text-primary">Dashboard</a><span className="mx-2">/</span><span className="font-medium text-gray-900">Quizzes</span></div>
          <h1 className="mb-5 text-2xl font-bold">Quizzes</h1>
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {notice && <p role="status" className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700">{notice}</p>}
          {loading ? <p>Loading quizzes…</p> : null}
          {!loading && !quizzes.length && !error ? <p className="rounded-xl bg-white p-6 text-gray-600">There are no quizzes for your enrolled courses.</p> : null}
          {Object.values(groupedQuizzes).map((course) => (
            <section key={course.id} className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <h2 className="bg-primary px-6 py-4 text-xl font-semibold text-white">{course.code ? `${course.code} — ` : ""}{course.title}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50"><tr><th className="px-5 py-3 text-left">Quiz</th><th className="px-5 py-3 text-left">Instructions</th><th className="px-5 py-3 text-left">Deadline</th><th className="px-5 py-3 text-left">Status / grade</th><th className="px-5 py-3 text-left">Submission</th><th className="px-5 py-3 text-left">Action</th></tr></thead>
                  <tbody className="divide-y">
                    {course.quizzes.map((quiz) => (
                      <tr key={quiz.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-medium">{quiz.title}<p className="mt-1 text-xs text-gray-500">Maximum: {quiz.total_marks} marks</p></td>
                        <td className="px-5 py-4">{quiz.file_path ? <a className="text-blue-600 hover:underline" href={studentFileUrl(quiz.file_path)} target="_blank" rel="noreferrer">{quiz.file_name || "Open quiz file"}</a> : quiz.description || "—"}</td>
                        <td className="px-5 py-4">{formatStudentDate(quiz.deadline)}</td>
                        <td className="px-5 py-4"><span className={quiz.status === "Graded" ? "font-semibold text-green-700" : quiz.status === "Submitted" ? "font-semibold text-blue-700" : "font-semibold text-amber-700"}>{quiz.status}</span>{quiz.grade != null && <p className="mt-1 text-gray-600">{quiz.grade} / {quiz.total_marks}{quiz.feedback ? ` · ${quiz.feedback}` : ""}</p>}</td>
                        <td className="px-5 py-4">{quiz.submitted_file_path ? <a className="text-blue-600 hover:underline" href={studentFileUrl(quiz.submitted_file_path)} target="_blank" rel="noreferrer">{quiz.submitted_file_name || "View submission"}</a> : "—"}</td>
                        <td className="px-5 py-4"><button type="button" className="flex items-center gap-2 text-primary hover:underline" onClick={() => { setSelectedQuiz(quiz); setFile(null); }}><Upload size={16} />{quiz.submission_id ? "Resubmit" : "Submit"}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
      <Modal isOpen={!!selectedQuiz} onClose={() => !submitting && setSelectedQuiz(null)} title={`Submit: ${selectedQuiz?.title || "Quiz"}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Choose the file containing your quiz response.</p>
          <input type="file" className="w-full rounded-md border border-gray-300 p-2" onChange={(event) => setFile(event.target.files?.[0] || null)} required />
          <button type="submit" disabled={!file || submitting} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit quiz"}</button>
        </form>
      </Modal>
    </div>
  );
}
