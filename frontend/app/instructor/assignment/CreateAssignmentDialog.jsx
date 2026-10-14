"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const emptyForm = { course_id: "", title: "", description: "", total_marks: "10", start_date: "", deadline: "", file: null };

export default function CreateAssignmentDialog({ isOpen, onClose, onSaved, courses, instructorId }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (isOpen) { setForm({ ...emptyForm, course_id: courses[0]?.id || "" }); setError(""); } }, [isOpen, courses]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = new FormData();
      Object.entries({ ...form, instructor_id: instructorId }).forEach(([key, value]) => {
        if (value !== null && value !== "") body.append(key, value);
      });
      const response = await fetch(`${API_URL}/api/assignments`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create assignment.");
      await onSaved();
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Create Assignment">
    <form onSubmit={submit} className="space-y-4 text-primary">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <label className="block text-sm">Course<select required value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="mt-1 w-full rounded border px-3 py-2">{courses.map((course) => <option key={course.id} value={course.id}>{course.code} · {course.title}</option>)}</select></label>
      <label className="block text-sm">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="block text-sm">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Total marks<input required type="number" min="0.01" step="0.01" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Start date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Deadline<input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Instructions file<input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="mt-1 w-full" /></label>
      </div>
      <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded border px-4 py-2">Cancel</button><button disabled={saving} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50">{saving ? "Saving…" : "Create"}</button></div>
    </form>
  </Modal>;
}
