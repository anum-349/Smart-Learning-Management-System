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
  departmentId: "", rank: "", employmentTypeId: "", status: "active", officeTiming: "", researchSpeciality: ""
};

export default function AdminInstructorManagement() {
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ departmentId: "", employmentTypeId: "", status: "" });

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [instructorRes, departmentRes] = await Promise.all([
          fetch(`${API_URL}/api/instructor`),
          fetch(`${API_URL}/api/departments`),
        ]);
        const [instructorData, departmentData] = await Promise.all([instructorRes.json(), departmentRes.json()]);
        if (!instructorRes.ok) throw new Error(instructorData.message || "Failed to load instructors");
        if (!departmentRes.ok) throw new Error(departmentData.message || "Failed to load departments");
        setInstructors(instructorData.map((row) => {
          const names = (row.full_name || "").trim().split(/\s+/);
          return {
            id: row.id,
            firstName: names[0] || "",
            lastName: names.slice(1).join(" "),
            email: row.email || "",
            registrationNo: row.registration_no || "",
            departmentId: row.department_id == null ? "" : String(row.department_id),
            departmentTitle: row.department_title || "",
            rank: row.rank || "",
            employmentTypeId: row.employment_type || "",
            status: row.status || "active",
            officeTiming: row.office_timing || "",
            researchSpeciality: row.research_speciality || "",
          };
        }));
        setDepartments(departmentData.map((d) => ({ id: String(d.dept_id ?? d.id), title: d.title })));
      } catch (err) {
        setError(err.message || "Unable to load instructor data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInstructor = (inst) => {
    setIsEdit(true);
    setFormData({ ...emptyForm, ...inst, password: "" });
  };

  const handleSaveInstructor = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password || undefined,
        registrationNo: formData.registrationNo,
        departmentId: formData.departmentId || null,
        rank: formData.rank,
        employmentType: formData.employmentTypeId,
        status: formData.status,
        officeTiming: formData.officeTiming,
        researchSpeciality: formData.researchSpeciality,
      };
      const res = await fetch(`${API_URL}/api/instructor${isEdit ? `/${formData.id}` : ""}`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to save instructor");
      setIsEdit(false);
      setFormData(emptyForm);
      const refresh = await fetch(`${API_URL}/api/instructor`);
      const refreshed = await refresh.json();
      if (!refresh.ok) throw new Error(refreshed.message || "Instructor saved, but refresh failed");
      const depts = departments;
      setInstructors(refreshed.map((row) => {
        const names = (row.full_name || "").trim().split(/\s+/);
        return { id: row.id, firstName: names[0] || "", lastName: names.slice(1).join(" "), email: row.email || "",
          registrationNo: row.registration_no || "", departmentId: row.department_id == null ? "" : String(row.department_id),
          departmentTitle: depts.find((d) => d.id === String(row.department_id))?.title || row.department_title || "",
          rank: row.rank || "", employmentTypeId: row.employment_type || "", officeTiming: row.office_timing || "",
          status: row.status || "active",
          researchSpeciality: row.research_speciality || "" };
      }));
    } catch (err) {
      setError(err.message || "Unable to save instructor");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInstructor = async (id) => {
    if (confirm("Are you sure to delete this instructor?")) {
      try {
        const res = await fetch(`${API_URL}/api/instructor/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to delete instructor");
        setInstructors((previous) => previous.filter((i) => i.id !== id));
      } catch (err) {
        setError(err.message || "Unable to delete instructor");
      }
    }
  };

  const filteredInstructors = instructors.filter(i => {
    return (
      (!filters.departmentId || i.departmentId === filters.departmentId) &&
      (!filters.employmentTypeId || i.employmentTypeId.toLowerCase() === filters.employmentTypeId.toLowerCase()) &&
      (!filters.status || i.status === filters.status) &&
      (`${i.firstName} ${i.lastName} ${i.registrationNo} ${i.email}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Admin"} />
      <main className="flex-1 ml-64">
        <Header user="Admin" notification={[]} />
        <div className="container mx-auto p-6 pt-10">
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Instructors</span>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select
              label="Department"
              value={filters.departmentId}
              onChange={(v) => handleFilterChange("departmentId", v)}
              options={[{ value: "", label: "All Departments" }, ...departments.map(d => ({ value: d.id, label: d.title }))]}
            />
            <Select
              label="Employment Type"
              value={filters.employmentTypeId}
              onChange={(v) => handleFilterChange("employmentTypeId", v)}
              options={[
                { value: "", label: "All Types" },
                { value: "Permanent", label: "Permanent" },
                { value: "Visiting", label: "Visiting" }
              ]}
            />
            <Select
              label="Status"
              value={filters.status}
              onChange={(v) => handleFilterChange("status", v)}
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
                { value: "on_leave", label: "On Leave" },
              ]}
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

          {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
          {loading && <p className="mb-4 text-gray-500">Loading instructors…</p>}

          {/* Add/Edit Instructor Form */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Instructor" : "Add New Instructor"}</h2>
            <form onSubmit={handleSaveInstructor} className="grid md:grid-cols-3 gap-4">
              <Input label="First Name" value={formData.firstName} onChange={(v) => handleChange("firstName", v)} />
              <Input label="Last Name" value={formData.lastName} onChange={(v) => handleChange("lastName", v)} />
              <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />
              <Input label="Registration No" value={formData.registrationNo} onChange={(v) => handleChange("registrationNo", v)} />
              <Input label={isEdit ? "New Password (optional)" : "Initial Password"} type="password" value={formData.password} onChange={(v) => handleChange("password", v)} />
              <Input label="Rank" value={formData.rank} onChange={(v) => handleChange("rank", v)} />
              <Input label="Office Timing" value={formData.officeTiming} onChange={(v) => handleChange("officeTiming", v)} />
              <Input label="Research Speciality" value={formData.researchSpeciality} onChange={(v) => handleChange("researchSpeciality", v)} />
              <Select
                label="Department"
                value={formData.departmentId}
                onChange={(v) => handleChange("departmentId", v)}
                options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d.id, label: d.title }))]}
              />
              <Select
                label="Employment Type"
                value={formData.employmentTypeId}
                onChange={(v) => handleChange("employmentTypeId", v)}
                options={[
                  { value: "", label: "Select Type" },
                  { value: "Permanent", label: "Permanent" },
                  { value: "Visiting", label: "Visiting" }
                ]}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(v) => handleChange("status", v)}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "suspended", label: "Suspended" },
                  { value: "on_leave", label: "On Leave" },
                ]}
              />
              <div className="col-span-3 flex gap-2 mt-2">
                <button type="submit" disabled={saving} className="py-2 px-4 rounded-xl bg-accentDark hover:bg-accent text-white font-semibold flex items-center gap-2 disabled:opacity-60">
                  <PlusCircle /> {saving ? "Saving…" : isEdit ? "Update Instructor" : "Add Instructor"}
                </button>
                {isEdit && <button type="button" onClick={() => { setIsEdit(false); setFormData(emptyForm); }} className="py-2 px-4 rounded-xl bg-gray-400 hover:bg-gray-500 text-white">Cancel</button>}
              </div>
            </form>
          </div>

          {/* Instructors Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <Th>Reg. No</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Department</Th>
                  <Th>Rank</Th>
                  <Th>Employment Type</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInstructors.map(i => {
                  return (
                    <tr key={i.id} className="hover:bg-gray-100">
                      <Td>{i.registrationNo}</Td>
                      <Td>{i.firstName} {i.lastName}</Td>
                      <Td>{i.email}</Td>
                      <Td>{i.departmentTitle || departments.find(d => d.id === i.departmentId)?.title || "—"}</Td>
                      <Td>{i.rank}</Td>
                      <Td>{i.employmentTypeId}</Td>
                      <Td>{i.status}</Td>
                      <Td className="flex gap-2">
                        <button onClick={() => handleEditInstructor(i)} className="text-primary hover:text-secondary"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteInstructor(i.id)} className="text-accentDark hover:text-accent"><Trash2 size={16} /></button>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredInstructors.length === 0 && <p className="text-center text-gray-500 py-6">No instructors found.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
