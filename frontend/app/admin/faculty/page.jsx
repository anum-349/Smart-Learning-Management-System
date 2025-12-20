"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit, PlusCircle, Trash2, GraduationCap } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const initialNotifications = [
  { id: 1, text: "Quiz 3 graded - Score: 95%", isRead: false, type: "grade" },
  { id: 2, text: 'New lesson added: "Advanced React Hooks"', isRead: false, type: "course" },
  { id: 3, text: "Welcome to your new dashboard!", isRead: true, type: "general" },
  { id: 4, text: "Instructor John Doe posted a new announcement.", isRead: false, type: "announcement" },
];

export default function AdminFacultyManagement() {
  const [facultys, setFacultys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [updateData, setUpdateData] = useState({
    id: '',
    title: '',
    code: '',
    dean: '',
  });

  const [newFaculty, setNewFaculty] = useState({
    title: '',
    code: '',
    dean: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchFaculty = async () => {
    const facRes = await fetch(`${API_URL}/faculties`);
    const facData = await facRes.json();
    setFacultys(facData);
  }
  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      // Fetch faculties
      fetchFaculty();

      // Fetch instructors (deans)
      const instRes = await fetch(`${API_URL}/instructor/deans`);
      const instData = await instRes.json();
      setInstructors(instData || []);
    } catch (err) {
      console.error("Error fetching faculties:", err);
      alert("Failed to load faculties.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFacultys =
    facultys?.length > 0
      ? facultys.filter(d =>
        (d.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
        (d.code?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
      )
      : [];

  const handleChange = (field, value) => {
    if (isEdit) {
      setUpdateData({ ...updateData, [field]: value });
    } else {
      setNewFaculty({ ...newFaculty, [field]: value });
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.title || !newFaculty.code) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/faculties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newFaculty.title,
          code: newFaculty.code,
          dean_id: newFaculty.dean
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create faculty");
      }

      const createdFaculty = await res.json();

      setFacultys(prev => [
        ...prev,
        {
          ...createdFaculty,
          dean: instructors.find(i => i.id === createdFaculty.dean_id)
        }
      ]);

      setNewFaculty({ title: "", code: "", dean: "" });
      alert("Faculty created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleUpdateFaculty = (facl) => {
    setIsEdit(true);
    setUpdateData({
      id: facl.id,
      title: facl.title,
      code: facl.code,
      dean: facl.dean?.id || "" // must be dean id
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!updateData.title || !updateData.code || !updateData.dean) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/faculties/${updateData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateData.title,
          code: updateData.code,
          dean_id: updateData.dean
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update faculty");
      }

      const updatedFaculty = await res.json();

      fetchFaculty();

      setIsEdit(false);
      alert("Faculty updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const res = await fetch(`${API_URL}/faculties/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete faculty");
      }

      setFacultys(prev => prev.filter(f => f.id !== id));
      alert("Faculty deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const formData = isEdit ? updateData : newFaculty;

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType={"Admin"} />

      <main className="flex-1 ml-64">
        <Header user="Admin" notification={initialNotifications} />

        <div className="container mx-auto p-6 pt-10">
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Faculties</span>
          </div>

          {/* FORM CARD */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
            <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
              {isEdit ? "Update Faculty" : "Create New Faculty"}
            </h2>

            <form
              onSubmit={isEdit ? handleUpdateSubmit : handleAddFaculty}
              className="grid md:grid-cols-3 gap-4"
            >
              <Input
                label="Faculty Name"
                value={formData.title}
                placeholder="e.g. Computing"
                onChange={(v) => handleChange("title", v)}
              />
              <Input
                label="Code"
                value={formData.code}
                placeholder="FOC-123"
                onChange={(v) => handleChange("code", v)}
              />

              <Select
                label="Dean"
                value={formData.dean}
                onChange={(v) => { handleChange("dean", v); }}
                options={[
                  { value: "", label: "-- Select Dean --" },
                  ...instructors.map((d) => ({ value: d.id, label: d.full_name })),
                ]}
              />

              <button
                type="submit"
                className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white transition
                  ${isEdit ? "bg-primary hover:bg-secondary/40" : "bg-accentDark hover:bg-accent"}`}
              >
                {isEdit ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                {isEdit ? "Save Changes" : "Add Faculty"}
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
              <h2 className="text-lg font-bold text-primary">Existing Faculties</h2>
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
                    <Th>Faculty</Th>
                    <Th>Dean</Th>
                    <Th className="text-center">Departments</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFacultys.map((facl, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <Td>
                        <div className="font-semibold text-primary">{facl.title}</div>
                        <div className="text-xs text-accentDark font-mono">({facl?.code})</div>
                      </Td>

                      <Td>{facl.dean?.fullName}</Td>

                      <Td className="text-center text-primary font-semibold">
                        {facl.departmentCount || 0}
                        <GraduationCap className="inline ml-1" size={14} />
                      </Td>

                      <Td>
                        <button onClick={() => handleUpdateFaculty(facl)} className="text-primary hover:text-secondary mr-3">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteFaculty(facl.id)} className="text-accentDark hover:text-accent">
                          <Trash2 size={18} />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredFacultys.length === 0 && (
              <p className="text-center text-gray-500 py-6">No Faculties found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
