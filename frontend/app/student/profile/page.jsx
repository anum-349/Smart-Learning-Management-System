"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react";
import Header from "@/app/header/Header";
import NavBar from "../../navbar/NavBar";

const MOCK_STUDENT_PROFILE = {
  userName: "alexjohnson",
  firstName: "Alex",
  lastName: "Johnson",
  fatherName: "Robert Johnson",
  email: "alex.johnson@uni.edu",
  phone: 3031234567,
  gender: "Male",
  dateOfBirth: "2001-05-15T00:00:00.000Z",
  address: "123 University Road, Cityville, Country",
  profilePicture: "https://randomuser.me/api/portraits/men/45.jpg",
  registrationNo: "FA21-BSE-045",
};

const StudentProfile = () => {
  const [student, setStudent] = useState(MOCK_STUDENT_PROFILE);
  const [formData, setFormData] = useState(MOCK_STUDENT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStudent(formData);
      setIsEditing(false);
      setIsLoading(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-light text-gray-900">
      <NavBar userType="Student" />
      <main className="flex-1 ml-64">
        <Header user="Student" notification={[]} />

        <div className="max-w-4xl m-5 mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Student Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accentDark transition"
            >
              {isEditing ? <X size={16} /> : <Edit size={16} />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* Profile Picture */}
          <div className="flex flex-col items-center md:flex-row gap-6">
            <img
              src={formData.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-accent"
            />
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="mt-2 md:mt-0"
              />
            )}
          </div>

          {/* Profile Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-lg border p-2 ${
                  isEditing ? "border-accent bg-white" : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-lg border p-2 ${
                  isEditing ? "border-accent bg-white" : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-lg border p-2 ${
                  isEditing ? "border-accent bg-white" : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-lg border p-2 ${
                  isEditing ? "border-accent bg-white" : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to Say">Prefer not to Say</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth?.split("T")[0] || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-lg border p-2 ${
                  isEditing ? "border-accent bg-white" : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className={`mt-1 block w-full rounded-lg border p-2 ${
                  isEditing ? "border-accent bg-white" : "border-gray-200 bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>

            {/* Read-only fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration No</label>
              <input
                type="text"
                value={formData.registrationNo}
                disabled
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-gray-100 cursor-not-allowed p-2"
              />
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 bg-accentDark text-white px-4 py-2 rounded-lg hover:bg-accent transition"
              >
                <Save size={16} />
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
