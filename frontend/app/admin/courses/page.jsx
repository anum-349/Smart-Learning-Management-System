"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit, PlusCircle, Trash2 } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Input from "../../../components/Input";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const initialNotifications = [
  { id: 1, text: "New course added", isRead: false, type: "general" },
];

export default function AdminCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [updateData, setUpdateData] = useState({ id: "", title: "", code: "", creditHours: "" });
  const [newCourse, setNewCourse] = useState({ title: "", code: "", creditHours: "" });

  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then(res => res.json())
      .then(data =>
        setCourses( data?
          data.map(c => ({
            id: c.id,
            title: c.title,
            code: c.code,
            creditHours: c.credit_hours,
          })) : []
        )
      );
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.creditHours.toString().includes(searchTerm)
  );

  const handleAddCourse = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    });

    const data = await res.json();

    setCourses([...courses, {
      id: data.id,
      title: data.title,
      code: data.code,
      creditHours: data.credit_hours,
    }]);

    setNewCourse({ title: "", code: "", creditHours: "" });
  };


  const handleUpdateCourse = (course) => {
    setIsEdit(true);
    setUpdateData({ ...course, creditHours: course.creditHours.toString() });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    console.log(updateData)

    const res = await fetch(
      `http://localhost:5000/api/courses/${updateData.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      }
    );

    const data = await res.json();

    setCourses(courses.map(c =>
      c.id === data.id
        ? { ...c, ...updateData }
        : c
    ));

    setIsEdit(false);
  };


  const handleDeleteCourse = async (id) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`http://localhost:5000/api/courses/${id}`, {
      method: "DELETE",
    });

    setCourses(courses.filter(c => c.id !== id));
  };

  const formData = isEdit ? updateData : newCourse;
  const handleChange = (field, value) => {
    isEdit
      ? setUpdateData({ ...updateData, [field]: value })
      : setNewCourse({ ...newCourse, [field]: value });
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
            <span>Courses</span>
          </div>

          {/* FORM CARD */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
            <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
              {isEdit ? "Update Course" : "Create New Course"}
            </h2>

            <form
              onSubmit={isEdit ? handleUpdateSubmit : handleAddCourse}
              className="grid md:grid-cols-3 gap-4"
            >
              <Input
                label="Course Title"
                value={formData.title}
                placeholder="e.g. Data Structures"
                onChange={(v) => handleChange("title", v)}
              />
              <Input
                label="Code"
                value={formData.code}
                placeholder="e.g. CS201"
                onChange={(v) => handleChange("code", v)}
              />
              <Input
                label="Credit Hours"
                value={formData.creditHours}
                placeholder="e.g. 3"
                onChange={(v) => handleChange("creditHours", v)}
              />

              <button
                type="submit"
                className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white transition
                  ${isEdit ? "bg-primary hover:bg-secondary/40" : "bg-accentDark hover:bg-accent"}`}
              >
                {isEdit ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                {isEdit ? "Save Changes" : "Add Course"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={() => setIsEdit(false)}
                  className="col-span-4 mt-2 py-2 rounded-xl bg-gray-400 hover:bg-gray-500 text-white"
                >
                  Cancel Update
                </button>
              )}
            </form>
          </div>

          {/* TABLE */}
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-primary">Existing Courses</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 text-gray-400" />
                <input
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-3 py-2 focus:ring-accentDark"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
              <table className="w-full text-sm">
                <thead className="bg-primary text-white">
                  <tr>
                    <Th>Course</Th>
                    <Th>Code</Th>
                    <Th>Credit Hours</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCourses.map((c, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <Td>{c.title}</Td>
                      <Td>{c.code}</Td>
                      <Td>{c.creditHours}</Td>
                      <Td>
                        <button
                          onClick={() => handleUpdateCourse(c)}
                          className="text-primary hover:text-secondary mr-3"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="text-accentDark hover:text-accent"
                        >
                          <Trash2 size={18} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCourses.length === 0 && (
              <p className="text-center text-gray-500 py-6">No courses found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
