"use client";

import { useEffect, useState } from "react";
import { Check, X, Search } from "lucide-react";
import Link from "next/link";

import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminEnrollmentApproval() {
  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [filters, setFilters] = useState({
    departmentId: "",
    programId: "",
    semesterId: "",
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- FETCH INITIAL DATA ---------------- */

  useEffect(() => {
    fetch(`${API_URL}/departments`)
      .then(res => res.json())
      .then(setDepartments)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!filters.departmentId) {
      setPrograms([]);
      return;
    }
    fetch(`${API_URL}/programs?departmentId=${filters.departmentId}`)
      .then(res => res.json())
      .then(setPrograms)
      .catch(console.error);
  }, [filters.departmentId]);

  useEffect(() => {
    if (!filters.programId) {
      setSemesters([]);
      return;
    }
    fetch(`${API_URL}/semesters?programId=${filters.programId}`)
      .then(res => res.json())
      .then(setSemesters)
      .catch(console.error);
  }, [filters.programId]);

  /* ---------------- FETCH ENROLLMENT REQUESTS ---------------- */

  const fetchRequests = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      departmentId: filters.departmentId,
      programId: filters.programId,
      semesterId: filters.semesterId,
      search,
    });

    try {
      const res = await fetch(`${API_URL}/enrollment-requests?${params}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters, search]);

  /* ---------------- ACTION HANDLERS ---------------- */

  const updateStatus = async (id, action) => {
    try {
      await fetch(`${API_URL}/enrollment-requests/${id}/${action}`, {
        method: "PUT",
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType="Admin" />

      <main className="flex-1 ml-64">
        <Header user="Admin" notification={[]} />

        <div className="p-6 pt-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span className="mx-2">/</span>
            Enrollment Approval
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select
              label="Department"
              value={filters.departmentId}
              onChange={(v) =>
                setFilters({ departmentId: v, programId: "", semesterId: "" })
              }
              options={[
                { value: "", label: "All" },
                ...departments.map(d => ({ value: d.dept_id, label: d.title })),
              ]}
            />

            <Select
              label="Program"
              value={filters.programId}
              onChange={(v) =>
                setFilters({ ...filters, programId: v, semesterId: "" })
              }
              options={[
                { value: "", label: "All" },
                ...programs.map(p => ({ value: p.id, label: p.title })),
              ]}
            />

            <Select
              label="Semester"
              value={filters.semesterId}
              onChange={(v) => setFilters({ ...filters, semesterId: v })}
              options={[
                { value: "", label: "All" },
                ...semesters.map(s => ({ value: s.id, label: s.semester_number })),
              ]}
            />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                className="w-full border rounded-xl pl-10 py-2"
                placeholder="Search student or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-primary text-white">
                <tr>
                  <Th>Student</Th>
                  <Th>Course</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-100">
                    <Td>{r.full_name} {r.registration_no}</Td>
                    <Td>{r.course_title}</Td>
                    <Td>
                      <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold
                        ${r.status === "Pending" && "bg-yellow-500"}
                        ${r.status === "Approved" && "bg-green-500"}
                        ${r.status === "Rejected" && "bg-red-500"}
                      `}>
                        {r.status}
                      </span>
                    </Td>

                    <Td className="flex gap-2">
                      {r.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(r.id, "approve")}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-xl flex gap-1"
                          >
                            <Check size={16} /> Approve
                          </button>

                          <button
                            onClick={() => updateStatus(r.id, "reject")}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-xl flex gap-1"
                          >
                            <X size={16} /> Reject
                          </button>
                        </>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && requests.length === 0 && (
              <p className="text-center py-6 text-gray-500">
                No enrollment requests found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
