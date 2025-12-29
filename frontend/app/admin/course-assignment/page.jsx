"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit, PlusCircle, Trash2 } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

// Mock data for demonstration (replace with API calls)
const initialNotifications = [
  { id: 1, text: "Course assignment created", isRead: false, type: "general" },
];

export default function AdminCourseAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);

  const fetchCourseAssignments = async () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-assignments`)
      .then(res => res.json())
      .then(setAssignments);
  }
  useEffect(() => {
    fetchCourseAssignments()
  }, []);

  const [newAssignment, setNewAssignment] = useState({
    facultyId: "",
    departmentId: "",
    programId: "",
    batchId: "",
    instructorId: "",
    courseId: "",
    semesterId: "",
    preRequisiteId: "",
  });

  const [updateData, setUpdateData] = useState({
    id: "",
    facultyId: "",
    departmentId: "",
    programId: "",
    batchId: "",
    instructorId: "",
    courseId: "",
    semesterId: "",
    preRequisiteId: "",
  });

  const formData = isEdit ? updateData : newAssignment;

  const filteredAssignments = assignments.filter(a =>
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (field, value) => {
  const setter = isEdit ? setUpdateData : setNewAssignment;

  setter(prev => {
    const newData = { ...prev, [field]: value };

    if (field === "facultyId") {
      newData.departmentId = "";
      newData.programId = "";
      newData.batchId = "";
    }
    if (field === "departmentId") {
      newData.programId = "";
      newData.batchId = "";
    }
    if (field === "programId") {
      newData.batchId = "";
    }

    return newData;
  });
};


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/faculties`)
      .then(res => res.json())
      .then(setFaculties);
  }, []);

  useEffect(() => {
    if (!formData.facultyId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments?facultyId=${formData.facultyId}`)
      .then(res => res.json())
      .then(setDepartments);
  }, [formData.facultyId]);

  useEffect(() => {
    if (!formData.departmentId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs?departmentId=${formData.departmentId}`)
      .then(res => res.json())
      .then(setPrograms);
  }, [formData.departmentId]);

  useEffect(() => {
    if (!formData.programId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/batches?programId=${formData.programId}`)
      .then(res => res.json())
      .then(setBatches);
  }, [formData.programId]);

  useEffect(() => {
    if (!formData.batchId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/semesters?batchId=${formData.batchId}`)
      .then(res => res.json())
      .then(setSemesters);
  }, [formData.batchId]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`)
      .then(res => res.json())
      .then(setCourses);
  }, []);

  useEffect(() => {
    if (!formData.departmentId) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/instructor?departmentId=${formData.departmentId}`)
      .then(res => res.json())
      .then(setInstructors);
  }, [formData.departmentId]);

  const handleAddAssignment = async (e) => {
    e.preventDefault();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instructorId: formData.instructorId,
        courseId: formData.courseId,
        semesterId: formData.semesterId,
        prerequisiteCourseId: formData.preRequisiteId
      })
    });

    const data = await res.json();
    fetchCourseAssignments()
  };

  const handleUpdateAssignment = (a) => {
    setIsEdit(true);
    setUpdateData({
      id: a.id,
      facultyId: a.faculty_id,
      departmentId: a.department_id,
      programId: a.program_id,
      batchId: a.batch_id || "",
      instructorId: a.instructor_id || "",
      courseId: a.course_id || "",
      semesterId: a.semester_id || "",
      preRequisiteId: a.prereq_id || "",
    });
  };

  const handleUpdateSubmit = async (e) => {
  e.preventDefault();

  if (!updateData.id) return alert("Invalid assignment ID");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-assignments/${updateData.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instructorId: updateData.instructorId,
      courseId: updateData.courseId,
      semesterId: updateData.semesterId,
      prerequisiteCourseId: updateData.preRequisiteId
    })
  });

  if (!res.ok) return alert("Failed to update assignment");

  fetchCourseAssignments();   // refresh table
  setIsEdit(false);           // exit edit mode
};

  const handleDeleteAssignment = async (id) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-assignments/${id}`, {
      method: "DELETE"
    });

    fetchCourseAssignments();
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
            <span>Course Assignments</span>
          </div>

          {/* FORM CARD */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-6xl mx-auto mb-10">
            <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
              {isEdit ? "Update Assignment" : "Create New Assignment"}
            </h2>

            <form
              onSubmit={isEdit ? handleUpdateSubmit : handleAddAssignment}
              className="grid md:grid-cols-4 gap-4"
            >
              <Select
                label="Faculty"
                value={formData.facultyId}
                onChange={v => handleChange("facultyId", v)}
                options={[
                  { value: "", label: "-- Select Faculty --" }, // default placeholder
                  ...faculties.map(f => ({ value: f.id, label: f.title }))
                ]}
              />

              <Select
                label="Department"
                value={formData.departmentId}
                onChange={v => handleChange("departmentId", v)}
                options={[
                  { value: "", label: "-- Select Department --" },
                  ...departments.map(d => ({ value: d.dept_id, label: d.title }))
                ]}
              />

              <Select
                label="Program"
                value={formData.programId}
                onChange={v => handleChange("programId", v)}
                options={[
                  { value: "", label: "-- Select Program --" },
                  ...programs.map(p => ({ value: p.id, label: p.title }))
                ]}
              />

              <Select
                label="Batch"
                value={formData.batchId}
                onChange={v => handleChange("batchId", v)}
                options={[
                  { value: "", label: "-- Select Batch --" },
                  ...batches.map(b => ({ value: b.id, label: b.title }))
                ]}
              />

              <Select
                label="Instructor"
                value={formData.instructorId}
                onChange={v => handleChange("instructorId", v)}
                options={[
                  { value: "", label: "-- Select Instructor --" },
                  ...instructors.map(i => ({ value: i.id, label: `${i.full_name}` }))
                ]}
              />

              <Select
                label="Course"
                value={formData.courseId}
                onChange={v => handleChange("courseId", v)}
                options={[
                  { value: "", label: "-- Select Course --" },
                  ...courses.map(c => ({ value: c.id, label: `${c.code} ${c.title}` }))
                ]}
              />

              <Select
                label="Semester"
                value={formData.semesterId}
                onChange={v => handleChange("semesterId", v)}
                options={[
                  { value: "", label: "-- Select Semester --" },
                  ...semesters.map(s => ({ value: s.id, label: s.semester_number }))
                ]}
              />

              <Select
                label="Pre-requisite"
                value={formData.preRequisiteId}
                onChange={v => handleChange("preRequisiteId", v)}
                options={[
                  { value: "", label: "None" },
                  ...courses.map(c => ({ value: c.id, label: c.title }))
                ]}
              />

              <button type="submit" className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white transition
                ${isEdit ? "bg-primary hover:bg-secondary/40" : "bg-accentDark hover:bg-accent"}`}>
                {isEdit ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                {isEdit ? "Save Changes" : "Add Assignment"}
              </button>

              {isEdit && <button type="button" onClick={() => setIsEdit(false)} className="col-span-4 mt-2 py-2 rounded-xl bg-gray-400 hover:bg-gray-500 text-white">
                Cancel Update
              </button>}
            </form>
          </div>

          {/* TABLE */}
          <div className="max-w-[970px] mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-primary">Existing Assignments</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                  placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <Th>Department</Th>
                    <Th>Program</Th>
                    <Th>Semester</Th>
                    <Th>Instructor</Th>
                    <Th>Course</Th>
                    <Th>Pre-requisite</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssignments.map(a => (
                    <tr key={a.id} className="hover:bg-gray-100">
                      <Td>{a.department}</Td>
                      <Td>{a.program}</Td>
                      <Td>{a.semester}</Td>
                      <Td>{a.full_name}</Td>
                      <Td>{a.course}</Td>
                      <Td>{a.prereq_course || "None"}</Td>
                      <Td>
                        <button onClick={() => handleUpdateAssignment(a)} className="text-primary hover:text-secondary mr-3">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteAssignment(a.id)} className="text-accentDark hover:text-accent">
                          <Trash2 size={18} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAssignments.length === 0 && <p className="text-center text-gray-500 py-6">No assignments found.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
