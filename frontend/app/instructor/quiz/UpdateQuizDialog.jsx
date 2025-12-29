"use client";

import { useEffect, useState } from "react";
import { Upload, Trash2, Calendar, CheckCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";

export default function UpdateQuizModal({
  isOpen,
  onClose,
  quiz,
  course
}) {
  const [loading, setLoading] = useState(false);

  const [courseTitle, setCourseTitle] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalMarks, setTotalMarks] = useState(1);
  const [deadline, setDeadline] = useState("");
  const [quizId, setQuizId] = useState("");

  const [existingFile, setExistingFile] = useState(null);
  const [file, setFile] = useState(null);

  /* ---------- AUTO FETCH ---------- */
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setCourseTitle(course)
      setTitle(quiz?.title)
      setDescription(quiz?.description)
      setTotalMarks(quiz?.total_marks)
      const dateOnly = quiz?.deadline ? quiz.deadline.split("T")[0] : "";
      setDeadline(dateOnly);
      setExistingFile(quiz?.file_name)
      setFile(null)
      setQuizId(quiz?.id)
      setLoading(false)
    }, 500)

  }, [isOpen, quiz]);

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
    formData.append("total_marks", totalMarks.toString());
    formData.append("deadline", deadline);
    if (file) formData.append("file", file);

    console.log(file)
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quiz/${quizId}`, {
      method: "PUT",
      body: formData,
    });

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
                onChange={handleFileChange}
              />
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
