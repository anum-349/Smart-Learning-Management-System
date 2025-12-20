"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Download } from "lucide-react";

const MAX_MARKS = 10;

const MOCK_SUBMISSIONS = [
  { id: 101, studentName: "Ali Raza", submissionStatus: "Submitted", submittedOn: "Nov 15, 2025", fileLink: "#", grade: null, feedback: "" },
  { id: 102, studentName: "Zainab Khan", submissionStatus: "Submitted", submittedOn: "Nov 16, 2025", fileLink: "#", grade: null, feedback: "" },
  { id: 103, studentName: "Sana Malik", submissionStatus: "Graded", submittedOn: "Nov 10, 2025", fileLink: "#", grade: 9.5, feedback: "Excellent use of conditional logic." },
  { id: 104, studentName: "Fahad Ahmed", submissionStatus: "Not Submitted", submittedOn: null, fileLink: null, grade: null, feedback: "" },
];

export default function GradeQuizModal({ isOpen, onClose }) {
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [selectedId, setSelectedId] = useState(
    submissions.find(s => s.grade === null && s.submissionStatus === "Submitted")?.id ?? null
  );

  const selectedSubmission = submissions.find(s => s.id === selectedId);
  const [currentGrade, setCurrentGrade] = useState(selectedSubmission?.grade ?? "");
  const [currentFeedback, setCurrentFeedback] = useState(selectedSubmission?.feedback ?? "");

  useEffect(() => {
    if (selectedSubmission) {
      setCurrentGrade(selectedSubmission.grade ?? "");
      setCurrentFeedback(selectedSubmission.feedback ?? "");
    } else {
      setCurrentGrade("");
      setCurrentFeedback("");
    }
  }, [selectedSubmission]);

  const handleGradeSubmit = (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const gradeValue = Number(currentGrade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > MAX_MARKS) {
      alert(`Please enter a valid grade between 0 and ${MAX_MARKS}`);
      return;
    }

    const updatedSubmissions = submissions.map(s =>
      s.id === selectedSubmission.id
        ? { ...s, grade: gradeValue, feedback: currentFeedback, submissionStatus: "Graded" }
        : s
    );
    setSubmissions(updatedSubmissions);
    alert(`Grade submitted for ${selectedSubmission.studentName}!`);

    // Automatically select next ungraded submission
    const nextUngraded = updatedSubmissions.find(s => s.grade === null && s.submissionStatus === "Submitted");
    setSelectedId(nextUngraded?.id ?? null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Submissions">
      <div className="grid grid-cols-1 gap-6">
        {/* --- Submissions Table --- */}
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Student Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Submitted On</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Marks</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map(sub => (
                <tr
                  key={sub.id}
                  className={`cursor-pointer ${selectedId === sub.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
                  onClick={() => setSelectedId(sub.id)}
                >
                  <td className="px-4 py-2">{sub.studentName}</td>
                  <td className={`px-4 py-2 font-semibold ${sub.submissionStatus === "Graded" ? "text-green-600" : sub.submissionStatus === "Submitted" ? "text-accentDark" : "text-red-600"}`}>
                    {sub.submissionStatus}
                  </td>
                  <td className="px-4 py-2">{sub.submittedOn ?? "N/A"}</td>
                  <td className="px-4 py-2">{sub.grade !== null ? `${sub.grade} / ${MAX_MARKS}` : `-- / ${MAX_MARKS}`}</td>
                  <td className="px-4 py-2 text-center">
                    {sub.submissionStatus === "Submitted" || sub.submissionStatus === "Graded" ? (
                      <button
                        className="px-3 py-1 bg-primary text-white rounded-lg hover:bg-indigo-700 transition"
                        onClick={(e) => { e.stopPropagation(); setSelectedId(sub.id); }}
                      >
                        {sub.submissionStatus === "Graded" ? "Edit Grade" : "Grade"}
                      </button>
                    ) : (
                      <span className="text-gray-400">No Action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- Grading Form --- */}
        {selectedSubmission && (
          <form onSubmit={handleGradeSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">{selectedSubmission.studentName}</h3>

            <div>
              <label className="text-sm font-medium">Marks (Max {MAX_MARKS})</label>
              <input
                type="number"
                min={0}
                max={MAX_MARKS}
                step={0.1}
                value={currentGrade}
                onChange={(e) => setCurrentGrade(e.target.value === "" ? "" : parseFloat(e.target.value))}
                required
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Feedback</label>
              <textarea
                rows={4}
                value={currentFeedback}
                onChange={(e) => setCurrentFeedback(e.target.value)}
                placeholder="Provide feedback..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 resize-y"
              />
            </div>

            {selectedSubmission.fileLink && (
              <a href={selectedSubmission.fileLink} className="inline-flex items-center text-blue-600 hover:underline">
                <Download size={16} className="mr-1" /> Download Submission
              </a>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Submit Grade
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
