"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UpdateAssignmentModal({ isOpen, onClose, onSaved, assignment, instructorId }) {
  const [form, setForm] = useState({ title: "", description: "", total_marks: "", deadline: "", file: null });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (assignment) setForm({ title: assignment.title, description: assignment.description || "", total_marks: assignment.total_marks, deadline: assignment.deadline?.slice(0, 10) || "", file: null });
  }, [assignment]);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setError("");
    try {
      const body = new FormData();
      Object.entries({ ...form, instructor_id: instructorId }).forEach(([key, value]) => { if (value !== null) body.append(key, value); });
      const response = await fetch(`${API_URL}/api/assignments/${assignment.id}`, { method: "PUT", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update assignment.");
      await onSaved(); onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title="Update Assignment">
    <form onSubmit={submit} className="space-y-4 text-primary">
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <p className="text-sm">Course: {assignment?.course_title}</p>
      <label className="block text-sm">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <label className="block text-sm">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Total marks<input required type="number" min="0.01" step="0.01" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
        <label className="text-sm">Deadline<input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="mt-1 w-full rounded border px-3 py-2" /></label>
      </div>
      <label className="block text-sm">Replace file<input type="file" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} className="mt-1 w-full" /></label>
      {assignment?.file_name && <p className="text-xs text-gray-500">Current file: {assignment.file_name}</p>}
      <div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded border px-4 py-2">Cancel</button><button disabled={saving} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div>
    </form>
  </Modal>;
}
