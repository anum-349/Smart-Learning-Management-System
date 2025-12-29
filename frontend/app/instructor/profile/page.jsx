"use client";

import { useEffect, useState } from "react";
import { Pencil, Save, X } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { useRouter } from "next/navigation";

export default function InstructorProfilePage() {
    const [data, setData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [userId, setUserId] = useState(null);

    const Api_URL = process.env.NEXT_PUBLIC_API_URL;

    const router = useRouter()

    const fetchInstructorDetails = async () => {
        try {
            const res = await fetch(`${Api_URL}/registration/instructor/profile/${userId}`);
            const data = await res.json();
            setData(data)
            setImagePreview(
                data.profile_picture
                    ? `http://localhost:5000/${data.profile_picture}`
                    : null
            );
            console.log(data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId");
        setUserId(storedUserId);
    }, [])

    useEffect(()=>{
        if (!userId) return;
        fetchInstructorDetails();
    }, [userId])

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
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) =>
            formData.append(key, value)
        );

        if (imageFile) {
            formData.append("profile_picture", imageFile);
        }

        try {
            await fetch(`${Api_URL}/registration/instructor/profile/${userId}`, {
                method: "PUT",
                body: formData,
            });
            setEditMode(false);
            fetchInstructorDetails();
        } catch (err) {
            console.log(err)
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <NavBar userType={"Instructor"} />

            <main className="flex-1 ml-64">
                <Header user="Instructor" notification={[]} />

                <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Profile</span>
                </div>

                <div className="max-w-4xl mx-auto p-6">
                    {/* PROFILE CARD */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-6">
                            {/* PROFILE IMAGE */}
                            <div className="relative">

                                <img
                                    src={imagePreview}
                                    alt="Instructor"
                                    width={120}
                                    height={120}
                                    className="rounded-sm object-cover border"
                                />

                                {editMode && (
                                    <>
                                        <label className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full cursor-pointer">
                                            <Pencil size={16} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </>
                                )}
                            </div>

                            {/* BASIC INFO */}
                            <div className="flex-1 text-textDark">
                                <h2 className="text-xl font-semibold">
                                    {data.username}
                                </h2>
                                <p className="text-sm text-gray-700">{data.rank}</p>
                                <p className="text-sm text-gray-500">{data.department}</p>
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
                                        className="flex items-center gap-2 px-4 py-2 text-sm bg-accentDark hover:bg-accent text-white rounded-md"
                                    >
                                        <Save size={16} /> Save
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
                    </div>

                    {/* DETAILS FORM */}
                    <div className="bg-white text-textDark mt-6 rounded-xl shadow-sm border p-6 grid grid-cols-2 gap-4">
                        {[
                            ["Full Name", "fullname"],
                            ["Username", "username"],
                            ["Email", "email"],
                            ["Phone", "phone"],
                            ["Address", "address"],
                            ["Rank", "rank"],
                            ["Office Timing", "office_timing"],
                            ["Research Speciality", "research_speciality"],
                        ].map(([label, field]) => (
                            <div key={field}>
                                <label className="text-xs font-medium text-gray-500">
                                    {label}
                                </label>
                                <input
                                    name={field}
                                    value={data[field] ?? ""}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    className={`w-full mt-1 px-3 py-2 text-sm rounded-md border 
                    ${editMode ? "bg-white" : "bg-gray-100"}`}
                                />
                            </div>
                        ))}

                        {/* EMPLOYMENT TYPE */}
                        <div>
                            <label className="text-xs font-medium text-gray-500">
                                Employment Type
                            </label>
                            <select
                                name="employmentTypeId"
                                value={data.employment_type}
                                onChange={handleChange}
                                disabled={!editMode}
                                className="w-full mt-1 px-3 py-2 text-sm rounded-md border bg-white"
                            >
                                <option value="Permanent">Permanent</option>
                                <option value="Visiting">Visiting</option>
                            </select>
                        </div>

                        {/* GENDER */}
                        <div>
                            <label className="text-xs font-medium text-gray-500">
                                Gender
                            </label>
                            <select
                                name="gender"
                                value={data.gender}
                                onChange={handleChange}
                                disabled={!editMode}
                                className="w-full mt-1 px-3 py-2 text-sm rounded-md border bg-white"
                            >
                                <option>Male</option>
                                <option>Female</option>
                                <option>Prefer not to Say</option>
                            </select>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
