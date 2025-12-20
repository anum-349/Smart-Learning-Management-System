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

const facultiesData = [
  { _id: "f1", title: "Faculty of Computing" },
  { _id: "f2", title: "Faculty of Science" },
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

const batchesData = [
  { _id: "b1", title: "CS-2025", programId: "p1" },
  { _id: "b2", title: "SE-2025", programId: "p2" },
];

const instructorsData = [
  { _id: "i1", firstName: "Ali", lastName: "Akbar" },
  { _id: "i2", firstName: "Wajdan", lastName: "Akbar" },
];

const coursesData = [
  { _id: "c1", title: "Data Structures", programId: "p1" },
  { _id: "c2", title: "Algorithms", programId: "p1" },
  { _id: "c3", title: "Software Design", programId: "p2" },
];

const semestersData = [
  { _id: "s1", title: "Fall 2025" },
  { _id: "s2", title: "Spring 2026" },
];

export default function AdminCourseAssignment() {
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEdit, setIsEdit] = useState(false);

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
    _id: "",
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

  useEffect(() => {
    setAssignments([]);
  }, []);

  // Filtered dropdowns
  const filteredDepartments = departmentsData.filter(d => d.facultyId === formData.facultyId);
  const filteredPrograms = programsData.filter(p => p.departmentId === formData.departmentId);
  const filteredBatches = batchesData.filter(b => b.programId === formData.programId);
  const filteredCourses = coursesData.filter(c => c.programId === formData.programId);

  const filteredAssignments = assignments.filter(a =>
    a.instructor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (field, value) => {
    isEdit
      ? setUpdateData({ ...updateData, [field]: value })
      : setNewAssignment({ ...newAssignment, [field]: value });
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();

    const instructor = instructorsData.find(i => i._id === formData.instructorId);
    const course = coursesData.find(c => c._id === formData.courseId);
    const batch = batchesData.find(b => b._id === formData.batchId);
    const semester = semestersData.find(s => s._id === formData.semesterId);
    const preReq = coursesData.find(c => c._id === formData.preRequisiteId) || null;

    setAssignments([...assignments, {
      _id: Date.now().toString(),
      facultyId: formData.facultyId,
      departmentId: formData.departmentId,
      programId: formData.programId,
      batch,
      instructor,
      course,
      semester,
      preRequisite: preReq,
    }]);

    setNewAssignment({
      facultyId: "",
      departmentId: "",
      programId: "",
      batchId: "",
      instructorId: "",
      courseId: "",
      semesterId: "",
      preRequisiteId: "",
    });
  };

  const handleUpdateAssignment = (a) => {
    setIsEdit(true);
    setUpdateData({
      _id: a._id,
      facultyId: a.facultyId,
      departmentId: a.departmentId,
      programId: a.programId,
      batchId: a.batch?._id || "",
      instructorId: a.instructor?._id || "",
      courseId: a.course?._id || "",
      semesterId: a.semester?._id || "",
      preRequisiteId: a.preRequisite?._id || "",
    });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const updatedList = assignments.map(a => 
      a._id === updateData._id
        ? {
            ...a,
            facultyId: updateData.facultyId,
            departmentId: updateData.departmentId,
            programId: updateData.programId,
            batch: batchesData.find(b => b._id === updateData.batchId),
            instructor: instructorsData.find(i => i._id === updateData.instructorId),
            course: coursesData.find(c => c._id === updateData.courseId),
            semester: semestersData.find(s => s._id === updateData.semesterId),
            preRequisite: coursesData.find(c => c._id === updateData.preRequisiteId) || null,
          }
        : a
    );
    setAssignments(updatedList);
    setIsEdit(false);
  };

  const handleDeleteAssignment = (id) => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      setAssignments(assignments.filter(a => a._id !== id));
    }
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
              <Select label="Faculty" value={formData.facultyId} onChange={v => handleChange("facultyId", v)}
                options={facultiesData.map(f => ({ value: f._id, label: f.title }))} />

              <Select label="Department" value={formData.departmentId} onChange={v => handleChange("departmentId", v)}
                options={filteredDepartments.map(d => ({ value: d._id, label: d.title }))} />

              <Select label="Program" value={formData.programId} onChange={v => handleChange("programId", v)}
                options={filteredPrograms.map(p => ({ value: p._id, label: p.title }))} />

              <Select label="Batch" value={formData.batchId} onChange={v => handleChange("batchId", v)}
                options={filteredBatches.map(b => ({ value: b._id, label: b.title }))} />

              <Select label="Instructor" value={formData.instructorId} onChange={v => handleChange("instructorId", v)}
                options={instructorsData.map(i => ({ value: i._id, label: `${i.firstName} ${i.lastName}` }))} />

              <Select label="Course" value={formData.courseId} onChange={v => handleChange("courseId", v)}
                options={filteredCourses.map(c => ({ value: c._id, label: c.title }))} />

              <Select label="Semester" value={formData.semesterId} onChange={v => handleChange("semesterId", v)}
                options={semestersData.map(s => ({ value: s._id, label: s.title }))} />

              <Select label="Pre-requisite" value={formData.preRequisiteId} onChange={v => handleChange("preRequisiteId", v)}
                options={[{ value: "", label: "None" }, ...filteredCourses.map(c => ({ value: c._id, label: c.title }))]} />

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
                    <tr key={a._id} className="hover:bg-gray-100">
                      <Td>{departmentsData.find(d => d._id === a.departmentId)?.title}</Td>
                      <Td>{programsData.find(p => p._id === a.programId)?.title}</Td>
                      <Td>{a.semester?.title}</Td>
                      <Td>{a.instructor?.firstName} {a.instructor?.lastName}</Td>
                      <Td>{a.course?.title}</Td>
                      <Td>{a.preRequisite?.title || "None"}</Td>
                      <Td>
                        <button onClick={() => handleUpdateAssignment(a)} className="text-primary hover:text-secondary mr-3">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteAssignment(a._id)} className="text-accentDark hover:text-accent">
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
