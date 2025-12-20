"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../header/Header";
import NavBar from "../../navbar/NavBar";
import Modal from "../../../components/ui/Modal"; // Your modal component
import { Upload } from "lucide-react";

// Dummy assignments for student
const coursesData = [
  {
    course: "Programming Fundamental",
    assignmentsData: [
      {
        id: 1,
        title: "Hands-on Exercise No. 1",
        file: "exercise1.pdf",
        dueDate: "Nov 14, 2025",
        submitted: false,
        fileSize: "1.4 MB",
      },
      {
        id: 2,
        title: "Hands-on Exercise No. 2",
        file: "exercise2.pdf",
        dueDate: "Nov 20, 2025",
        submitted: true,
        fileSize: "1.1 MB",
      },
    ],
  },
  {
    course: "OOD",
    assignmentsData: [
      {
        id: 3,
        title: "Hands-on Exercise No. 1",
        file: "exercise1.pdf",
        dueDate: "Nov 15, 2025",
        submitted: false,
        fileSize: "1.3 MB",
      },
    ],
  },
];

export default function StudentAssignments() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);

  const handleOpenModal = (assignment) => {
    setSelectedAssignment(assignment);
    setFile(null);
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("Please choose a file to submit!");
    alert(`Submitted "${selectedAssignment.title}" successfully!`);
    selectedAssignment.submitted = true; // Update dummy state
    setOpen(false);
  };

  return (
    <div className="flex bg-light min-h-screen text-primary">
      <NavBar userType="Student" />
      <main className="flex-1 ml-64">
        <Header user="Student" notification={[]} />

        <div className="text-sm pl-5 pt-5 text-gray-600 mb-6">
          <span
            onClick={() => router.push("/student")}
            className="cursor-pointer hover:text-primary"
          >
            Dashboard
          </span>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">Assignments</span>
        </div>

        {coursesData.map((course, idx) => (
          <div key={idx} className="mb-10 ml-5 mr-5">
            {/* Course Header */}
            <div className="bg-primary text-white rounded-t-xl px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{course.course}</h2>
            </div>

            {/* Assignments Table */}
            <div className="bg-white border border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">File</th>
                    <th className="px-6 py-3 text-left">Due Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Submit</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {course.assignmentsData.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{assignment.title}</td>
                      <td className="px-6 py-4 text-blue-600">
                        <a href={`/${assignment.file}`} target="_blank" className="hover:underline">
                          View File
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{assignment.dueDate}</td>
                      <td className="px-6 py-4">
                        {assignment.submitted ? (
                          <span className="text-green-600 font-semibold">Submitted</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className="flex items-center gap-2 text-primary hover:underline"
                          onClick={() => handleOpenModal(assignment)}
                        >
                          <Upload size={16} /> Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Submit Modal */}
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title={`Submit Assignment: ${selectedAssignment?.title}`}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-700">{selectedAssignment?.title}</p>
            <input
              type="file"
              className="w-full border border-gray-300 rounded-md p-2"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Submit
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
