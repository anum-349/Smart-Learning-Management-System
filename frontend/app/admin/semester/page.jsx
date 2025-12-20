"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit, PlusCircle, Trash2 } from "lucide-react";

import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Input from "../../../components/Input";
import Select from "../../../components/Select";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const initialNotifications = [
  { id: 1, text: "Semester module loaded", isRead: false, type: "general" },
];

const API_URL = "http://localhost:5000/api";

export default function SemesterManagement() {
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [newSemester, setNewSemester] = useState({
    semesterNumber: "",
    startDate: "",
    endDate: "",
    batchId: "",
  });

  const [updateData, setUpdateData] = useState({
    id: "",
    semesterNumber: "",
    startDate: "",
    endDate: "",
    batchId: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/batches`)
      .then((res) => res.json())
      .then((data) =>
        setBatches(
          data.map((b) => ({
            id: b.id,
            title: b.title,
          }))
        )
      )
      .catch(console.error);
  }, []);

  /* ---------------- FETCH SEMESTERS ---------------- */
  const fetchSemesters = () => {
    fetch(`${API_URL}/semesters`)
      .then((res) => res.json())
      .then((data) =>
        setSemesters(
          data.map((s) => ({
            id: s.id,
            semesterNumber: s.semester_number,
            startDate: s.start_date,
            endDate: s.end_date,
            batch: {
              id: s.batch_id,
              title: s.batch_title,
            },
          }))
        )
      )
      .catch(console.error);
  };

  useEffect(fetchSemesters, []);

  /* ---------------- FILTER ---------------- */
  const filteredSemesters = semesters.filter((s) =>
    `${s.semesterNumber}`.includes(searchTerm)
  );

  /* ---------------- FORM HANDLER ---------------- */
  const formData = isEdit ? updateData : newSemester;

  const handleChange = (field, value) => {
    isEdit
      ? setUpdateData({ ...updateData, [field]: value })
      : setNewSemester({ ...newSemester, [field]: value });
  };

  /* ---------------- CREATE ---------------- */
  const handleAddSemester = async (e) => {
    e.preventDefault();

    if (!newSemester.batchId || !newSemester.endDate, !newSemester.semesterNumber, !newSemester.startDate ) {
        alert("fill all fields")
        return
    }

    const res = await fetch(`${API_URL}/semesters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        semester_number: newSemester.semesterNumber,
        start_date: newSemester.startDate,
        end_date: newSemester.endDate,
        batch_id: newSemester.batchId,
      }),
    });

    if (!res.ok) return alert("Failed to create semester");

    setNewSemester({
      semesterNumber: "",
      startDate: "",
      endDate: "",
      batchId: "",
    });

    fetchSemesters();
  };

  const toDateInputValue = (isoString) =>
  new Date(isoString).toISOString().split("T")[0];

  /* ---------------- EDIT ---------------- */
  const handleEdit = (s) => {
    setIsEdit(true);
    setUpdateData({
      id: s.id,
      semesterNumber: s.semesterNumber,
      startDate: toDateInputValue(s.startDate),
      endDate: toDateInputValue(s.endDate),
      batchId: s.batch.id,
    });
  };

  /* ---------------- UPDATE ---------------- */
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/semesters/${updateData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        semester_number: updateData.semesterNumber,
        start_date: updateData.startDate,
        end_date: updateData.endDate,
        batch_id: updateData.batchId,
      }),
    });

    if (!res.ok) return alert("Update failed");

    setIsEdit(false);
    fetchSemesters();
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    await fetch(`${API_URL}/semesters/${id}`, { method: "DELETE" });
    fetchSemesters();
  };

  const formatDisplayDate = (date) => {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType="Admin" />

      <main className="flex-1 ml-64">
        <Header user="Admin" notification={initialNotifications} />

        <div className="container mx-auto p-6 pt-10">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6">
            <Link href="/admin" className="hover:text-accentDark">
              Dashboard
            </Link>{" "}
            / Semesters
          </div>

          {/* FORM */}
          <div className="bg-light border rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
            <h2 className="text-xl font-bold mb-6">
              {isEdit ? "Update Semester" : "Create New Semester"}
            </h2>

            <form
              onSubmit={isEdit ? handleUpdateSubmit : handleAddSemester}
              className="grid md:grid-cols-4 gap-4"
            >
              <Input
                label="Semester Number"
                type="number"
                value={formData.semesterNumber}
                onChange={(v) => handleChange("semesterNumber", v)}
              />

              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(v) => handleChange("startDate", v)}
              />

              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(v) => handleChange("endDate", v)}
              />

              <Select
                label="Batch"
                value={formData.batchId}
                onChange={(v) => handleChange("batchId", v)}
                options={[
                  { value: "", label: "-- Select Batch --" },
                  ...batches.map((b) => ({
                    value: b.id,
                    label: b.title,
                  })),
                ]}
              />

              <button
                type="submit"
                className={`col-span-4 py-2 rounded-xl text-white font-semibold ${
                  isEdit
                    ? "bg-primary hover:bg-secondary/40"
                    : "bg-accentDark hover:bg-accent"
                }`}
              >
                {isEdit ? "Save Changes" : "Add Semester"}
              </button>

              {isEdit && (
                <button
                  type="button"
                  onClick={() => setIsEdit(false)}
                  className="col-span-4 py-2 rounded-xl bg-gray-400 text-white"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          {/* TABLE */}
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between mb-3">
              <h2 className="text-lg font-bold">Existing Semesters</h2>

              <input
                className="border rounded-xl px-3 py-2"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <table className="w-full text-sm border rounded-xl overflow-hidden">
              <thead className="bg-primary text-white">
                <tr>
                  <Th>Semester</Th>
                  <Th>Duration</Th>
                  <Th>Batch</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filteredSemesters.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-100">
                    <Td>Semester {s.semesterNumber}</Td>
                    <Td>{formatDisplayDate(s.startDate)} - {formatDisplayDate(s.endDate)}</Td>
                    <Td>{s.batch.title}</Td>
                    <Td>
                      <button onClick={() => handleEdit(s)} className="mr-3">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(s.id)}>
                        <Trash2 size={16} />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSemesters.length === 0 && (
              <p className="text-center py-6 text-gray-500">
                No semesters found.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
