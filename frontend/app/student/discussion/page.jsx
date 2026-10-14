"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, Plus, Filter, X } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { getStoredUserId, studentFetch, formatStudentDate } from "@/lib/student-api";

const roleName = (role) => String(role || "Student").toLowerCase() === "instructor" ? "Instructor" : "Student";

function Avatar({ name }) {
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-indigo-100 text-xs font-bold text-indigo-700">{name?.charAt(0)?.toUpperCase() || "?"}</div>;
}

function RoleBadge({ role }) {
  const instructor = roleName(role) === "Instructor";
  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${instructor ? "bg-primary text-white" : "border bg-gray-100 text-gray-600"}`}>{roleName(role)}</span>;
}

export default function StudentDiscussionPage() {
  const [userId, setUserId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [threads, setThreads] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [reply, setReply] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadThreads = async (id) => setThreads(await studentFetch(`/api/discussions/student/${encodeURIComponent(id)}`));

  useEffect(() => {
    const id = getStoredUserId();
    setUserId(id);
    if (!id) {
      setError("Please sign in to view course discussions.");
      setLoading(false);
      return;
    }
    Promise.all([
      studentFetch(`/api/students/${encodeURIComponent(id)}/courses`),
      studentFetch(`/api/discussions/student/${encodeURIComponent(id)}`),
    ]).then(([courseRows, threadRows]) => {
      setCourses(courseRows);
      setThreads(threadRows);
      setSelectedCourseId(String(courseRows[0]?.course_id || ""));
      setActiveThreadId(threadRows[0]?.id || null);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const filteredThreads = useMemo(() => threads.filter((thread) => !selectedCourseId || String(thread.course_id) === selectedCourseId), [threads, selectedCourseId]);
  const activeThread = filteredThreads.find((thread) => thread.id === activeThreadId) || filteredThreads[0] || null;

  const refreshThreads = async (focusId) => {
    const rows = await studentFetch(`/api/discussions/student/${encodeURIComponent(userId)}`);
    setThreads(rows);
    if (focusId) setActiveThreadId(focusId);
  };

  const handleCreateThread = async (event) => {
    event.preventDefault();
    if (!userId || !selectedCourseId || !newTitle.trim() || !newContent.trim()) return;
    setSaving(true);
    setError("");
    try {
      const created = await studentFetch("/api/discussions/student/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: selectedCourseId, author_id: userId, title: newTitle.trim(), content: newContent.trim() }),
      });
      await refreshThreads(created.id);
      setNewTitle("");
      setNewContent("");
      setShowNewThread(false);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!reply.trim() || !activeThread || !userId) return;
    setSaving(true);
    setError("");
    try {
      await studentFetch(`/api/discussions/threads/${activeThread.id}/student-replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author_id: userId, content: reply.trim() }),
      });
      setReply("");
      await refreshThreads(activeThread.id);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex flex-1 flex-col">
        <Header user="Student" notification={[]} />
        <div className="p-6">
          <div className="mb-5 text-sm text-gray-600"><a href="/student" className="hover:text-primary">Dashboard</a><span className="mx-2">/</span><span className="font-medium text-gray-900">Discussion</span></div>
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3"><h1 className="text-2xl font-bold">Course Discussion</h1><div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2"><Filter size={16} className="text-gray-400" /><select value={selectedCourseId} onChange={(event) => { setSelectedCourseId(event.target.value); setActiveThreadId(null); }} className="bg-transparent text-sm outline-none"><option value="">All enrolled courses</option>{courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.code ? `${course.code} — ` : ""}{course.title}</option>)}</select></div></div>
            <button type="button" onClick={() => setShowNewThread(true)} disabled={!courses.length} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white shadow disabled:opacity-50"><Plus size={18} />New thread</button>
          </div>
          {loading ? <p>Loading discussions…</p> : !courses.length ? <p className="rounded-xl bg-white p-6 text-gray-600">Join an approved course to participate in its discussions.</p> : (
            <div className="flex min-h-[560px] gap-5">
              <div className="w-80 shrink-0 overflow-y-auto rounded-xl border bg-white shadow-sm">
                {filteredThreads.map((thread) => <button type="button" key={thread.id} onClick={() => setActiveThreadId(thread.id)} className={`block w-full border-b p-4 text-left ${activeThread?.id === thread.id ? "border-l-4 border-l-indigo-600 bg-indigo-50" : "hover:bg-gray-50"}`}><span className="block font-semibold text-sm">{thread.title}</span><span className="mt-1 block text-xs text-gray-500">{thread.author} · {thread.course_title}</span><span className="mt-1 block text-xs text-gray-400">{formatStudentDate(thread.created_at)}</span></button>)}
                {!filteredThreads.length && <p className="p-5 text-sm text-gray-500">No discussion threads for this course yet.</p>}
              </div>
              <section className="flex min-w-0 flex-1 flex-col rounded-xl border bg-white shadow-sm">
                {activeThread ? <>
                  <header className="border-b bg-gray-50 p-4"><h2 className="font-bold">{activeThread.title}</h2><p className="text-xs text-gray-500">{activeThread.course_title} · {formatStudentDate(activeThread.created_at)}</p></header>
                  <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    <article className="flex gap-3"><Avatar name={activeThread.author} /><div><div className="mb-1 flex items-center gap-2"><strong className="text-sm">{activeThread.author}</strong><RoleBadge role={activeThread.author_role} /></div><p className="whitespace-pre-wrap rounded-xl border bg-gray-50 p-4">{activeThread.content}</p></div></article>
                    {(activeThread.replies || []).map((item) => <article key={item.id} className="flex gap-3"><Avatar name={item.author} /><div><div className="mb-1 flex items-center gap-2"><strong className="text-sm">{item.author}</strong><RoleBadge role={item.author_role} /><span className="text-xs text-gray-400">{formatStudentDate(item.created_at)}</span></div><p className={`whitespace-pre-wrap rounded-xl border p-4 ${roleName(item.author_role) === "Instructor" ? "bg-accent text-white" : "bg-white"}`}>{item.content}</p></div></article>)}
                  </div>
                  <form onSubmit={handleReply} className="flex gap-2 border-t bg-gray-50 p-4"><textarea rows={1} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply…" className="min-w-0 flex-1 resize-y rounded-xl border p-3" /><button type="submit" disabled={!reply.trim() || saving} aria-label="Send reply" className="rounded-lg bg-primary p-3 text-white disabled:opacity-50"><Send size={16} /></button></form>
                </> : <div className="flex flex-1 items-center justify-center text-gray-400"><MessageSquare size={32} /><span className="ml-2">Select a thread or start a discussion.</span></div>}
              </section>
            </div>
          )}
        </div>
      </main>
      {showNewThread && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><form onSubmit={handleCreateThread} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">New discussion thread</h2><button type="button" onClick={() => setShowNewThread(false)} aria-label="Close"><X /></button></div><label className="block text-sm font-medium">Course<select value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} className="mt-1 w-full rounded-lg border p-2">{courses.map((course) => <option key={course.course_id} value={course.course_id}>{course.code ? `${course.code} — ` : ""}{course.title}</option>)}</select></label><label className="block text-sm font-medium">Title<input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} className="mt-1 w-full rounded-lg border p-2" required /></label><label className="block text-sm font-medium">Message<textarea value={newContent} onChange={(event) => setNewContent(event.target.value)} rows={5} className="mt-1 w-full rounded-lg border p-2" required /></label><button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">{saving ? "Posting…" : "Post thread"}</button></form></div>}
    </div>
  );
}
