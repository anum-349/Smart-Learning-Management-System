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

// Mock Data
const initialNotifications = [
  { id: 1, text: "Welcome Admin!", isRead: false, type: "general" },
];

const departmentsData = [
  { _id: "d1", title: "Computer Science" },
  { _id: "d2", title: "Software Engineering" },
];

const initialInstructors = [
  {
    _id: "inst1",
    firstName: "Ali",
    lastName: "Akbar",
    email: "ali@example.com",
    registrationNo: "INST-1001",
    departmentId: "d1",
    rank: "Professor",
    employmentTypeId: "Permanent",
    status: "active",
    officeTiming: "9am - 5pm",
    researchSpeciality: "AI"
  },
  {
    _id: "inst2",
    firstName: "Sara",
    lastName: "Khan",
    email: "sara@example.com",
    registrationNo: "INST-1002",
    departmentId: "d2",
    rank: "Assistant Professor",
    employmentTypeId: "Visiting",
    status: "on_leave",
    officeTiming: "10am - 4pm",
    researchSpeciality: "Cybersecurity"
  },
];

export default function AdminInstructorManagement() {
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ departmentId: "", status: "", employmentTypeId: "" });

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    registrationNo: "",
    departmentId: "",
    rank: "",
    employmentTypeId: "",
    status: "active",
    officeTiming: "",
    researchSpeciality: ""
  });

  useEffect(() => {
    setInstructors(initialInstructors);
    setDepartments(departmentsData);
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddInstructor = (e) => {
    e.preventDefault();
    const newInstructor = { ...formData, _id: Date.now().toString() };
    setInstructors([...instructors, newInstructor]);
    setFormData({
      _id: "",
      firstName: "",
      lastName: "",
      email: "",
      registrationNo: "",
      departmentId: "",
      rank: "",
      employmentTypeId: "",
      status: "active",
      officeTiming: "",
      researchSpeciality: ""
    });
  };

  const handleEditInstructor = (inst) => {
    setIsEdit(true);
    setFormData(inst);
  };

  const handleUpdateInstructor = (e) => {
    e.preventDefault();
    setInstructors(instructors.map(i => i._id === formData._id ? formData : i));
    setIsEdit(false);
  };

  const handleDeleteInstructor = (id) => {
    if (confirm("Are you sure to delete this instructor?")) {
      setInstructors(instructors.filter(i => i._id !== id));
    }
  };

  const filteredInstructors = instructors.filter(i => {
    return (
      (!filters.departmentId || i.departmentId === filters.departmentId) &&
      (!filters.status || i.status === filters.status) &&
      (!filters.employmentTypeId || i.employmentTypeId === filters.employmentTypeId) &&
      (i.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Admin"} />
      <main className="flex-1 ml-64">
        <Header user="Admin" notification={initialNotifications} />
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
              options={[{ value: "", label: "All Departments" }, ...departments.map(d => ({ value: d._id, label: d.title }))]}
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
                { value: "on_leave", label: "On Leave" }
              ]}
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

          {/* Add/Edit Instructor Form */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Instructor" : "Add New Instructor"}</h2>
            <form onSubmit={isEdit ? handleUpdateInstructor : handleAddInstructor} className="grid md:grid-cols-3 gap-4">
              <Input label="First Name" value={formData.firstName} onChange={(v) => handleChange("firstName", v)} />
              <Input label="Last Name" value={formData.lastName} onChange={(v) => handleChange("lastName", v)} />
              <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />
              <Input label="Rank" value={formData.rank} onChange={(v) => handleChange("rank", v)} />
              <Input label="Office Timing" value={formData.officeTiming} onChange={(v) => handleChange("officeTiming", v)} />
              <Input label="Research Speciality" value={formData.researchSpeciality} onChange={(v) => handleChange("researchSpeciality", v)} />
              <Select
                label="Department"
                value={formData.departmentId}
                onChange={(v) => handleChange("departmentId", v)}
                options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d._id, label: d.title }))]}
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
                  { value: "on_leave", label: "On Leave" }
                ]}
              />
              <div className="col-span-3 flex gap-2 mt-2">
                <button type="submit" className="py-2 px-4 rounded-xl bg-accentDark hover:bg-accent text-white font-semibold flex items-center gap-2">
                  <PlusCircle /> {isEdit ? "Update Instructor" : "Add Instructor"}
                </button>
                {isEdit && <button type="button" onClick={() => setIsEdit(false)} className="py-2 px-4 rounded-xl bg-gray-400 hover:bg-gray-500 text-white">Cancel</button>}
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
                  const dept = departments.find(d => d._id === i.departmentId);
                  return (
                    <tr key={i._id} className="hover:bg-gray-100">
                      <Td>{i.registrationNo}</Td>
                      <Td>{i.firstName} {i.lastName}</Td>
                      <Td>{i.email}</Td>
                      <Td>{dept?.title}</Td>
                      <Td>{i.rank}</Td>
                      <Td>{i.employmentTypeId}</Td>
                      <Td>{i.status}</Td>
                      <Td className="flex gap-2">
                        <button onClick={() => handleEditInstructor(i)} className="text-primary hover:text-secondary"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteInstructor(i._id)} className="text-accentDark hover:text-accent"><Trash2 size={16} /></button>
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