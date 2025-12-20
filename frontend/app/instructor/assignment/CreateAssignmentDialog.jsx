"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Calendar, CheckCircle, Trash2, Upload } from "lucide-react";
import Modal from "@/components/ui/Modal";

const MOCK_COURSE = {
  title: "Web Development",
};

export default function CreateAssignmentDialog({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [totalMarks, setTotalMarks] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("✅ Assignment Created (Mock)");
    onClose();
  };

  const handleFileChange = (e) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Assignment">
      <form onSubmit={handleSubmit} className="space-y-6 text-secondary">
        <p className="text-sm text-gray-800">
          Course: <span className="font-medium">{MOCK_COURSE.title}</span>
        </p>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Assignment Title
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
            className="mt-1 w-full  border-primary border rounded-lg px-3 py-2 min-h-[100px]"
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
              {file ? "Change File" : "Choose File"}
            </label>

            {file && (
              <Trash2
                size={16}
                className="cursor-pointer text-red-500"
                onClick={() => setFile(null)}
              />
            )}
          </div>
        </div>

        {/* Dates & Marks */}
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
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 w-full border-primary border rounded-lg px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
