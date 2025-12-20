"use client"

import React, { useState } from "react";
import { PlusCircle, Edit, Trash2, FileText, X } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { useRouter } from "next/navigation";

/* ------------------ DUMMY DATA ------------------ */

const INSTRUCTOR_COURSES = [
    "Web Engineering",
    "Database Systems",
    "Artificial Intelligence",
];

const DUMMY_RESOURCES = [
    {
        id: 1,
        course: "Web Engineering",
        title: "React Basics",
        type: "Lecture",
        fileName: "react-basics.pdf",
        fileUrl: "/dummy/react-basics.pdf",
        uploadedOn: "12 Dec 2024",
    },
    {
        id: 2,
        course: "Web Engineering",
        title: "Mid Term Assignment",
        type: "Assignment",
        fileName: "assignment-1.pdf",
        fileUrl: "/dummy/assignment-1.pdf",
        uploadedOn: "18 Dec 2024",
    },
];


/* ------------------ BADGE COMPONENT ------------------ */

const ResourceBadge = ({ type }) => {
    const styles = {
        Lecture: "bg-blue-100 text-textDark",
        Assignment: "bg-green-100 text-green-700",
        Quiz: "bg-purple-100 text-purple-700",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[type]}`}>
            {type}
        </span>
    );
};

/* ------------------ MAIN PAGE ------------------ */

export default function CourseContentManager() {
    const [selectedCourse, setSelectedCourse] = useState(INSTRUCTOR_COURSES[0]);
    const [resources, setResources] = useState(DUMMY_RESOURCES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);

    const router = useRouter()

    const [formData, setFormData] = useState({
        title: "",
        type: "Lecture",
        file: null,        // File object
        fileUrl: "",       // Object URL
        fileName: "",      // Display name
    });

    const filteredResources = resources.filter(
        (res) => res.course === selectedCourse
    );

    /* ------------------ HANDLERS ------------------ */

    const handleOpenModal = () => {
        setEditingResource(null);
        setFormDatauseState({
            title: "",
            type: "Lecture",
            file: null,        // File object
            fileUrl: "",       // Object URL
            fileName: "",      // Display name
        });
        setIsModalOpen(true);
    };

    const handleEditResource = (resource) => {
        setEditingResource(resource);
        setFormData({
            title: resource.title,
            type: resource.type,
            file: null,
            fileName: resource.fileName,
            fileUrl: resource.fileUrl,
        });

        setIsModalOpen(true);
    };

    const handleDeleteResource = (id) => {
        setResources(resources.filter((r) => r.id !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const resourcePayload = {
            title: formData.title,
            type: formData.type,
            fileName: formData.fileName,
            fileUrl: formData.fileUrl,
            course: selectedCourse,
            uploadedOn: new Date().toDateString(),
        };

        if (editingResource) {
            setResources(
                resources.map((r) =>
                    r.id === editingResource.id
                        ? { ...r, ...resourcePayload }
                        : r
                )
            );
        } else {
            setResources([
                ...resources,
                {
                    id: Date.now(),
                    ...resourcePayload,
                },
            ]);
        }

        setIsModalOpen(false);
    };

    /* ------------------ UI ------------------ */
    return (
        <div className="flex bg-[#f8f9fa] min-h-screen text-slate-800">
            <NavBar userType={"Instructor"} />

            <main className="flex-1 ml-64 flex flex-col">
                <Header user="Instructor" notification={[]} />
                <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">notes</span>
                </div>

                <div className="bg-white p-5 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <label className="font-semibold text-gray-700">Course</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="border rounded-md px-3 py-2 text-textDark border-textDark"
                        >
                            {INSTRUCTOR_COURSES.map((course) => (
                                <option key={course}>{course}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-textDark"
                    >
                        <PlusCircle size={18} />
                        Add Resource
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-5 py-4 border-b flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">
                            {selectedCourse} Resources
                        </h2>
                        <span className="text-sm text-gray-500">
                            {filteredResources.length} items
                        </span>
                    </div>

                    {filteredResources.length === 0 ? (
                        <div className="p-10 text-center text-gray-600">
                            <FileText size={40} className="mx-auto mb-3 opacity-40" />
                            No resources uploaded
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-primary text-light">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Title</th>
                                        <th className="px-6 py-3 text-left">Type</th>
                                        <th className="px-6 py-3 text-left">File</th>
                                        <th className="px-6 py-3 text-left">Uploaded</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y text-primary/90">
                                    {filteredResources.map((resource) => (
                                        <tr key={resource.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-medium">
                                                {resource.title}
                                            </td>

                                            <td className="px-6 py-3">
                                                <ResourceBadge type={resource.type} />
                                            </td>

                                            <td className="px-6 py-3">
                                                <a
                                                    href={resource.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    {resource.fileName}
                                                </a>
                                            </td>

                                            <td className="px-6 py-3 text-gray-600">
                                                {resource.uploadedOn}
                                            </td>

                                            <td className="px-6 py-3 text-right space-x-3">
                                                <button
                                                    onClick={() => handleEditResource(resource)}
                                                    className="text-blue-600"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteResource(resource.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main >

            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute right-4 top-4 text-accentDark hover:bg-secondary rounded-full"
                            >
                                <X />
                            </button>

                            <h2 className="text-lg text-primary font-bold mb-4">
                                {editingResource ? "Edit Resource" : "Add Resource"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input
                                    placeholder="Title"
                                    className="w-full border border-textDark text-textDark rounded-md p-2 placeholder:text-secondary"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    required
                                />

                                <select
                                    className="w-full border border-textDark text-textDark placeholder:text-secondary rounded-md p-2"
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, type: e.target.value })
                                    }
                                >
                                    <option>Lecture</option>
                                    <option>Assignment</option>
                                    <option>Quiz</option>
                                </select>

                                <input
                                    type="file"
                                    className="w-full border border-textDark text-textDark rounded-md p-2"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        setFormData({
                                            ...formData,
                                            file,
                                            fileName: file.name,
                                            fileUrl: URL.createObjectURL(file), // 👈 creates link
                                        });
                                    }}
                                    required={!editingResource}
                                />
                                {editingResource && !formData.file && (
                                    <p className="text-sm text-gray-500">
                                        Current file:{" "}
                                        <a
                                            href={editingResource.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                        >
                                            {editingResource.fileName}
                                        </a>
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-textDark"
                                >
                                    Save
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
}
