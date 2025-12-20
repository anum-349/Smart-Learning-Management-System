"use client";

import { useEffect, useState } from "react";
import { Upload, Trash2, Calendar, CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";

/* ---------- COMPONENT ---------- */
const DUMMY_ASSIGNMENT = {
  id: 101,
  course: { title: "Web Development" },
  title: "Initial Web Dev Quiz - Topic 1",
  description: "Please review HTML fundamentals before starting.",
  totalMarks: 50,
  deadline: "2025-12-01",
  fileName: "Quiz_instructions_v1.pdf",
};

export default function UpdateQuizModal({
  isOpen,
  onClose,
  quizId,
}) {
  const [loading, setLoading] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState(1);
  const [deadline, setDeadline] = useState("");

  const [existingFile, setExistingFile] = useState(null);
  const [file, setFile] = useState(null);

  /* ---------- AUTO FETCH ---------- */
  useEffect(() => {
    // if (!isOpen || !quizId) return;

        setLoading(true)
        setTimeout(() => {
            const data = DUMMY_ASSIGNMENT;
            setCourseTitle(data.course.title)
            setTitle(data.title)
            setDescription(data.description)
            setTotalMarks(data.totalMarks)
            setDeadline(data.deadline)
            setExistingFile(data.fileName)
            setFile(null)

            setLoading(false)
        }, 500)

    // const fetchQuiz = async () => {
    //   try {
    //     setLoading(true);

    //     /* 🔹 Replace with real API */
    //     const res = await fetch(
    //       `/api/instructor/quizs/${quizId}`
    //     );
    //     const data = await res.json();

    //     /* 🔹 Auto fill form */
    //     setCourseTitle(data.course.title);
    //     setTitle(data.title);
    //     setDescription(data.description || "");
    //     setTotalMarks(data.totalMarks);
    //     setDeadline(data.deadline);
    //     setExistingFile(data.fileName || null);
    //     setFile(null);
    //   } catch (err) {
    //     console.error("Failed to load quiz", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchQuiz();
  }, [isOpen, quizId]);

  /* ---------- HANDLERS ---------- */

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setExistingFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("totalMarks", totalMarks.toString());
    formData.append("deadline", deadline);
    if (file) formData.append("file", file);

    console.log(formData)
    /* 🔹 Replace with real API */
    // await fetch(`/api/instructor/quizs/${quizId}`, {
    //   method: "PUT",
    //   body: formData,
    // });

    alert("✅ Quiz updated successfully");
    onClose();
  };

  /* ---------- RENDER ---------- */

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Quiz">
      {loading ? (
        <p className="text-center text-gray-900">Loading quiz...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-primary">
          <p className="text-sm text-gray-900">
            Course: <span className="font-medium">{courseTitle}</span>
          </p>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Quiz Title
            </label>
            <input
              type="text"
              className="mt-1 w-full border border-primary rounded-lg px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className="mt-1 w-full border-primary border rounded-lg px-3 py-2 min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* File */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Upload size={16} />
              Upload File
            </label>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="file"
                id="file"
                className="hidden"
                onChange={handleFileChange}
              />

              <label
                htmlFor="file"
                className="cursor-pointer border border-dashed px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                {file || existingFile ? "Change File" : "Choose File"}
              </label>

              {(file || existingFile) && (
                <span className="text-sm text-gray-600">
                  {file?.name || existingFile}
                </span>
              )}

              {(file || existingFile) && (
                <Trash2
                  size={16}
                  className="cursor-pointer text-red-500"
                  onClick={() => {
                    setFile(null);
                    setExistingFile(null);
                  }}
                />
              )}
            </div>
          </div>

          {/* Marks & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CheckCircle size={16} className="text-green-600" />
                Marks
              </label>
              <input
                type="number"
                min={1}
                value={totalMarks}
                onChange={(e) => setTotalMarks(+e.target.value)}
                className="mt-1 w-full border-primary border rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Calendar size={16} />
                Deadline
              </label>
              <input
                type="date"
                className="mt-1 w-full border-primary border rounded-lg px-3 py-2"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-accent rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-primary text-white"
            >
              Update
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
