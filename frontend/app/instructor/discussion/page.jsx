"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Send, Plus, Trash2 } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CourseDiscussionPage() {
  const router = useRouter();
  const [instructorId, setInstructorId] = useState("");
  const [courses, setCourses] = useState([]);
  const [threads, setThreads] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reply, setReply] = useState("");
  const [newThread, setNewThread] = useState(false);
  const [error, setError] = useState("");
  const activeThread = useMemo(() => threads.find((thread) => thread.id === activeId), [threads, activeId]);
  const visibleThreads = threads.filter((thread) => String(thread.course_id) === courseId);

  const loadThreads = async (id) => {
    const response = await fetch(`${API_URL}/api/discussions/instructor/${id}`);
    const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load discussions.");
    setThreads(data);
  };

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id || !API_URL) { setError(!id ? "Please sign in to view discussions." : "The backend API URL is not configured."); return; }
    setInstructorId(id);
    Promise.all([fetch(`${API_URL}/api/instructor/courses/${id}`).then((response) => response.json()), loadThreads(id)])
      .then(([data]) => { setCourses(data); setCourseId(String(data[0]?.id || "")); })
      .catch((err) => setError(err.message));
  }, []);

  const createThread = async (event) => {
    event.preventDefault(); setError("");
    try {
      const response = await fetch(`${API_URL}/api/discussions/threads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course_id: courseId, author_id: instructorId, title, content }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to create discussion.");
      setTitle(""); setContent(""); setNewThread(false); await loadThreads(instructorId); setActiveId(data.id);
    } catch (err) { setError(err.message); }
  };

  const postReply = async (event) => {
    event.preventDefault(); if (!reply.trim() || !activeThread) return;
    try {
      const response = await fetch(`${API_URL}/api/discussions/threads/${activeThread.id}/replies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ author_id: instructorId, content: reply }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to post reply.");
      setReply(""); await loadThreads(instructorId);
    } catch (err) { setError(err.message); }
  };

  const deleteThread = async () => {
    if (!activeThread || !confirm("Delete this discussion?")) return;
    try {
      const response = await fetch(`${API_URL}/api/discussions/threads/${activeThread.id}?instructor_id=${instructorId}`, { method: "DELETE" });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to delete discussion.");
      setActiveId(null); await loadThreads(instructorId);
    } catch (err) { setError(err.message); }
  };

  const dateLabel = (value) => new Date(value).toLocaleString();
  return <div className="flex min-h-screen bg-gray-50 text-primary"><NavBar userType="Instructor" /><main className="ml-64 flex flex-1 flex-col"><Header user="Instructor" notification={[]} />
    <div className="p-6"><div className="mb-5 flex items-center gap-2 text-sm"><button onClick={() => router.push("/instructor")}>Dashboard</button><span>/</span><span>Discussion</span></div>
      {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><label className="font-medium">Course<select value={courseId} onChange={(e) => { setCourseId(e.target.value); setActiveId(null); }} className="ml-3 rounded border bg-white px-3 py-2">{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select></label><button disabled={!courseId} onClick={() => setNewThread(true)} className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-white disabled:opacity-50"><Plus size={18} />New thread</button></div>
      {newThread && <form onSubmit={createThread} className="mb-5 grid gap-3 rounded-xl bg-white p-5 shadow-sm"><h2 className="font-semibold">Start a course discussion</h2><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded border px-3 py-2" /><textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message" className="rounded border px-3 py-2" /><div className="flex justify-end gap-2"><button type="button" onClick={() => setNewThread(false)} className="rounded border px-4 py-2">Cancel</button><button className="rounded bg-primary px-4 py-2 text-white">Post</button></div></form>}
      <div className="grid min-h-[65vh] gap-5 lg:grid-cols-[20rem_1fr]"><aside className="overflow-auto rounded-xl border bg-white"><h2 className="border-b bg-gray-50 p-4 text-sm font-semibold">Discussions</h2>{visibleThreads.length ? visibleThreads.map((thread) => <button key={thread.id} onClick={() => setActiveId(thread.id)} className={`block w-full border-b p-4 text-left ${activeId === thread.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}><span className="font-medium">{thread.title}</span><span className="mt-1 block text-xs text-gray-500">{thread.author} · {thread.replies.length} replies</span></button>) : <p className="p-6 text-sm text-gray-500">No discussions for this course.</p>}</aside>
        <section className="flex flex-col rounded-xl border bg-white">{activeThread ? <><header className="flex items-center justify-between border-b p-4"><div><h2 className="font-semibold">{activeThread.title}</h2><p className="text-xs text-gray-500">{activeThread.course_title} · {activeThread.author} · {dateLabel(activeThread.created_at)}</p></div><button onClick={deleteThread} aria-label="Delete discussion" className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 size={18} /></button></header><div className="flex-1 space-y-4 overflow-auto p-5"><article className="rounded-lg bg-gray-50 p-4"><p className="mb-1 text-xs text-gray-500">{activeThread.author} · {dateLabel(activeThread.created_at)}</p>{activeThread.content}</article>{activeThread.replies.map((item) => <article key={item.id} className="rounded-lg border p-4"><p className="mb-1 text-xs text-gray-500">{item.author} · {dateLabel(item.created_at)}</p>{item.content}</article>)}</div><form onSubmit={postReply} className="flex gap-2 border-t p-4"><input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply" className="flex-1 rounded border px-3 py-2" /><button aria-label="Send reply" className="rounded bg-primary px-4 text-white"><Send size={18} /></button></form></> : <div className="flex flex-1 flex-col items-center justify-center text-gray-400"><MessageSquare size={36} /><p className="mt-3">Select a discussion to read the conversation.</p></div>}</section>
      </div>
    </div></main></div>;
}
