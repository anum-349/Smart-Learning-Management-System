"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Bell, Save, Camera } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

const initialNotifications = [
  { id: 1, text: "New user registered!", isRead: false, type: "general" }
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "Learning Management System",
    defaultLanguage: "English",
    timezone: "GMT+5",
    emailNotifications: true,
    pushNotifications: false,
    profilePic: null,
    profilePreview: null 
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSettings({
        ...settings,
        profilePic: file,
        profilePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Settings saved successfully!");
    console.log(settings);
  };

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar />

      <main className="flex-1 ml-64">
        <Header user="Admin" notification={initialNotifications} />

        <div className="container mx-auto p-6 pt-10">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
            <Link href="/admin" className="hover:text-accentDark">Dashboard</Link>
            <span>/</span>
            <span>Settings</span>
          </div>

          {/* Settings Form */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
              <SettingsIcon size={20} /> Admin Settings
            </h2>

            <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">

              <Input
                label="Site Name"
                value={settings.siteName}
                onChange={(v) => handleChange("siteName", v)}
              />

              <Select
                label="Default Language"
                value={settings.defaultLanguage}
                onChange={(v) => handleChange("defaultLanguage", v)}
                options={[
                  { value: "English", label: "English" }
                ]}
              />

              <Input
                label="Timezone"
                value={settings.timezone}
                onChange={(v) => handleChange("timezone", v)}
              />

              <div className="flex flex-col">
                <label className="text-xs text-secondary mb-1">Email Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-secondary mb-1">Push Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleChange("pushNotifications", e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              {/* Profile Picture Upload */}
              <div className="col-span-2 flex flex-col items-start">
                <label className="text-xs text-secondary mb-1">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border border-gray-300 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                    {settings.profilePreview ? (
                      <img src={settings.profilePreview} alt="Profile Preview" className="w-full h-full object-cover"/>
                    ) : (
                      <Camera size={24} className="text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileUpload}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="col-span-2 mt-4 bg-accentDark hover:bg-accent text-white py-2 rounded-xl flex items-center justify-center gap-2 font-semibold"
              >
                <Save size={18} /> Save Settings
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// Input Component
const Input = ({ label, value, onChange, placeholder, type }) => (
  <div className="flex flex-col">
    <label className="text-xs text-secondary mb-1">{label}</label>
    <input
      type={type || "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white border border-gray-300 rounded-xl px-3 py-2 focus:ring-accentDark"
    />
  </div>
);

// Select Component
const Select = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-xs text-secondary mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-white border border-gray-300 rounded-xl px-3 py-2 cursor-pointer"
    >
      {options.map((op, idx) => (
        <option key={idx} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  </div>
);
