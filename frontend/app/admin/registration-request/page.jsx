"use client";

import { useState, useEffect } from "react";
import { Check, X, Search } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Link from "next/link";

import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

// Mock data (replace with API calls)
const initialNotifications = [
  { id: 1, text: "New registration request", isRead: false, type: "general" },
];

const departmentsData = [
  { _id: "d1", title: "Computer Science", facultyId: "f1" },
  { _id: "d2", title: "Software Engineering", facultyId: "f1" },
  { _id: "d3", title: "Physics", facultyId: "f2" },
];

const programsData = [
  { _id: "p1", title: "BS Computer Science", departmentId: "d1" },
  { _id: "p2", title: "BS Software Engineering", departmentId: "d2" },
];

const semestersData = [
  { _id: "s1", title: "Fall 2025", programId: "p1" },
  { _id: "s2", title: "Spring 2026", programId: "p1" },
  { _id: "s3", title: "Fall 2025", programId: "p2" },
];

const studentsData = [
  { _id: "stu1", firstName: "Ali", lastName: "Akbar", departmentId: "d1", programId: "p1", semesterId: "s1" },
  { _id: "stu2", firstName: "Wajdan", lastName: "Khan", departmentId: "d2", programId: "p2", semesterId: "s3" },
];

const coursesData = [
  { _id: "c1", title: "Data Structures", programId: "p1" },
  { _id: "c2", title: "Algorithms", programId: "p1" },
  { _id: "c3", title: "Software Design", programId: "p2" },
];

const initialRequests = [
  { _id: "r1", studentId: "stu1", courseId: "c1", status: "Pending" },
  { _id: "r2", studentId: "stu2", courseId: "c3", status: "Pending" },
];

export default function AdminEnrollmentApproval() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ departmentId: "", programId: "", semesterId: "" });

  useEffect(() => {
    setRequests(initialRequests);
  }, []);

  // Cascading dropdowns
  const filteredPrograms = programsData.filter(p => !filters.departmentId || p.departmentId === filters.departmentId);
  const filteredSemesters = semestersData.filter(s => !filters.programId || s.programId === filters.programId);

  // Filter requests by student, course, and applied filters
  const filteredRequests = requests.filter(r => {
    const student = studentsData.find(s => s._id === r.studentId);
    const course = coursesData.find(c => c._id === r.courseId);

    const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      || course.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = !filters.departmentId || student.departmentId === filters.departmentId;
    const matchesProgram = !filters.programId || student.programId === filters.programId;
    const matchesSemester = !filters.semesterId || student.semesterId === filters.semesterId;

    return matchesSearch && matchesDepartment && matchesProgram && matchesSemester;
  });

  const handleApprove = (id) => {
    setRequests(requests.map(r => r._id === id ? { ...r, status: "Approved" } : r));
  };

  const handleReject = (id) => {
    setRequests(requests.map(r => r._id === id ? { ...r, status: "Rejected" } : r));
  };

  return (
    <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Admin"} />
      <main className="flex-1 ml-64">
        <Header user="Admin" notification={initialNotifications} />

        <div className="container mx-auto p-6 pt-10">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Enrollment Approval</span>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6 max-w-5xl">
            <Select
              label="Department"
              value={filters.departmentId}
              onChange={(v) => setFilters({ ...filters, departmentId: v, programId: "", semesterId: "" })}
              options={[{ value: "", label: "All" }, ...departmentsData.map(d => ({ value: d._id, label: d.title }))]}
            />
            <Select
              label="Program"
              value={filters.programId}
              onChange={(v) => setFilters({ ...filters, programId: v, semesterId: "" })}
              options={[{ value: "", label: "All" }, ...filteredPrograms.map(p => ({ value: p._id, label: p.title }))]}
            />
            <Select
              label="Semester"
              value={filters.semesterId}
              onChange={(v) => setFilters({ ...filters, semesterId: v })}
              options={[{ value: "", label: "All" }, ...filteredSemesters.map(s => ({ value: s._id, label: s.title }))]}
            />
          </div>

          {/* Search */}
          <div className="max-w-5xl mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                placeholder="Search by student or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="max-w-5xl mx-auto border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((r) => {
                  const student = studentsData.find(s => s._id === r.studentId);
                  const course = coursesData.find(c => c._id === r.courseId);
                  return (
                    <tr key={r._id} className="hover:bg-gray-100">
                      <Td>{student.firstName} {student.lastName}</Td>
                      <Td>{course.title}</Td>
                      <Td>
                        <span className={`px-2 py-1 rounded-xl text-white font-semibold ${
                          r.status === "Pending" ? "bg-yellow-500" :
                          r.status === "Approved" ? "bg-green-500" :
                          "bg-red-500"
                        }`}>
                          {r.status}
                        </span>
                      </Td>
                      <Td className="flex gap-2">
                        {r.status === "Pending" && (
                          <>
                            <button onClick={() => handleApprove(r._id)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-xl flex items-center gap-1">
                              <Check size={16} /> Approve
                            </button>
                            <button onClick={() => handleReject(r._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-xl flex items-center gap-1">
                              <X size={16} /> Reject
                            </button>
                          </>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredRequests.length === 0 && (
              <p className="text-center text-gray-500 py-6">No registration requests found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
