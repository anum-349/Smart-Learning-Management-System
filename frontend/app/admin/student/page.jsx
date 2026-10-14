"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Link from "next/link";

import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const emptyForm = {
  id: "", firstName: "", lastName: "", email: "", password: "", registrationNo: "",
  departmentId: "", programId: "", semesterId: "", status: "active",
};

export default function AdminStudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ departmentId: "", programId: "", semesterId: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of rows per page

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [studentRes, departmentRes, programRes, semesterRes] = await Promise.all([
          fetch(`${API_URL}/api/students`),
          fetch(`${API_URL}/api/departments`),
          fetch(`${API_URL}/api/programs`),
          fetch(`${API_URL}/api/semesters`),
        ]);
        const [studentData, departmentData, programData, semesterData] = await Promise.all([
          studentRes.json(), departmentRes.json(), programRes.json(), semesterRes.json(),
        ]);
        if (!studentRes.ok) throw new Error(studentData.message || "Failed to load students");
        if (!departmentRes.ok) throw new Error(departmentData.message || "Failed to load departments");
        if (!programRes.ok) throw new Error(programData.message || "Failed to load programs");
        if (!semesterRes.ok) throw new Error(semesterData.message || "Failed to load semesters");
        setStudents(studentData.map((row) => {
          const names = (row.full_name || "").trim().split(/\s+/);
          return { id: row.student_id, firstName: names[0] || "", lastName: names.slice(1).join(" "),
            email: row.email || "", registrationNo: row.registration_no || "",
            departmentId: row.department_id == null ? "" : String(row.department_id),
            programId: row.program_id == null ? "" : String(row.program_id),
            semesterId: row.semester_id == null ? "" : String(row.semester_id), status: row.status || "active",
            departmentTitle: row.department_title || "", programTitle: row.program_title || "",
            semesterNumber: row.semester_number };
        }));
        setDepartments(departmentData.map((d) => ({ id: String(d.dept_id ?? d.id), title: d.title })));
        setPrograms(programData.map((p) => ({ id: String(p.id), title: p.title,
          departmentId: String(p.departmentId?.id ?? p.department_id ?? "") })));
        setSemesters(semesterData.map((s) => ({ id: String(s.id), title: `Semester ${s.semester_number}`,
          semesterNumber: s.semester_number, batchId: String(s.batch_id), programId: String(s.program_id ?? "") })));
      } catch (err) {
        setError(err.message || "Unable to load student data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPrograms = programs.filter(p => !filters.departmentId || p.departmentId === filters.departmentId);
  const filteredSemesters = semesters.filter(s => !filters.programId || !s.programId || s.programId === filters.programId);
  const formPrograms = programs.filter(p => !formData.departmentId || p.departmentId === formData.departmentId);
  const formSemesters = semesters.filter(s => !formData.programId || !s.programId || s.programId === formData.programId);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field === "departmentId" ? { programId: "", semesterId: "" } : {}),
      ...(field === "programId" ? { semesterId: "" } : {})
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === "departmentId" ? { programId: "", semesterId: "" } : {}),
      ...(field === "programId" ? { semesterId: "" } : {}),
    }));
  };

  const handleEditStudent = (student) => {
    setIsEdit(true);
    setFormData({ ...emptyForm, ...student, password: "" });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(), email: formData.email,
        password: formData.password || undefined, registrationNo: formData.registrationNo,
        departmentId: formData.departmentId || null, programId: formData.programId || null,
        semesterId: formData.semesterId || null, status: formData.status,
      };
      const res = await fetch(`${API_URL}/api/students${isEdit ? `/${formData.id}` : ""}`, {
        method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Unable to save student");
      setIsEdit(false);
      setFormData(emptyForm);
      const refresh = await fetch(`${API_URL}/api/students`);
      const data = await refresh.json();
      if (!refresh.ok) throw new Error(data.message || "Student saved, but refresh failed");
      setStudents(data.map((row) => {
        const names = (row.full_name || "").trim().split(/\s+/);
        return { id: row.student_id, firstName: names[0] || "", lastName: names.slice(1).join(" "), email: row.email || "",
          registrationNo: row.registration_no || "", departmentId: row.department_id == null ? "" : String(row.department_id),
          programId: row.program_id == null ? "" : String(row.program_id), semesterId: row.semester_id == null ? "" : String(row.semester_id),
          status: row.status || "active", departmentTitle: row.department_title || "", programTitle: row.program_title || "",
          semesterNumber: row.semester_number };
      }));
    } catch (err) {
      setError(err.message || "Unable to save student");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudent = async (id) => {
    if (confirm("Are you sure to delete this student?")) {
      try {
        const res = await fetch(`${API_URL}/api/students/${id}`, { method: "DELETE" });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Unable to delete student");
        setStudents((previous) => previous.filter((s) => s.id !== id));
      } catch (err) {
        setError(err.message || "Unable to delete student");
      }
    }
  };

  const filteredStudents = students.filter(s => {
    return (
      (!filters.departmentId || s.departmentId === filters.departmentId) &&
      (!filters.programId || s.programId === filters.programId) &&
      (!filters.semesterId || s.semesterId === filters.semesterId) &&
      (`${s.firstName} ${s.lastName} ${s.registrationNo} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedStudents = filteredStudents.slice(
    (visiblePage - 1) * pageSize,
    visiblePage * pageSize
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Admin"} />
      <main className="flex-1 ml-64">
        <Header user="Admin" notification={[]} />
        <div className="container mx-auto p-6 pt-10">
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Students</span>
          </div>

          {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
          {loading && <p className="mb-4 text-gray-500">Loading students…</p>}

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select
              label="Department"
              value={filters.departmentId}
              onChange={(v) => handleFilterChange("departmentId", v)}
              options={[{ value: "", label: "All Departments" }, ...departments.map(d => ({ value: d.id, label: d.title }))]}
            />
            <Select
              label="Program"
              value={filters.programId}
              onChange={(v) => handleFilterChange("programId", v)}
              options={[{ value: "", label: "All Programs" }, ...filteredPrograms.map(p => ({ value: p.id, label: p.title }))]}
            />
            <Select
              label="Semester"
              value={filters.semesterId}
              onChange={(v) => handleFilterChange("semesterId", v)}
              options={[{ value: "", label: "All Semesters" }, ...filteredSemesters.map(s => ({ value: s.id, label: s.title }))]}
            />
            <div className="relative w-64 top-4">
              <Search className="absolute left-3 top-2 text-gray-400" />
              <input
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Add/Edit Student Form */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Student" : "Add New Student"}</h2>
            <form onSubmit={handleSaveStudent} className="grid md:grid-cols-3 gap-4">
              <Input label="First Name" value={formData.firstName} onChange={(v) => handleChange("firstName", v)} />
              <Input label="Last Name" value={formData.lastName} onChange={(v) => handleChange("lastName", v)} />
              <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />
              <Input label="Registration No" value={formData.registrationNo} onChange={(v) => handleChange("registrationNo", v)} />
              <Input label={isEdit ? "New Password (optional)" : "Initial Password"} type="password" value={formData.password} onChange={(v) => handleChange("password", v)} />
              <Select
                label="Department"
                value={formData.departmentId}
                onChange={(v) => handleChange("departmentId", v)}
                options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d.id, label: d.title }))]}
              />
              <Select
                label="Program"
                value={formData.programId}
                onChange={(v) => handleChange("programId", v)}
                options={[{ value: "", label: "Select Program" }, ...formPrograms.map(p => ({ value: p.id, label: p.title }))]}
              />
              <Select
                label="Semester"
                value={formData.semesterId}
                onChange={(v) => handleChange("semesterId", v)}
                options={[{ value: "", label: "Select Semester" }, ...formSemesters.map(s => ({ value: s.id, label: s.title }))]}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(v) => handleChange("status", v)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "frozen", label: "Frozen" },
                  { value: "in_progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "withdrawn", label: "Withdrawn" },
                ]}
              />
              <div className="col-span-3 flex gap-2 mt-2">
                <button type="submit" disabled={saving} className="py-2 px-4 rounded-xl bg-accentDark hover:bg-accent text-white font-semibold flex items-center gap-2 disabled:opacity-60">
                  <PlusCircle /> {saving ? "Saving…" : isEdit ? "Update Student" : "Add Student"}
                </button>
                {isEdit && <button type="button" onClick={() => { setIsEdit(false); setFormData(emptyForm); }} className="py-2 px-4 rounded-xl bg-gray-400 hover:bg-gray-500 text-white">Cancel</button>}
              </div>
            </form>
          </div>

          {/* Students Table */}
          <div>
            {/* Students Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <Th>Reg. No</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Program</Th>
                    <Th>Semester</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.map(s => {
                    return (
                      <tr key={s.id} className="hover:bg-gray-100">
                        <Td>{s.registrationNo}</Td>
                        <Td>{s.firstName} {s.lastName}</Td>
                        <Td>{s.email}</Td>
                        <Td>{s.programTitle || programs.find(p => p.id === s.programId)?.title || "—"}</Td>
                        <Td>{s.semesterNumber ? `Semester ${s.semesterNumber}` : semesters.find(smt => smt.id === s.semesterId)?.title || "—"}</Td>
                        <Td>{s.status}</Td>
                        <Td className="flex gap-2">
                          <button onClick={() => handleEditStudent(s)} className="text-primary hover:text-secondary"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteStudent(s.id)} className="text-accentDark hover:text-accent"><Trash2 size={16} /></button>
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredStudents.length === 0 && <p className="text-center text-gray-500 py-6">No students found.</p>}
            </div>

            {/* Pagination Controls */}
            {filteredStudents.length > pageSize && (
              <div className="flex justify-center items-center gap-3 mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-200 cursor-not-allowed" : "bg-primary text-white hover:bg-secondary"}`}
                >
                  Previous
                </button>
                <span>Page {visiblePage} of {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={visiblePage === totalPages}
                  className={`px-3 py-1 rounded ${visiblePage === totalPages ? "bg-gray-200 cursor-not-allowed" : "bg-primary text-white hover:bg-secondary"}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
