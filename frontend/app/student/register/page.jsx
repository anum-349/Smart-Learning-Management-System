"use client";

import React, { useState } from "react";

const StudentRegistration = () => {
    const [formData, setFormData] = useState({
        // User schema
        userName: "",
        firstName: "",
        lastName: "",
        fatherName: "",
        email: "",
        password: "",
        phone: "",
        gender: "Male",
        dateOfBirth: "",
        address: "",
        cnic: "",
        profilePicture: "",
        role: "Student",
        registrationNo: "",

        // Student schema
        departmentId: "",
        programId: "",
        semesterId: "",
        status: "active",
        qualifications: [],
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, profilePicture: url });
        }
    };

    const handleQualificationAdd = () => {
        setFormData({
            ...formData,
            qualifications: [
                ...formData.qualifications,
                {
                    degree: "",
                    field: "",
                    institution: "",
                    year: "",
                    file: null,  // ✅ for document
                },
            ],
        });
    };

    const handleQualificationFileChange = (index, file) => {
        const updated = [...formData.qualifications];
        updated[index].file = file;
        setFormData({ ...formData, qualifications: updated });
    };

    const handleQualificationChange = (qIndex, field, value) => {
        const updated = [...formData.qualifications];
        updated[qIndex][field] = value;
        setFormData({ ...formData, qualifications: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();

            // Add JSON data as string
            formDataToSend.append("data", JSON.stringify({
                user: {
                    userName: formData.userName,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    fatherName: formData.fatherName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    gender: formData.gender,
                    dateOfBirth: formData.dateOfBirth,
                    address: formData.address,
                    cnic: formData.cnic,
                    role: "Student",
                    registrationNo: formData.registrationNo,
                },
                student: {
                    departmentId: formData.departmentId,
                    programId: formData.programId,
                    semesterId: formData.semesterId,
                    status: formData.status,
                    qualifications: formData.qualifications.map(q => ({
                        degree: q.degree,
                        field: q.field,
                        institution: q.institution,
                        year: q.year
                    })),
                }
            }));

            // Append profile image
            if (profileFile) {
                formDataToSend.append("profilePicture", profileFile);
            }

            // Append qualification documents
            formData.qualifications.forEach((q, index) => {
                if (q.file) {
                    formDataToSend.append(`qualificationDocs[${index}]`, q.file);
                }
            });

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/register`, {
                method: "POST",
                body: formDataToSend,  // ✅ FormData, no Content-Type header
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Registration failed");
            } else {
                alert("Student registered successfully!");
            }
        } catch (err) {
            console.error(err);
            alert("Server error: " + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 text-textDark flex justify-center items-start p-6">
            <div className="max-w-5xl w-full bg-white border border-textDark rounded-xl shadow p-6">
                <h1 className="text-2xl font-bold text-center mb-6">Student Registration</h1>

                <div className="flex justify-center mb-6">
                    <img
                        src={formData.profilePicture || "https://via.placeholder.com/120"}
                        className="w-28 h-28 rounded-full object-cover border"
                    />
                </div>
                <input type="file" accept="image/*" onChange={handlePictureChange} />

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <input name="userName" placeholder="Username" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="firstName" placeholder="First Name" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="lastName" placeholder="Last Name" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="fatherName" placeholder="Father Name" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="email" type="email" placeholder="Email" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="password" type="password" placeholder="Password" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="phone" placeholder="Phone" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="cnic" placeholder="CNIC" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="registrationNo" placeholder="Registration No" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />

                    <select name="gender" onChange={handleChange} className="border border-textDark px-4 py-2 rounded">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Prefer not to Say</option>
                    </select>

                    <input type="date" name="dateOfBirth" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />

                    <input name="departmentId" placeholder="Department ID" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="programId" placeholder="Program ID" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    <input name="semesterId" placeholder="Semester ID" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />

                    <select name="status" onChange={handleChange} className="border border-textDark px-4 py-2 rounded">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="frozen">Frozen</option>
                        <option value="completed">Completed</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>

                    <div className="md:col-span-2">
                        <textarea name="address" placeholder="Address" onChange={handleChange} className="border border-textDark px-4 py-2 rounded" />
                    </div>

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
                    
                    <div className="md:col-span-2 flex justify-center mt-4">
                        <button
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-6 py-2 rounded"
                        >
                            {isLoading ? "Registering..." : "Register Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentRegistration;