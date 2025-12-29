"use client";

import React, { useState, useMemo } from "react";
import {
    MessageSquare,
    Send,
    Plus,
    Filter,
    X,
    AlertCircle
} from "lucide-react";

import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { useRouter } from "next/navigation";

/* ---------- DUMMY DATA ---------- */
const MOCK_DISCUSSIONS = [
    {
        id: 1,
        threadTitle: "Issue with HTML Assignment",
        course: "Programming Fundamental",
        author: "Sana Malik",
        authorRole: "Student",
        postedOn: "2024-10-20",
        content: "I am unable to upload my zip file. It says size limit exceeded.",
        replies: [
            {
                id: 101,
                author: "ANUM KOUSAR",
                authorRole: "Instructor",
                postedOn: "2024-10-21",
                content: "Please try compressing it further or use a Google Drive link."
            }
        ]
    }
];

/* ---------- SMALL UI COMPONENTS ---------- */
const LetterAvatar = ({ name }) => (
    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border">
        {name.charAt(0)}
    </div>
);

const PostAuthorBadge = ({ role }) => (
    <span
        className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md
        ${role === "Instructor"
            ? "bg-primary text-white"
            : "bg-gray-100 text-gray-600 border"}`}
    >
        {role}
    </span>
);

/* ---------- MAIN PAGE ---------- */
export default function StudentCourseDiscussionPage() {
    const COURSES = ["Programming Fundamental", "Data Structures", "Web Development"];
    const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
    const [threads, setThreads] = useState(MOCK_DISCUSSIONS);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const router = useRouter();

    const filteredThreads = useMemo(
        () => threads.filter(t => t.course === selectedCourse),
        [threads, selectedCourse]
    );

    const activeThread = useMemo(
        () => threads.find(t => t.id === activeThreadId),
        [threads, activeThreadId]
    );

    /* ---------- ACTIONS ---------- */
    const handlePostReply = () => {
        if (!replyContent.trim() || !activeThread) return;

        const newReply = {
            id: Date.now(),
            author: "Anum Kousar",
            authorRole: "Student",
            postedOn: new Date().toLocaleDateString(),
            content: replyContent
        };

        setThreads(prev =>
            prev.map(t =>
                t.id === activeThread.id
                    ? { ...t, replies: [...t.replies, newReply] }
                    : t
            )
        );
        setReplyContent("");
    };

    const handlePostNewThread = ({ subject, description, course }) => {
        const newThread = {
            id: Date.now(),
            threadTitle: subject,
            content: description,
            course,
            author: "Anum Kousar",
            authorRole: "Student",
            postedOn: new Date().toLocaleDateString(),
            replies: []
        };

        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
    };

    return (
        <div className="flex bg-[#f8f9fa] min-h-screen text-primary">
            <NavBar userType="Student" />
            <main className="flex-1 ml-64 flex flex-col">
                <Header user="Student" notification={[]} />

                {/* Breadcrumb */}
                <div className="text-sm text-gray-600 mb-6 pt-5 pl-5">
                    <span
                        onClick={() => router.push("/student")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Discussion</span>
                </div>

                <div className="p-6 flex flex-col flex-1 overflow-hidden">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">Course Discussion</h1>
                            <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 shadow-sm">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    className="bg-transparent text-sm font-medium outline-none"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    {COURSES.map(c => (
                                        <option key={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-md"
                        >
                            <Plus size={18} /> New Thread
                        </button>

                        {isModalOpen && (
                            <NewThreadModal
                                courseName={selectedCourse}
                                onClose={() => setIsModalOpen(false)}
                                onPost={handlePostNewThread}
                            />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 gap-6 overflow-hidden">
                        {/* Thread List */}
                        <div className="w-80 bg-white rounded-xl border shadow-sm overflow-y-auto">
                            {filteredThreads.map(thread => (
                                <div
                                    key={thread.id}
                                    onClick={() => setActiveThreadId(thread.id)}
                                    className={`p-4 cursor-pointer border-b
                                    ${activeThreadId === thread.id
                                        ? "bg-indigo-50 border-l-4 border-indigo-600"
                                        : "hover:bg-gray-50 border-l-4 border-transparent"}`}
                                >
                                    <h5 className="font-semibold text-sm">{thread.threadTitle}</h5>
                                    <p className="text-xs text-gray-500">{thread.author}</p>
                                </div>
                            ))}
                        </div>

                        {/* Thread View */}
                        <div className="flex-1 bg-white rounded-xl border shadow-sm flex flex-col">
                            {activeThread ? (
                                <>
                                    <div className="p-4 border-b bg-gray-50">
                                        <h3 className="font-bold">{activeThread.threadTitle}</h3>
                                        <p className="text-xs text-gray-500">{activeThread.course}</p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {/* Original Post */}
                                        <div className="flex gap-4">
                                            <LetterAvatar name={activeThread.author} />
                                            <div>
                                                <div className="flex gap-2 items-center mb-1">
                                                    <strong className="text-sm">{activeThread.author}</strong>
                                                    <PostAuthorBadge role={activeThread.authorRole} />
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-xl border">
                                                    {activeThread.content}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        {activeThread.replies.map(r => (
                                            <div key={r.id} className="flex gap-4">
                                                <LetterAvatar name={r.author} />
                                                <div>
                                                    <div className="flex gap-2 items-center mb-1">
                                                        <strong className="text-sm">{r.author}</strong>
                                                        <PostAuthorBadge role={r.authorRole} />
                                                    </div>
                                                    <div className={`p-4 rounded-xl border
                                                        ${r.authorRole === "Instructor"
                                                            ? "bg-accent text-white"
                                                            : "bg-white"}`}>
                                                        {r.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Box */}
                                    <div className="p-4 border-t bg-gray-50">
                                        <div className="relative">
                                            <textarea
                                                rows={1}
                                                placeholder="Write a reply..."
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                className="w-full p-3 pr-12 rounded-xl border resize-none"
                                            />
                                            <button
                                                onClick={handlePostReply}
                                                className="absolute right-2 top-2 bg-primary text-white p-2 rounded-lg"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                    <MessageSquare size={32} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ---------- MODAL ---------- */
function NewThreadModal({ courseName, onClose, onPost }) {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onPost({ subject, description, course: courseName });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
                <div className="bg-primary text-white p-4 flex justify-between">
                    <h3 className="font-bold">New Discussion</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Thread title"
                        className="w-full border p-2 rounded-lg"
                    />
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        placeholder="Describe your issue..."
                        className="w-full border p-2 rounded-lg"
                    />

                    <div className="bg-blue-50 border p-3 rounded-lg flex gap-2 text-xs">
                        <AlertCircle size={16} />
                        Visible to students enrolled in <b>{courseName}</b>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg">
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
