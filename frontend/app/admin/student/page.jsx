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
  { id: 1, text: "Welcome Admin!", isRead: true, type: "general" },
];

const departmentsData = [
  { _id: "d1", title: "Computer Science" },
  { _id: "d2", title: "Software Engineering" },
];

const programsData = [
  { _id: "p1", title: "BS CS 2025", departmentId: "d1" },
  { _id: "p2", title: "BS SE 2025", departmentId: "d2" },
];

const semestersData = [
  { _id: "s1", title: "Semester 1", programId: "p1" },
  { _id: "s2", title: "Semester 2", programId: "p1" },
  { _id: "s3", title: "Semester 1", programId: "p2" },
];

const initialStudents = [
  {
    _id: "stu1",
    firstName: "Ali",
    lastName: "Akbar",
    email: "ali@example.com",
    registrationNo: "STUD-1001",
    departmentId: "d1",
    programId: "p1",
    semesterId: "s1",
    status: "active",
  },
  {
    _id: "stu2",
    firstName: "Sara",
    lastName: "Khan",
    email: "sara@example.com",
    registrationNo: "STUD-1002",
    departmentId: "d2",
    programId: "p2",
    semesterId: "s3",
    status: "inactive",
  },
];

export default function AdminStudentManagement() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ departmentId: "", programId: "", semesterId: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Number of rows per page

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    firstName: "",
    lastName: "",
    email: "",
    registrationNo: "",
    departmentId: "",
    programId: "",
    semesterId: "",
    status: "active",
  });

  useEffect(() => {
    setStudents(initialStudents);
    setDepartments(departmentsData);
    setPrograms(programsData);
    setSemesters(semestersData);
  }, []);

  const filteredPrograms = programs.filter(p => !filters.departmentId || p.departmentId === filters.departmentId);
  const filteredSemesters = semesters.filter(s => !filters.programId || s.programId === filters.programId);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field === "departmentId" ? { programId: "", semesterId: "" } : {}),
      ...(field === "programId" ? { semesterId: "" } : {})
    }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = { ...formData, _id: Date.now().toString() };
    setStudents([...students, newStudent]);
    setFormData({
      _id: "",
      firstName: "",
      lastName: "",
      email: "",
      registrationNo: "",
      departmentId: "",
      programId: "",
      semesterId: "",
      status: "active",
    });
  };

  const handleEditStudent = (student) => {
    setIsEdit(true);
    setFormData(student);
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    setStudents(students.map(s => s._id === formData._id ? formData : s));
    setIsEdit(false);
  };

  const handleDeleteStudent = (id) => {
    if (confirm("Are you sure to delete this student?")) {
      setStudents(students.filter(s => s._id !== id));
    }
  };

  const filteredStudents = students.filter(s => {
    return (
      (!filters.departmentId || s.departmentId === filters.departmentId) &&
      (!filters.programId || s.programId === filters.programId) &&
      (!filters.semesterId || s.semesterId === filters.semesterId) &&
      (s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filteredStudents.length / pageSize);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
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
        <Header user="Admin" notification={initialNotifications} />
        <div className="container mx-auto p-6 pt-10">
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Students</span>
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
              label="Program"
              value={filters.programId}
              onChange={(v) => handleFilterChange("programId", v)}
              options={[{ value: "", label: "All Programs" }, ...filteredPrograms.map(p => ({ value: p._id, label: p.title }))]}
            />
            <Select
              label="Semester"
              value={filters.semesterId}
              onChange={(v) => handleFilterChange("semesterId", v)}
              options={[{ value: "", label: "All Semesters" }, ...filteredSemesters.map(s => ({ value: s._id, label: s.title }))]}
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
            <form onSubmit={isEdit ? handleUpdateStudent : handleAddStudent} className="grid md:grid-cols-3 gap-4">
              <Input label="First Name" value={formData.firstName} onChange={(v) => handleChange("firstName", v)} />
              <Input label="Last Name" value={formData.lastName} onChange={(v) => handleChange("lastName", v)} />
              <Input label="Email" value={formData.email} onChange={(v) => handleChange("email", v)} />
              <Select
                label="Department"
                value={formData.departmentId}
                onChange={(v) => handleChange("departmentId", v)}
                options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d._id, label: d.title }))]}
              />
              <Select
                label="Program"
                value={formData.programId}
                onChange={(v) => handleChange("programId", v)}
                options={[{ value: "", label: "Select Program" }, ...filteredPrograms.map(p => ({ value: p._id, label: p.title }))]}
              />
              <Select
                label="Semester"
                value={formData.semesterId}
                onChange={(v) => handleChange("semesterId", v)}
                options={[{ value: "", label: "Select Semester" }, ...filteredSemesters.map(s => ({ value: s._id, label: s.title }))]}
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
                <button type="submit" className="py-2 px-4 rounded-xl bg-accentDark hover:bg-accent text-white font-semibold flex items-center gap-2">
                  <PlusCircle /> {isEdit ? "Update Student" : "Add Student"}
                </button>
                {isEdit && <button type="button" onClick={() => setIsEdit(false)} className="py-2 px-4 rounded-xl bg-gray-400 hover:bg-gray-500 text-white">Cancel</button>}
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
                    <Th>Department</Th>
                    <Th>Program</Th>
                    <Th>Semester</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.map(s => {
                    const dept = departments.find(d => d._id === s.departmentId);
                    const prog = programs.find(p => p._id === s.programId);
                    const sem = semesters.find(smt => smt._id === s.semesterId);
                    return (
                      <tr key={s._id} className="hover:bg-gray-100">
                        <Td>{s.registrationNo}</Td>
                        <Td>{s.firstName} {s.lastName}</Td>
                        <Td>{s.email}</Td>
                        <Td>{dept?.title}</Td>
                        <Td>{prog?.title}</Td>
                        <Td>{sem?.title}</Td>
                        <Td>{s.status}</Td>
                        <Td className="flex gap-2">
                          <button onClick={() => handleEditStudent(s)} className="text-primary hover:text-secondary"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteStudent(s._id)} className="text-accentDark hover:text-accent"><Trash2 size={16} /></button>
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
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded ${currentPage === totalPages ? "bg-gray-200 cursor-not-allowed" : "bg-primary text-white hover:bg-secondary"}`}
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
