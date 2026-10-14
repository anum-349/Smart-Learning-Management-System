"use client";

import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { useRouter } from "next/navigation";
import { getStoredUserId, studentFetch, studentFileUrl } from "@/lib/student-api";

export default function StudentProfilePage() {
  const [data, setData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  /* ================== FETCH STUDENT DETAILS ================== */
  const fetchStudentDetails = async () => {
    if (!userId) return;
    try {
      const data = await studentFetch(`/api/students/profile/${encodeURIComponent(userId)}`);
      setData(data);
      setImagePreview(data.profile_picture ? studentFileUrl(data.profile_picture) : null);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = getStoredUserId();
    setUserId(storedUserId);
    if (!storedUserId) {
      setError("Please sign in to view your profile.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentDetails();
  }, [userId]);

  /* ================== HANDLERS ================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const formData = new FormData();
    ["fullname", "username", "email", "phone", "gender", "address", "registration_no", "date_of_birth"].forEach((key) => {
      formData.append(key, data[key] ?? "");
    });

    if (imageFile) {
      formData.append("profile_picture", imageFile);
    }

    try {
      await studentFetch(`/api/students/profile/${encodeURIComponent(userId)}`, {
        method: "PUT",
        body: formData,
      });
      setEditMode(false);
      setImageFile(null);
      await fetchStudentDetails();
      window.dispatchEvent(new Event("lms:profile-updated"));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <NavBar userType="Student" />
      <main className="flex-1 ml-64">
        <Header user="Student" notification={[]} />

        {error && <p role="alert" className="mx-auto mt-4 max-w-4xl rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
        {loading && <p className="mx-auto mt-4 max-w-4xl text-gray-600">Loading student profile…</p>}

        <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
          <span
            onClick={() => router.push("/student")}
            className="cursor-pointer hover:text-primary"
          >
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">Profile</span>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-white rounded-xl shadow-sm border p-6 flex items-center gap-6">
            <div className="relative">
              <img
                src={imagePreview || "https://via.placeholder.com/120"}
                alt="Student"
                width={120}
                height={120}
                className="rounded-sm object-cover border"
              />
              {editMode && (
                <label className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full cursor-pointer">
                  <Pencil size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* BASIC INFO */}
            <div className="flex-1 text-textDark">
              <h2 className="text-xl font-semibold">{data.username}</h2>
              <p className="text-sm text-gray-700">{data.fullname}</p>
              <p className="text-sm text-gray-500">{data.registration_no}</p>
            </div>

            {/* ACTION BUTTONS */}
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-md"
              >
                <Pencil size={16} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-accentDark hover:bg-accent text-white rounded-md"
                >
                  <Save size={16} /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary/55 rounded-md"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            )}
          </div>

          {/* DETAILS FORM */}
          <div className="bg-white text-textDark rounded-xl shadow-sm border p-6 grid grid-cols-2 gap-4">
            {[
              ["Full Name", "fullname"],
              ["Username", "username"],
              ["Email", "email"],
              ["Phone", "phone"],
              ["Address", "address"],
              ["Gender", "gender"],
              ["Date of Birth", "date_of_birth"],
              ["Registration No", "registration_no"],
            ].map(([label, field]) => (
              <div key={field}>
                <label className="text-xs font-medium text-gray-500">
                  {label}
                </label>
                <input
                  type={field === "date_of_birth" ? "date" : "text"}
                  name={field}
                  value={
                    field === "date_of_birth" && data[field]
                      ? data[field].split("T")[0]
                      : data[field] ?? ""
                  }
                  onChange={handleChange}
                  disabled={!editMode}
                  className={`w-full mt-1 px-3 py-2 text-sm rounded-md border ${
                    editMode ? "bg-white" : "bg-gray-100 cursor-not-allowed"
                  }`}
                />
              </div>
            ))}

          </div>
        </div>
      </main>
    </div>
  );
}
