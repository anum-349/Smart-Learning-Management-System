"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings as SettingsIcon, Save, Camera } from "lucide-react";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";

import Input from "../../../components/Input";
import Select from "../../../components/Select";

const initialNotifications = [
  { id: 1, text: "New user registered!", isRead: false, type: "general" }
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    userName: "Ali",
    defaultLanguage: "English",
    timezone: "GMT+5",
    profilePic: null, // stores uploaded file
    profilePreview: null // stores preview URL
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
    // Upload profilePic via API if needed
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
            <span>Settings</span>
          </div>

          {/* Settings Form */}
          <div className="bg-light border border-gray-200 rounded-xl shadow-md p-6 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
              <SettingsIcon size={20} /> Admin Settings
            </h2>

            <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">

              <Input
                label="User Name"
                value={settings.userName}
                onChange={(v) => handleChange("userName", v)}
              />

              <Select
                label="Default Language"
                value={settings.defaultLanguage}
                onChange={(v) => handleChange("defaultLanguage", v)}
                options={[
                  { value: "English", label: "English" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French", label: "French" }
                ]}
              />

              <Input
                label="Timezone"
                value={settings.timezone}
                onChange={(v) => handleChange("timezone", v)}
              />

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
