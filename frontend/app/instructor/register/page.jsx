"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Select from "../../../components/Select";

const initialForm = {
    user_id: "",
    username: "",
    father_name: "",
    email: "",
    date_of_birth: "",
    phone: "",
    gender: "",
    address: "",
    cnic: "",
    role: "Instructor",
    registration_no: "",
    full_name: "",
    rank: "",
    office_timing: "",
    employment_type: "",
    department_id: "",
    reason: "",
    research_speciality: "",
    qualifications: []
};

export default function InstructorRegistrationPage() {
    const [form, setForm] = useState(initialForm);
    const [profileImage, setProfileImage] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [preview, setPreview] = useState(null);
    const router = useRouter();
    const [userId, setUserId] = useState(null)
    const [userEmail, setUserEmail] = useState(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL;


    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        const storeUserEmail = localStorage.getItem("userEmail");
        setUserEmail(storeUserEmail);
        setUserId(storedUserId);
    }, [])

    const fetchInstructorDetails = async () => {
        try {
            const res = await fetch(`${API_URL}/registration/instructor/profile/${userId}`);
            const data = await res.json();
            setForm((prev) => ({ ...prev, user_id: userId, email: userEmail, full_name: data.fullname }));
            console.log(data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect( () => {
        fetchInstructorDetails()
    }, [userId, userEmail]);

    useEffect(() => {
        fetch(`${API_URL}/departments`)
            .then(res => res.json())
            .then(setDepartments)
            .catch(console.error);
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleQualificationAdd = () => {
        setForm({
            ...form,
            qualifications: [
                ...form.qualifications,
                { degree: "", field: "", institution: "", year: "", documentFile: null }
            ]
        });
    };

    const handleQualificationChange = (index, field, value) => {
        const updated = [...form.qualifications];
        updated[index][field] = value;
        setForm({ ...form, qualifications: updated });
    };

    const handleQualificationDocChange = (index, file) => {
        const updated = [...form.qualifications];
        updated[index].documentFile = file;
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
        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (key !== "qualifications") formData.append(key, value);
        });

        if (profileImage) {
            formData.append("profile_picture", profileImage);
        }

        const qualTextData = form.qualifications.map(({ documentFile, ...rest }) => rest);
        formData.append("qualifications", JSON.stringify(qualTextData));

        form.qualifications.forEach((q) => {
            if (q.documentFile instanceof File) {
                formData.append("qualificationDocs", q.documentFile);
            }
        });

        console.log("Form Data Contents:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        } try {
            const res = await fetch("http://localhost:5000/api/registration/instructor/register", {
                method: "POST",
                body: formData // Fetch automatically sets the correct Multipart header
            });
            // ... rest of your logic
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex min-h-screen text-primary bg-textDark p-6">
            <div className="max-w-5xl mx-auto w-full">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                    <h1 className="text-xl font-semibold mb-6">Instructor Registration / Update</h1>

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
                            <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
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
                                    ["Date of Birth", "date_of_birth"]
                                ].map(([label, name]) => (
                                    <div key={name}>
                                        <label className="text-xs text-gray-500">{label}</label>
                                        <input
                                            name={name}
                                            type={name === "date_of_birth" ? "date" : "text"}
                                            value={form[name]}
                                            onChange={handleChange}
                                            readOnly={name === "email"}
                                            className={`w-full mt-1 px-3 py-2 border rounded-md text-sm ${name === "email" ? "bg-gray-100" : ""
                                                }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* PERSONAL INFO */}
                        <section>
                            <h2 className="font-medium mb-4">Personal Details</h2>
                            <div className="grid grid-cols-4 gap-4">
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
                            <div className="grid grid-cols-4 gap-4">
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
                                    <label className="text-xs text-gray-500">Office Timing</label>
                                    <input
                                        name="office_timing"
                                        value={form.office_timing}
                                        onChange={handleChange}
                                        placeholder="9:00 AM - 2:00 PM"
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Employment Type</label>
                                    <select
                                        name="employment_type"
                                        value={form.employment_type}
                                        onChange={handleChange}
                                        required
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    >
                                        <option value="">Select</option>
                                        <option value="Permanent">Permanent</option>
                                        <option value="Visiting">Visiting</option>
                                    </select>
                                </div>
                                <Select
                                    label="Department"
                                    value={form.department_id}
                                    onChange={(v) => setForm(prev => ({ ...prev, department_id: v }))}
                                    options={[
                                        { value: "", label: "All" },
                                        ...departments.map(d => ({ value: d.dept_id, label: d.title })),
                                    ]}
                                />
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Research Speciality</label>
                                    <input
                                        name="research_speciality"
                                        value={form.research_speciality}
                                        onChange={handleChange}
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* QUALIFICATIONS */}
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
                                        <input
                                            type="file"
                                            onChange={(e) => handleQualificationDocChange(i, e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* SUBMIT */}
                        <div className="flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-md text-sm font-medium">
                                Save Instructor
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
