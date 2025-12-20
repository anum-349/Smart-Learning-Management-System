import Link from "next/link";
import Header from "../../../header/Header";
import NavBar from "../../../navbar/NavBar";

const initialNotifications = [
  { id: 1, text: "New course added", isRead: false, type: "general" },
];
 
export default function CourseContent() {
    return (
        <div className="flex bg-light min-h-screen text-primary">
            <NavBar />
            <main className="flex-1 ml-64">
                <Header user="Student" notification={initialNotifications} />
                <div className="container mx-auto p-6 pt-10">
                    <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                        <Link href="/student" className="hover:text-accentDark">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link href="/course" className="hover:text-accentDark">
                            Course
                        </Link>
                        <span>/</span>
                        <span>Course Content</span>
                    </div>
                </div>
            </main>
        </div>
    )
}