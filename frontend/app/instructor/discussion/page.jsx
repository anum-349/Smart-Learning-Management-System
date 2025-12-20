
"use client";

import React, { useState, useMemo } from "react";
import { MessageSquare, Send, Trash2, Plus, Filter, X, AlertCircle, } from "lucide-react";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";
import { useRouter } from "next/navigation";

/* ---------- DUMMY DATA ---------- */
const MOCK_DISCUSSIONS = [
    {
        id: 1,
        threadTitle: "Issue with HTML Assignment",
        course: "Graphic Design",
        author: "Sana Malik",
        authorRole: "Student",
        postedOn: "2024-10-20",
        content: "I am unable to upload my zip file. It says size limit exceeded.",
        replies: [
            { id: 101, author: "ANUM KOUSAR", authorRole: "Instructor", postedOn: "2024-10-21", content: "Please try compressing it further or use a Google Drive link." }
        ]
    }
];

const LetterAvatar = ({ name }) => (
    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
        {name.charAt(0)}
    </div>
);

/* ---------- SUB-COMPONENTS ---------- */
const PostAuthorBadge = ({ role }) => (
    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${role === "Instructor" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 border border-gray-200"
        }`}>
        {role}
    </span>
);

/* ---------- MAIN COMPONENT ---------- */
export default function CourseDiscussionPage() {
    const COURSES = ["Graphic Design", "Programming Fundamental", "Video Editing"];
    const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
    const [threads, setThreads] = useState(MOCK_DISCUSSIONS);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const router = useRouter()

    // Filter threads by course
    const filteredThreads = useMemo(() => {
        return threads.filter(t => t.course === selectedCourse);
    }, [threads, selectedCourse]);

    const activeThread = useMemo(() => {
        return threads.find(t => t.id === activeThreadId);
    }, [threads, activeThreadId]);

    const handlePostReply = () => {
        if (!replyContent.trim() || !activeThread) return;
        const newReply = {
            id: Date.now(),
            author: "ANUM KOUSAR",
            authorRole: "Instructor",
            postedOn: new Date().toLocaleDateString(),
            content: replyContent
        };
        setThreads(prev => prev.map(t => t.id === activeThread.id ? { ...t, replies: [...t.replies, newReply] } : t));
        setReplyContent("");
    };

    const handlePostNewThread = async (threadData) => {
        // threadData will contain { subject, description, course }
        const newThread = await postTicket(threadData.course, threadData.subject, threadData.description);
        setThreads(prev => [newThread, ...prev]);
        setActiveThreadId(newThread.id);
    };

    return (
        <div className="flex bg-[#f8f9fa] min-h-screen text-primary">
            <NavBar userType={"Instructor"} />
            <main className="flex-1 ml-64 flex flex-col">
                <Header user="Instructor" notification={[]} />

                <div className="text-sm text-gray-600 mb-6 pt-5 pl-5">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Discussion</span>
                </div>

                <div className="p-6 flex flex-col flex-1 overflow-hidden">
                    {/* Top Toolbar */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-800">Course Discussion</h1>
                            <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1.5 shadow-sm">
                                <Filter size={16} className="text-gray-400" />
                                <select
                                    className="bg-transparent text-sm font-medium focus:outline-none"
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                >
                                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all shadow-md"
                        >
                            <Plus size={18} /> New Thread
                        </button>

                        {isModalOpen && (
                            <NewThreadModal
                                courseName={selectedCourse}
                                onClose={() => setIsModalOpen(false)} // Pass as an arrow function
                                onPost={handlePostNewThread}
                            />
                        )}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex flex-1 gap-6 overflow-hidden">

                        {/* Sidebar: Thread List */}
                        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                            <div className="p-4 border-b bg-gray-50 rounded-t-xl">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discussions</p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {filteredThreads.length === 0 ? (
                                    <div className="p-10 text-center text-gray-400">
                                        <MessageSquare className="mx-auto mb-2 opacity-20" size={40} />
                                        <p className="text-sm">No discussions yet</p>
                                    </div>
                                ) : (
                                    filteredThreads.map(thread => (
                                        <div
                                            key={thread.id}
                                            onClick={() => setActiveThreadId(thread.id)}
                                            className={`p-4 cursor-pointer border-b transition-all ${activeThreadId === thread.id
                                                ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                                                : "hover:bg-gray-50 border-l-4 border-l-transparent"
                                                }`}
                                        >
                                            <h5 className={`font-semibold text-sm mb-1 ${activeThreadId === thread.id ? "text-indigo-900" : "text-gray-700"}`}>
                                                {thread.threadTitle}
                                            </h5>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-gray-500">{thread.author}</span>
                                                <span className="text-[10px] bg-gray-200 px-1.5 rounded text-gray-600">
                                                    {thread.replies.length} replies
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Viewport: Active Thread */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col relative">
                            {activeThread ? (
                                <>
                                    {/* Thread Header */}
                                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{activeThread.threadTitle}</h3>
                                            <p className="text-xs text-gray-500">In {activeThread.course}</p>
                                        </div>
                                        <button
                                            onClick={() => { if (confirm("Delete?")) setThreads(t => t.filter(x => x.id !== activeThread.id)) }}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    {/* Message Scroll Area */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                        {/* Original Post */}
                                        <div className="flex gap-4">
                                            <LetterAvatar name={activeThread.author} />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-sm">{activeThread.author}</span>
                                                    <PostAuthorBadge role={activeThread.authorRole} />
                                                    <span className="text-xs text-gray-400">{activeThread.postedOn}</span>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-gray-700">
                                                    {activeThread.content}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4 text-gray-300">
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Replies</span>
                                            <div className="h-px bg-gray-200 flex-1"></div>
                                        </div>

                                        {/* Replies */}
                                        {activeThread.replies.map(r => (
                                            <div key={r.id} className={`flex gap-4 ${r.authorRole === "Instructor" ? "flex-row-reverse text-right" : ""}`}>
                                                <LetterAvatar name={r.author} />
                                                <div className={`flex-1 ${r.authorRole === "Instructor" ? "flex flex-col items-end" : ""}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm">{r.author}</span>
                                                        <PostAuthorBadge role={r.authorRole} />
                                                        <span className="text-xs text-gray-400">{r.postedOn}</span>
                                                    </div>
                                                    <div className={`p-4 rounded-2xl border text-sm max-w-[80%] ${r.authorRole === "Instructor"
                                                        ? "bg-accent text-white border-accentDark rounded-tr-none"
                                                        : "bg-white text-gray-700 border-gray-200 rounded-tl-none"
                                                        }`}>
                                                        {r.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Input */}
                                    <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                                        <div className="relative flex items-center">
                                            <textarea
                                                value={replyContent}
                                                onChange={e => setReplyContent(e.target.value)}
                                                placeholder="Type your response..."
                                                className="w-full p-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm shadow-sm"
                                                rows={1}
                                            />
                                            <button
                                                onClick={handlePostReply}
                                                className="absolute right-2 p-2 bg-primary text-white rounded-lg hover:bg-opacity-90 shadow-sm"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                        <MessageSquare size={32} className="text-gray-200" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-600">No Discussion Selected</h3>
                                    <p className="text-sm text-gray-400">Select a thread from the sidebar to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function NewThreadModal({ courseName, onClose, onPost }) {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;

        setIsSubmitting(true);
        try {
            // This matches your HelpDeskTicket Mongoose Schema:
            // userId is usually handled on the backend via session/token
            await onPost({
                subject,
                description,
                course: courseName, // Contextual data
                status: "pending"   // Default schema value
            });
            onClose();
        } catch (error) {
            console.error("Failed to create thread:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-primary p-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Start New Discussion</h2>
                        <p className="text-xs opacity-80">Posting in: {courseName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Subject Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Subject / Title
                        </label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g., Question regarding Module 2 Quiz"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Description Textarea */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide details about your discussion topic..."
                            rows={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3">
                        <AlertCircle className="text-blue-500 shrink-0" size={18} />
                        <p className="text-xs text-blue-700">
                            Your post will be visible to students enrolled in <strong>{courseName}</strong>.
                            As an Instructor, your post will be highlighted.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 disabled:opacity-50 shadow-md transition-all"
                        >
                            {isSubmitting ? "Posting..." : (
                                <>
                                    <Send size={16} /> Post Thread
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}