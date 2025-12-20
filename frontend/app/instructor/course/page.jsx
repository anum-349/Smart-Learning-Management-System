"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText, BarChart2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import NavBar from "../../navbar/NavBar";
import Header from "../../header/Header";

// --- MOCK COURSE DATA ---
const COURSE_DETAILS_INSTRUCTOR = {
    title: "Programming Fundamental",
    officialContent: [
        { title: "Setup Development Environment", description: "Setup Development Environment description" },
        { title: "Variables and Data Types", description: "Variables and Data Types description" },
        { title: "Arithmetic Operators", description: "Arithmetic Operators desription" },
        { title: "Conditional Statements", description: "Arithmetic Operators description" },
        { title: "Loops", description: "Loops description" },
        { title: "Arrays and Functions", description: "Arrays and Functions description" },
    ]
};

// --- HEC Content Item ---
const HECContentItem = ({
    content, onSelect, isSelected
}) => {
    const handleClick = () => onSelect(content);
    return (
        <div
            className={`justify-between items-center ml-5 mt-5 mr-5 p-3 rounded-lg border mb-2 cursor-pointer transition-all duration-200
            ${isSelected ? 'bg-gray-800 border-indigo-500 shadow-lg' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
            onClick={handleClick}
        >
            <div className="flex items-center space-x-2 text-white">
                <FileText size={18} className={isSelected ? "text-white" : "text-accent"} />
                <span>{content.title}</span>
            </div>
            <div>
                <p className="text-gray-300">{content.description}</p>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function CourseContentManager() {
    const [accordionData, setAccordionData] = useState(COURSE_DETAILS_INSTRUCTOR.weeklyContent);
    const [contentTab, setContentTab] = useState('source');
    const [selectedHECContent, setSelectedHECContent] = useState([]);
    const router = useRouter()

    const handleSelectHECContent = (content) => {
        setSelectedHECContent(prev => {
            if (prev.includes(content)) return prev.filter(c => c !== content);
            return [...prev, content];
        });
    };

    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar userType={"Instructor"} />
            <main className="flex-1 ml-64 ">
                <Header user="Instructor" notification={[]} />

                <div className="text-sm text-gray-600 mb-6 pt-5 pl-5">
                    <span
                        onClick={() => router.push("/instructor")}
                        className="cursor-pointer hover:text-primary"
                    >
                        Dashboard
                    </span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Course</span>
                </div>

                {/* Tabs */}
                <div className="relative flex border-b border-gray-600 mb-4 pl-5 pt-5">
                    <button
                        className={`py-2 px-4 text-sm font-medium ${contentTab === 'source' ? 'border-b-2 border-accentDark text-accentDark' : 'text-gray-600 hover:text-gray-400'}`}
                        onClick={() => setContentTab('source')}
                    >
                        HEC Official Content
                    </button>
                    <div className="right-5  absolute">
                        <button
                            className={`py-2 px-4 text-sm font-medium border-2 border-accentDark hover:bg-accent text-accentDark hover:text-white rounded ml-5`}
                            onClick={() => router.push('/instructor/course/attendance')}
                        >
                            Attendance
                        </button>
                        <button
                            className={`py-2 px-4 text-sm font-medium border-2 border-accentDark hover:bg-accent text-accentDark hover:text-white rounded ml-5`}
                            onClick={() => router.push('/instructor/assignment')}
                        >
                            Assignment
                        </button>
                        <button
                            className={`py-2 px-4 text-sm font-medium border-2 border-accentDark hover:bg-accent text-accentDark hover:text-white rounded ml-5`}
                            onClick={() => router.push('/instructor/quiz')}
                        >
                            Quiz
                        </button>
                        <button
                            className={`py-2 px-4 text-sm font-medium border-2 border-accentDark hover:bg-accent text-accentDark hover:text-white rounded ml-5`}
                            onClick={() => router.push('/instructor/course/grade')}
                        >
                            Grade
                        </button>
                    </div>
                </div>

                {contentTab === 'source' && (
                    <div>
                        {COURSE_DETAILS_INSTRUCTOR.officialContent.map((contentItem, index) => (
                            <HECContentItem
                                key={index}
                                content={contentItem}
                                onSelect={handleSelectHECContent}
                                isSelected={selectedHECContent.includes(contentItem)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
