"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import { getStoredUserId, studentFetch } from "@/lib/student-api";

export default function StudentEnrollmentPage() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [registrationNo, setRegistrationNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOptions = async (id) => {
    const data = await studentFetch(`/api/students/${encodeURIComponent(id)}/enrollment-options`);
    setProfile(data.student);
    setRegistrationNo(data.student.registration_no || "");
    setCourses(data.courses);
    setSelectedIds([]);
  };

  useEffect(() => {
    const id = getStoredUserId();
    setUserId(id);
    if (!id) {
      setError("Please sign in to request course enrollment.");
      setLoading(false);
      return;
    }
    loadOptions(id).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const totalCredits = useMemo(() => courses.filter((course) => selectedIds.includes(course.course_id)).reduce((total, course) => total + Number(course.credits || 0), 0), [courses, selectedIds]);

  const toggleCourse = (course) => {
    if (course.enrollment_status && course.enrollment_status !== "Rejected") return;
    setSelectedIds((current) => current.includes(course.course_id) ? current.filter((id) => id !== course.course_id) : [...current, course.course_id]);
  };

  const submitRequests = async (event) => {
    event.preventDefault();
    if (!userId || !selectedIds.length) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await studentFetch(`/api/students/${encodeURIComponent(userId)}/enrollment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_ids: selectedIds, registration_no: registrationNo }),
      });
      await loadOptions(userId);
      setNotice(response.message || "Enrollment requests submitted for review.");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="mx-auto max-w-6xl space-y-5 p-6 pt-10">
          <div className="text-sm text-gray-600"><Link href="/student">Dashboard</Link><span className="mx-2">/</span><span>Course enrollment</span></div>
          <h1 className="text-2xl font-bold">Course Enrollment</h1>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
          {notice && <p role="status" className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-green-700"><CheckCircle size={18} />{notice}</p>}
          {loading ? <p>Loading offered courses…</p> : null}
          {!loading && profile && <>
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-primary p-5 text-white">
              <div><h2 className="text-lg font-bold">{profile.fullname || profile.username}</h2><p className="text-sm text-gray-300">{profile.program || "Program not set"}{profile.semester_number ? ` · Semester ${profile.semester_number}` : ""}</p></div>
              <p className="font-semibold">Selected credits: {totalCredits}</p>
            </section>
            {!courses.length ? <p className="rounded-xl bg-white p-6 text-gray-600">No courses are currently offered for your registered program and semester.</p> : <form onSubmit={submitRequests} className="space-y-5">
              <section className="overflow-x-auto rounded-xl border bg-white shadow-sm"><table className="min-w-full divide-y"><thead className="bg-primary text-white"><tr><th className="px-4 py-3 text-left">Request status</th><th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Course</th><th className="px-4 py-3 text-center">Credits</th><th className="px-4 py-3 text-center">Select</th></tr></thead><tbody className="divide-y">{courses.map((course) => {
                const locked = course.enrollment_status && course.enrollment_status !== "Rejected";
                const status = course.enrollment_status || "Available";
                return <tr key={course.course_id}><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${status === "Enrolled" || status === "Approved" ? "bg-green-100 text-green-700" : status === "Pending" || status === "Created" ? "bg-amber-100 text-amber-800" : status === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>{status}</span></td><td className="px-4 py-3">{course.code || "—"}</td><td className="px-4 py-3 font-medium">{course.title}</td><td className="px-4 py-3 text-center">{course.credits ?? "—"}</td><td className="px-4 py-3 text-center"><input type="checkbox" checked={selectedIds.includes(course.course_id)} disabled={locked || saving} onChange={() => toggleCourse(course)} aria-label={`Select ${course.title}`} /></td></tr>;
              })}</tbody></table></section>
              <section className="grid gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2"><div><label htmlFor="registration-no" className="mb-1 block text-sm font-medium">Confirm registration number</label><div className="relative"><Award size={16} className="absolute left-3 top-3 text-accent" /><input id="registration-no" value={registrationNo} onChange={(event) => setRegistrationNo(event.target.value)} className="w-full rounded-lg border p-2 pl-9" required /></div></div><div><label className="mb-1 block text-sm font-medium">Student email</label><input value={profile.email || ""} readOnly className="w-full rounded-lg border bg-gray-100 p-2 text-gray-600" /></div></section>
              <div className="flex items-center justify-between"><p className="text-sm text-gray-600">Requests are sent to the institution for approval.</p><button type="submit" disabled={saving || !selectedIds.length} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white disabled:opacity-50">{saving ? "Submitting…" : "Submit enrollment requests"}</button></div>
            </form>}
          </>}
        </div>
      </main>
    </div>
  );
}
