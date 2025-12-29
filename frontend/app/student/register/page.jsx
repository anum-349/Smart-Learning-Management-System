"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Select from "../../../components/Select";
import { useRouter } from "next/navigation";

const initialForm = {
  user_id: "",
  username: "",
  full_name: "",
  father_name: "",
  email: "",
  date_of_birth: "",
  phone: "",
  gender: "",
  address: "",
  cnic: "",
  role: "Student",
  registration_no: "",
  department_id: "",
  program_id: "",
  semester_id: "",
  status: "active",
  qualifications: [],
};

export default function StudentRegistrationPage() {
  const [form, setForm] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      user_id: localStorage.getItem("userId"),
      email: localStorage.getItem("userEmail"),
    }));
  }, []);

  /* ---------------- LOAD DROPDOWNS ---------------- */
  useEffect(() => {
    fetch(`${API_URL}/departments`).then(r => r.json()).then(setDepartments);
    fetch(`${API_URL}/programs`).then(r => r.json()).then(setPrograms);
    fetch(`${API_URL}/semesters`).then(r => r.json()).then(setSemesters);
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleQualificationAdd = () => {
    setForm({
      ...form,
      qualifications: [
        ...form.qualifications,
        { degree: "", field: "", institution: "", year: "", documentFile: null },
      ],
    });
  };

  const handleQualificationChange = (i, key, value) => {
    const updated = [...form.qualifications];
    updated[i][key] = value;
    setForm({ ...form, qualifications: updated });
  };

  const handleQualificationDocChange = (i, file) => {
    const updated = [...form.qualifications];
    updated[i].documentFile = file;
    setForm({ ...form, qualifications: updated });
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([k, v]) => {
      if (k !== "qualifications") formData.append(k, v);
    });

    if (profileImage) {
      formData.append("profile_picture", profileImage);
    }

    const qualText = form.qualifications.map(({ documentFile, ...rest }) => rest);
    formData.append("qualifications", JSON.stringify(qualText));

    form.qualifications.forEach(q => {
      if (q.documentFile) {
        formData.append("qualificationDocs", q.documentFile);
      }
    });

    try {
      const res = await fetch(`${API_URL}/registration/student/register`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save student");
      alert("✅ Student saved successfully");
      router.push("/admin/students");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex min-h-screen bg-textDark p-6 text-textDark">
      <div className="max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-6">
            Student Registration / Update
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* PROFILE IMAGE */}
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28">
                <Image
                  src={preview || "/avatar-placeholder.png"}
                  alt="Profile"
                  fill
                  className="rounded-lg object-cover border"
                />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* BASIC INFO */}
            <section>
              <h2 className="font-medium mb-4">Basic Information</h2>
              <div className="grid grid-cols-4 gap-4">
                {[
                  ["Username", "username"],
                  ["Full Name", "full_name"],
                  ["Father Name", "father_name"],
                  ["Email", "email"],
                  ["Phone", "phone"],
                  ["CNIC", "cnic"],
                  ["Date of Birth", "date_of_birth"],
                ].map(([label, name]) => (
                  <div key={name}>
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      name={name}
                      type={name === "date_of_birth" ? "date" : "text"}
                      value={form[name]}
                      readOnly={name === "email"}
                      onChange={handleChange}
                      className={`w-full mt-1 px-3 py-2 border rounded-md text-sm ${
                        name === "email" ? "bg-gray-100" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* PERSONAL */}
            <section>
              <h2 className="font-medium mb-4">Personal Details</h2>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="text-xs text-gray-500">Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>
            </section>

            {/* ACADEMIC */}
            <section>
              <h2 className="font-medium mb-4">Academic Details</h2>
              <div className="grid grid-cols-4 gap-4">
                <Select
                  label="Department"
                  value={form.department_id}
                  onChange={(v) => setForm({ ...form, department_id: v })}
                  options={[
                    { value: "", label: "Select" },
                    ...departments.map(d => ({ value: d.dept_id, label: d.title })),
                  ]}
                />
                <Select
                  label="Program"
                  value={form.program_id}
                  onChange={(v) => setForm({ ...form, program_id: v })}
                  options={[
                    { value: "", label: "Select" },
                    ...programs.map(p => ({ value: p.id, label: p.title })),
                  ]}
                />
                <Select
                  label="Semester"
                  value={form.semester_id}
                  onChange={(v) => setForm({ ...form, semester_id: v })}
                  options={[
                    { value: "", label: "Select" },
                    ...semesters.map(s => ({ value: s.id, label: s.semester_number })),
                  ]}
                />
              </div>
            </section>

            {/* QUALIFICATIONS */}
            <section>
              <button
                type="button"
                onClick={handleQualificationAdd}
                className="border px-4 py-2 rounded"
              >
                + Add Qualification
              </button>

              {form.qualifications.map((q, i) => (
                <div key={i} className="border p-4 rounded-lg mt-4">
                  <h3 className="font-semibold mb-2">
                    Qualification #{i + 1}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <input placeholder="Degree" value={q.degree}
                      onChange={(e) => handleQualificationChange(i, "degree", e.target.value)}
                      className="border px-3 py-2 rounded" />
                    <input placeholder="Field" value={q.field}
                      onChange={(e) => handleQualificationChange(i, "field", e.target.value)}
                      className="border px-3 py-2 rounded" />
                    <input placeholder="Institution" value={q.institution}
                      onChange={(e) => handleQualificationChange(i, "institution", e.target.value)}
                      className="border px-3 py-2 rounded" />
                    <input type="number" placeholder="Year" value={q.year}
                      onChange={(e) => handleQualificationChange(i, "year", e.target.value)}
                      className="border px-3 py-2 rounded" />
                    <input type="file"
                      onChange={(e) => handleQualificationDocChange(i, e.target.files[0])} />
                  </div>
                </div>
              ))}
            </section>

            {/* SUBMIT */}
            <div className="flex justify-end">
              <button className="px-6 py-2 bg-primary text-white rounded-md">
                Save Student
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
