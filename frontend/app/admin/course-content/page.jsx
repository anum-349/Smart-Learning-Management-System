"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, FileText, Video, Edit, Search } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Link from "next/link";

import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

export default function AdminCourseContent() {
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [contents, setContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [newContent, setNewContent] = useState({
    departmentId: "",
    programId: "",
    courseId: "",
    type: "Other",
    title: "",
    file: null,
    description: ""
  });

  // ----------------- Fetch Data from Backend -----------------
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/departments`)
      .then(res => res.json())
      .then(setDepartments);

    fetchContents();
  }, []);

  // Fetch Programs on Department select
  useEffect(() => {
    if (!newContent.departmentId) {
      setPrograms([]);
      setCourses([]);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/programs?departmentId=${newContent.departmentId}`)
      .then(res => res.json())
      .then(setPrograms);
    setCourses([]);
  }, [newContent.departmentId]);

  // Fetch Courses on Program select
  useEffect(() => {
    if (!newContent.programId) {
      setCourses([]);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses?programId=${newContent.programId}`)
      .then(res => res.json())
      .then(setCourses);
  }, [newContent.programId]);

  // Fetch all contents
  const fetchContents = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-contents`)
      .then(res => res.json())
      .then(setContents);
  };

  // ----------------- Handlers -----------------
  const handleChange = (field, value) => {
    if (field === "departmentId") {
      setNewContent({ ...newContent, departmentId: value, programId: "", courseId: "" });
    } else if (field === "programId") {
      setNewContent({ ...newContent, programId: value, courseId: "" });
    } else if (field === "file") {
      setNewContent(prev => ({ ...prev, [field]: value }))
    } else {
      setNewContent({ ...newContent, [field]: value });
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    if (!newContent.departmentId || !newContent.programId || !newContent.courseId || !newContent.title || !newContent.file) {
      alert("All fields including file are required");
      return;
    }

    const formData = new FormData();
    formData.append("departmentId", newContent.departmentId);
    formData.append("programId", newContent.programId);
    formData.append("courseId", newContent.courseId);
    formData.append("type", newContent.type);
    formData.append("title", newContent.title);
    formData.append("description", newContent.description);
    formData.append("file", newContent.file);

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-contents/upload`, {
      method: "POST",
      body: formData
    });

    setNewContent({ departmentId: "", programId: "", courseId: "", type: "Other", title: "", file: null, description: "" });
    fetchContents();
  };

  const handleDeleteContent = async (id) => {
    if (!confirm("Are you sure you want to delete this content?")) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course-contents/${id}`, { method: "DELETE" });
    fetchContents();
  };

  // Filtered contents by search term
  const filteredContents = contents.filter(c => {
    const course = courses.find(course => course.id === c.course_id);
    return (
      course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Icon based on type
  const typeIcon = (type) => {
    switch (type) {
      case "Video": return <Video size={16} className="inline mr-1" />;
      case "Document": return <FileText size={16} className="inline mr-1" />;
      default: return <Edit size={16} className="inline mr-1" />;
    }
  };

  // Filter programs/courses for selects
  const filteredPrograms = programs.filter(p => !newContent.departmentId || p.department_id === newContent.departmentId);
  const filteredCourses = courses.filter(c => !newContent.programId || c.program_id === newContent.programId);

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType={"Admin"} />
      <main className="flex-1 ml-64">
        <Header user="Admin" notification={[]} />

        <div className="container mx-auto p-6 pt-10">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Course Content</span>
          </div>

          {/* Form Card */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
            <h2 className="text-xl font-bold mb-6 text-primary flex items-center">
              <PlusCircle className="mr-2" /> Upload New Content
            </h2>

            <form onSubmit={handleAddContent} className="grid md:grid-cols-3 gap-4">
              <Select
                label="Department"
                value={newContent.departmentId}
                onChange={v => handleChange("departmentId", v)}
                options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d.dept_id, label: d.title }))]}
              />
              <Select
                label="Program"
                value={newContent.programId}
                onChange={v => handleChange("programId", v)}
                options={[{ value: "", label: "Select Program" }, ...programs.map(p => ({ value: p.id, label: p.title }))]}
              />
              <Select
                label="Course"
                value={newContent.courseId}
                onChange={v => handleChange("courseId", v)}
                options={[{ value: "", label: "Select Course" }, ...courses.map(c => ({ value: c.id, label: c.title }))]}
              />
              <Select
                label="Content Type"
                value={newContent.type}
                onChange={v => handleChange("type", v)}
                options={[
                  { value: "Video", label: "Video" },
                  { value: "Document", label: "Document" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <Input
                label="Title"
                value={newContent.title}
                placeholder="Content title"
                onChange={v => handleChange("title", v)}
              />

              <div className="flex flex-col">
                <label className="text-xs text-secondary mb-1">Upload File</label>
                <input
                  type="file"
                  onChange={(e) => handleChange("file", e.target.files[0])}
                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-accentDark placeholder:text-secondary" />
              </div>

              <Input
                label="Description"
                value={newContent.description}
                placeholder="Optional description"
                onChange={v => handleChange("description", v)}
              />

              <button type="submit" className="col-span-3 py-2 rounded-xl bg-accentDark hover:bg-accent text-white font-semibold flex items-center justify-center mt-2">
                <PlusCircle className="mr-2" /> Upload Content
              </button>
            </form>
          </div>

          {/* Search & Table */}
          <div className="max-w-5xl mx-auto">
            <div className="relative w-64 mb-4">
              <Search className="absolute left-3 top-3 text-gray-400" />
              <input
                className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                placeholder="Search by course or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <Th>Department</Th>
                    <Th>Program</Th>
                    <Th>Course</Th>
                    <Th>Type</Th>
                    <Th>Title</Th>
                    <Th>Description</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {contents.map(c => {
                    return (
                      <tr key={c.id} className="hover:bg-gray-100">
                        <Td>{c.department_name}</Td>
                        <Td>{c.program_name}</Td>
                        <Td>{c.course_name}</Td>
                        <Td>{typeIcon(c.type)} {c.type}</Td>
                        <Td>
                          {c.file_url ? (
                            <a href={`http://localhost:5000${c.file_url}`} target="_blank" className="text-blue-600 hover:underline">
                              {c.title}
                            </a>
                          ) : "-"}
                        </Td>
                        <Td>{c.description || "-"}</Td>
                        <Td>
                          <button onClick={() => handleDeleteContent(c.id)} className="text-accentDark hover:text-accent flex items-center gap-1">
                            <Trash2 size={16} /> Delete
                          </button>
                        </Td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredContents.length === 0 && (
                <p className="text-center text-gray-500 py-6">No content available.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
