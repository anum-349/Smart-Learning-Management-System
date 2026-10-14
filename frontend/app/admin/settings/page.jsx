"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Save } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Input from "../../../components/Input";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const emptyProfile = { username: "", full_name: "", email: "", phone: "", address: "" };

export default function AdminSettings() {
  const [profile, setProfile] = useState(emptyProfile);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("userId");
    setUserId(id || "");
    if (!id) {
      setError("Sign in again to load your admin profile.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/admin/profile/${encodeURIComponent(id)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");
        setProfile({ ...emptyProfile, ...data, phone: data.phone || "", address: data.address || "" });
      })
      .catch((err) => setError(err.message || "Unable to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => setProfile((previous) => ({ ...previous, [field]: value }));

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/api/admin/profile/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save profile");
      setProfile({ ...emptyProfile, ...data, phone: data.phone || "", address: data.address || "" });
      setMessage("Profile saved.");
      window.dispatchEvent(new Event("lms:profile-updated"));
    } catch (err) {
      setError(err.message || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType="Admin" />
      <main className="flex-1 ml-64">
        <Header user={profile.full_name || "Admin"} notification={[]} />
        <div className="container mx-auto p-6 pt-10">
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Settings</span>
          </div>

          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
              <SettingsIcon size={20} /> Admin Profile
            </h2>
            {loading && <p className="mb-4 text-gray-500">Loading profile…</p>}
            {error && <p role="alert" className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
            {message && <p role="status" className="mb-4 rounded-lg bg-green-100 p-3 text-green-700">{message}</p>}

            <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
              <Input label="Username" value={profile.username} onChange={(value) => handleChange("username", value)} />
              <Input label="Full Name" value={profile.full_name} onChange={(value) => handleChange("full_name", value)} />
              <Input label="Email" type="email" value={profile.email} onChange={(value) => handleChange("email", value)} />
              <Input label="Phone" type="tel" value={profile.phone} onChange={(value) => handleChange("phone", value)} />
              <Input label="Address" value={profile.address} onChange={(value) => handleChange("address", value)} />
              <button
                type="submit"
                disabled={saving || loading || !userId}
                className="md:col-span-2 mt-4 bg-accentDark hover:bg-accent text-white py-2 rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
              >
                <Save size={18} /> {saving ? "Saving…" : "Save Profile"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
