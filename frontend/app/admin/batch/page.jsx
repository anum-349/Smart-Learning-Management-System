"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Edit, PlusCircle, Trash2 } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Select from "../../../components/Select";
import Input from "../../../components/Input";
import Td from "../../../components/Td";
import Th from "../../../components/Th";

const initialNotifications = [
  { id: 1, text: "New batch created", isRead: false, type: "general" },
];

export default function AdminBatchManagement() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  const [newBatch, setNewBatch] = useState({
    title: "",
    year: "",
    term: "",
    programId: "",
    batchAdvisor: "",
  });

  const [updateData, setUpdateData] = useState({
    id: "",
    title: "",
    year: "",
    term: "",
    programId: "",
    batchAdvisor: "",
  });

  // ------------------ Fetch Data ------------------
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchBatches = async () => {
    const batchRes = await fetch(`${API_URL}/batches`);
    const batchData = await batchRes.json();
    setBatches(batchData);
  }

  const fetchAllData = async () => {
    try {
      // Fetch batches
      fetchBatches()

      // Fetch programs
      const progRes = await fetch(`${API_URL}/programs`);
      const progData = await progRes.json();
      setPrograms(progData);

      // Fetch instructors
      const instrRes = await fetch(`${API_URL}/instructor/advisor`);
      const instrData = await instrRes.json();
      setInstructors(instrData);
    } catch (err) {
      console.error(err);
      alert("Failed to load data.");
    }
  };

  // ------------------ Filter ------------------
  const filteredBatches = batches.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.program?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${b.batch_advisor?.firstName} ${b.batch_advisor?.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // ------------------ CREATE ------------------
  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.title || !newBatch.year || !newBatch.term || !newBatch.programId || !newBatch.batchAdvisor) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBatch.title,
          year: newBatch.year,
          term: newBatch.term,
          program_id: newBatch.programId,
          batch_advisor_id: newBatch.batchAdvisor,
        }),
      });

      if (!res.ok) throw new Error("Failed to create batch.");

      const createdBatch = await res.json();

      fetchBatches()

      setNewBatch({ title: "", year: "", term: "", programId: "", batchAdvisor: "" });
      alert("Batch created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ------------------ UPDATE ------------------
  const handleUpdateBatch = (b) => {
    setIsEdit(true);
    setUpdateData({
      id: b.id,
      title: b.title,
      year: b.year,
      term: b.term,
      programId: b.program_id || "",
      batchAdvisor: b.batch_advisor_id || "",
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    console.log(updateData)
    try {
      const res = await fetch(`${API_URL}/batches/${updateData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updateData.title,
          year: updateData.year,
          term: updateData.term,
          program_id: updateData.programId,
          batch_advisor_id: updateData.batchAdvisor,
        }),
      });
      if (!res.ok) throw new Error("Failed to update batch.");

      const updatedBatch = await res.json();
      fetchBatches()
      setIsEdit(false);
      alert("Batch updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ------------------ DELETE ------------------
  const handleDeleteBatch = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_URL}/batches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete batch.");
      fetchBatches()
      alert("Batch deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ------------------ Form Handling ------------------
  const formData = isEdit ? updateData : newBatch;
  const handleChange = (field, value) => {
    isEdit
      ? setUpdateData({ ...updateData, [field]: value })
      : setNewBatch({ ...newBatch, [field]: value });
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
            <span>Batches</span>
          </div>

          {/* FORM */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto mb-10">
            <h2 className="text-xl font-bold flex items-center mb-6 text-primary">
              {isEdit ? "Update Batch" : "Create New Batch"}
            </h2>

            <form
              onSubmit={isEdit ? handleUpdateSubmit : handleAddBatch}
              className="grid md:grid-cols-4 gap-4"
            >
              <Input
                label="Batch Title"
                value={formData.title}
                onChange={(v) => handleChange("title", v)}
              />
              <Input
                label="Year"
                value={formData.year}
                onChange={(v) => handleChange("year", v)}
              />
              <Select
                label="Term"
                value={formData.term}
                onChange={(v) => handleChange("term", v)}
                options={[
                  { value: "", label: "-- Term --" },
                  { value: "Fall", label: "Fall" },
                  { value: "Spring", label: "Spring" },
                  { value: "Summer", label: "Summer" },
                ]}
              />
              <Select
                label="Program"
                value={formData.programId}
                onChange={(v) => handleChange("programId", v)}
                options={[
                  { value: "", label: "-- Select Program --" },
                  ...programs.map((d) => ({ value: d.id, label: d.title })),
                ]} />
              <Select
                label="Batch Advisor"
                value={formData.batchAdvisor}
                onChange={(v) => { handleChange("batchAdvisor", v); console.log(instructors) }}
                options={[
                  { value: "", label: "-- Select Advisor --" },
                  ...instructors.map((d) => ({ value: d.id, label: d.full_name })),
                ]}
              />

              <button type="submit" className={`col-span-4 mt-2 py-2 rounded-xl flex items-center justify-center font-semibold text-white ${isEdit ? "bg-primary hover:bg-secondary/40" : "bg-accentDark hover:bg-accent"}`}>
                {isEdit ? <Edit className="mr-2" /> : <PlusCircle className="mr-2" />}
                {isEdit ? "Save Changes" : "Add Batch"}
              </button>

              {isEdit && (
                <button type="button" onClick={() => setIsEdit(false)} className="col-span-4 mt-2 py-2 rounded-xl bg-gray-400 hover:bg-gray-500 text-white">
                  Cancel Update
                </button>
              )}
            </form>
          </div>

          {/* TABLE */}
          <BatchTable batches={filteredBatches} onEdit={handleUpdateBatch} onDelete={handleDeleteBatch} />
        </div>
      </main>
    </div>
  );
}

const BatchTable = ({ batches, onEdit, onDelete }) => (
  <div className="max-w-5xl mx-auto">
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-light shadow-md">
      <table className="w-full text-sm">
        <thead className="bg-primary text-white">
          <tr>
            <Th>Batch</Th>
            <Th>Year</Th>
            <Th>Term</Th>
            <Th>Program</Th>
            <Th>Advisor</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {batches.map((b) => (
            <tr key={b.id} className="hover:bg-gray-100">
              <Td>{b.title}</Td>
              <Td>{b.year}</Td>
              <Td>{b.term}</Td>
              <Td>{b.program_title}</Td>
              <Td>{b.full_name}</Td>
              <Td>
                <button onClick={() => onEdit(b)} className="text-primary hover:text-secondary mr-3"><Edit size={18} /></button>
                <button onClick={() => onDelete(b.id)} className="text-accentDark hover:text-accent"><Trash2 size={18} /></button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {batches.length === 0 && <p className="text-center text-gray-500 py-6">No batches found.</p>}
  </div>
);
