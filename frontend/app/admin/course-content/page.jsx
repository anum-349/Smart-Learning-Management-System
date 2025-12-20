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

// Mock data
const initialNotifications = [
  { id: 1, text: "New content uploaded", isRead: false, type: "general" },
];

const departmentsData = [
  { _id: "d1", title: "Computer Science" },
  { _id: "d2", title: "Software Engineering" },
];

const programsData = [
  { _id: "p1", title: "BS CS 2025", departmentId: "d1" },
  { _id: "p2", title: "BS SE 2025", departmentId: "d2" },
];

const coursesData = [
  { _id: "c1", title: "Data Structures", programId: "p1" },
  { _id: "c2", title: "Algorithms", programId: "p1" },
  { _id: "c3", title: "Software Design", programId: "p2" },
];

const initialContent = [
  { _id: "ct1", departmentId: "d1", programId: "p1", courseId: "c1", type: "Video", title: "Intro to DS", fileUrl: "https://example.com/video1.mp4", description: "Basics of DS" },
];

export default function AdminCourseContent() {
  const [contents, setContents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);

  const [newContent, setNewContent] = useState({
    departmentId: "",
    programId: "",
    courseId: "",
    type: "Other",
    title: "",
    fileUrl: "",
    description: ""
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setContents(initialContent);
    setDepartments(departmentsData);
    setPrograms(programsData);
    setCourses(coursesData);
  }, []);

  // Filter programs and courses based on selection
  const filteredPrograms = programs.filter(p => !newContent.departmentId || p.departmentId === newContent.departmentId);
  const filteredCourses = courses.filter(c => !newContent.programId || c.programId === newContent.programId);

  const handleChange = (field, value) => {
    if (field === "departmentId") {
      setNewContent({ ...newContent, departmentId: value, programId: "", courseId: "" });
    } else if (field === "programId") {
      setNewContent({ ...newContent, programId: value, courseId: "" });
    } else {
      setNewContent({ ...newContent, [field]: value });
    }
  };

  const handleAddContent = (e) => {
    e.preventDefault();
    if (!newContent.departmentId || !newContent.programId || !newContent.courseId || !newContent.title) {
      alert("All fields are required");
      return;
    }
    setContents([...contents, { ...newContent, _id: Date.now().toString() }]);
    setNewContent({ departmentId: "", programId: "", courseId: "", type: "Other", title: "", fileUrl: "", description: "" });
  };

  const handleDeleteContent = (id) => {
    if (confirm("Are you sure you want to delete this content?")) {
      setContents(contents.filter(c => c._id !== id));
    }
  };

  const filteredContents = contents.filter(c => {
    const course = courses.find(course => course._id === c.courseId);
    return (
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const typeIcon = (type) => {
    switch(type) {
      case "Video": return <Video size={16} className="inline mr-1" />;
      case "Document": return <FileText size={16} className="inline mr-1" />;
      default: return <Edit size={16} className="inline mr-1" />;
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
            <span>Course Content</span>
          </div>

          {/* Form */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
            <h2 className="text-xl font-bold mb-6 text-primary flex items-center">
              <PlusCircle className="mr-2" /> Upload New Content
            </h2>

            <form onSubmit={handleAddContent} className="grid md:grid-cols-3 gap-4">
              <Select
                label="Department"
                value={newContent.departmentId}
                onChange={(v) => handleChange("departmentId", v)}
                options={[{ value: "", label: "Select Department" }, ...departments.map(d => ({ value: d._id, label: d.title }))]}
              />
              <Select
                label="Program/Batch"
                value={newContent.programId}
                onChange={(v) => handleChange("programId", v)}
                options={[{ value: "", label: "Select Program/Batch" }, ...filteredPrograms.map(p => ({ value: p._id, label: p.title }))]}
              />
              <Select
                label="Course"
                value={newContent.courseId}
                onChange={(v) => handleChange("courseId", v)}
                options={[{ value: "", label: "Select Course" }, ...filteredCourses.map(c => ({ value: c._id, label: c.title }))]}
              />
              <Select
                label="Content Type"
                value={newContent.type}
                onChange={(v) => handleChange("type", v)}
                options={[
                  { value: "Video", label: "Video" },
                  { value: "Document", label: "Document" },
                  { value: "Quiz", label: "Quiz" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <Input
                label="Title"
                value={newContent.title}
                placeholder="Content title"
                onChange={(v) => handleChange("title", v)}
              />
              <Input
                label="File URL"
                value={newContent.fileUrl}
                placeholder="https://example.com/file"
                onChange={(v) => handleChange("fileUrl", v)}
              />
              <Input
                label="Description"
                value={newContent.description}
                placeholder="Optional description"
                onChange={(v) => handleChange("description", v)}
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
                    <Th>Program/Batch</Th>
                    <Th>Course</Th>
                    <Th>Type</Th>
                    <Th>Title</Th>
                    <Th>Description</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContents.map((c) => {
                    const department = departments.find(d => d._id === c.departmentId);
                    const program = programs.find(p => p._id === c.programId);
                    const course = courses.find(crs => crs._id === c.courseId);
                    return (
                      <tr key={c._id} className="hover:bg-gray-100">
                        <Td>{department?.title}</Td>
                        <Td>{program?.title}</Td>
                        <Td>{course?.title}</Td>
                        <Td>{typeIcon(c.type)} {c.type}</Td>
                        <Td>{c.title}</Td>
                        <Td>{c.description || "-"}</Td>
                        <Td>
                          <button onClick={() => handleDeleteContent(c._id)} className="text-accentDark hover:text-accent flex items-center gap-1">
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
