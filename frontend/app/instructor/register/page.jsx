"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const initialForm = {
    userName: "",
    firstName: "",
    lastName: "",
    fatherName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    address: "",
    cnic: "",
    rank: "",
    officeTiming: "",
    employmentTypeId: "",
    departmentId: "",
    researchSpeciality: "",
    qualifications: []
};


export default function InstructorRegistrationPage() {
    const [form, setForm] = useState(initialForm);
    const [profileImage, setProfileImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const router = useRouter()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleQualificationAdd = () => {
        setForm({
            ...form,
            qualifications: [
                ...form.qualifications,
                {
                    degree: "",
                    field: "",
                    institution: "",
                    year: "",
                    documentFile: null,
                },
            ],
        });
    };

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileFile(file);
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, profilePicture: url });
        }
    };
    const handleQualificationChange = (qIndex, field, value) => {
        const updated = [...formData.qualifications];
        updated[qIndex][field] = value;
        setFormData({ ...formData, qualifications: updated });
    };

    const handleQualificationDocChange = (qIndex, file) => {
        const updated = [...form.qualifications];
        updated[qIndex].documentFile = file; // temporary file object
        setForm({ ...form, qualifications: updated });
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfileImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        Object.entries(form).forEach(([key, value]) => formDataToSend.append(key, value));
        formDataToSend.append("role", "Instructor");
        if (profileImage) formDataToSend.append("profilePicture", profileImage);

        // append all qualification docs
        form.qualifications.forEach((q) => {
            if (q.documentFile) formDataToSend.append("qualificationDocs", q.documentFile);
        });
        formDataToSend.append("qualifications", JSON.stringify(form.qualifications));

        try {
            const res = await fetch("http://localhost:5000/api/instructor/register", {
                method: "POST",
                body: formDataToSend,
            });
            const data = await res.json();
            if (!res.ok) return alert(data.message || "Error registering instructor");
            alert("Instructor registered successfully!");
        } catch (err) {
            console.error(err);
            alert("Server error: " + err.message);
        }
    };

    return (
        <div className="flex min-h-screen text-primary bg-textDark">
            <div className="max-w-5xl mx-auto p-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h1 className="text-xl font-semibold mb-6">
                        Instructor Registration
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
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="text-sm"
                            />
                        </div>

                        {/* BASIC INFO */}
                        <section>
                            <h2 className="font-medium mb-4">Basic Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    ["Username", "userName"],
                                    ["First Name", "firstName"],
                                    ["Last Name", "lastName"],
                                    ["Father Name", "fatherName"],
                                    ["Email", "email"],
                                    ["Password", "password"],
                                    ["Phone", "phone"],
                                    ["CNIC", "cnic"],
                                ].map(([label, name]) => (
                                    <div key={name}>
                                        <label className="text-xs text-gray-500">{label}</label>
                                        <input
                                            name={name}
                                            type={name === "password" ? "password" : "text"}
                                            value={form[name]}
                                            onChange={handleChange}
                                            required
                                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* PERSONAL INFO */}
                        <section>
                            <h2 className="font-medium mb-4">Personal Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Gender</label>
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        required
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Prefer not to Say</option>
                                    </select>
                                </div>

                                <div>
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

                        {/* INSTRUCTOR DETAILS */}
                        <section>
                            <h2 className="font-medium mb-4">Instructor Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500">Rank</label>
                                    <input
                                        name="rank"
                                        value={form.rank}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500">
                                        Office Timing
                                    </label>
                                    <input
                                        name="officeTiming"
                                        value={form.officeTiming}
                                        onChange={handleChange}
                                        placeholder="9:00 AM - 2:00 PM"
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500">
                                        Employment Type
                                    </label>
                                    <select
                                        name="employmentTypeId"
                                        value={form.employmentTypeId}
                                        onChange={handleChange}
                                        required
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Visiting">Visiting</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500">
                                        Department
                                    </label>
                                    <select
                                        name="departmentId"
                                        value={form.departmentId}
                                        onChange={handleChange}
                                        required
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value="">Select Department</option>
                                        <option value="cs">Computer Science</option>
                                        <option value="se">Software Engineering</option>
                                        <option value="it">Information Technology</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">
                                        Research Speciality
                                    </label>
                                    <input
                                        name="researchSpeciality"
                                        value={form.researchSpeciality}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="md:col-span-2">
                            <button type="button" onClick={handleQualificationAdd} className="border border-textDark px-4 py-2 rounded">
                                + Add Qualification
                            </button>

                            {form.qualifications.map((q, i) => (
                                <div key={i} className="border p-4 rounded-lg space-y-2 mt-3">
                                    <h3 className="font-semibold">Qualification #{i + 1}</h3>
                                    <div className="flex flex-wrap gap-5">
                                        <input placeholder="Degree" value={q.degree} onChange={(e) => handleQualificationChange(i, "degree", e.target.value)} className="border px-4 py-2 rounded" />
                                        <input placeholder="Field / Major" value={q.field} onChange={(e) => handleQualificationChange(i, "field", e.target.value)} className="border px-4 py-2 rounded" />
                                        <input placeholder="Institution" value={q.institution} onChange={(e) => handleQualificationChange(i, "institution", e.target.value)} className="border px-4 py-2 rounded" />
                                        <input type="number" placeholder="Year" value={q.year} onChange={(e) => handleQualificationChange(i, "year", e.target.value)} className="border px-4 py-2 rounded" />
                                        <input type="file" onChange={(e) => handleQualificationDocChange(i, e.target.files[0])} className="border px-4 py-2 rounded" />
                                    </div>
                                </div>
                            ))}

                        </div>
                        {/* SUBMIT */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-primary text-white rounded-md text-sm font-medium"
                            >
                                Register Instructor
                            </button>
                        </div>
                    </form>


                </div>

            </div>
        </div>
    )
}
