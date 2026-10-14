"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Notebook, List, MessageCircle, Table, GraduationCap, CalendarDays } from "lucide-react";
import NavBar from "../navbar/NavBar";
import Header from "../header/Header";
import { getStoredUserId, studentFetch } from "@/lib/student-api";

const DashboardCard = ({ title, children }) => (
  <section className="overflow-hidden rounded-xl bg-white shadow-md">
    <div className="bg-primary p-3 text-white"><h3 className="text-lg font-semibold">{title}</h3></div>
    <div className="p-4">{children}</div>
  </section>
);

const ActivityItem = ({ icon: Icon, text, count, link }) => (
  <Link href={link} className="relative flex flex-col items-center text-primary transition hover:text-secondary">
    <Icon size={28} className="mb-1" />
    <span className="text-center text-sm">{text}</span>
    {count > 0 && <span className="absolute right-0 top-0 rounded-full bg-red-500 px-1 text-xs text-white">{count}</span>}
  </Link>
);

export default function StudentDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = getStoredUserId();
    if (!userId) {
      setError("Please sign in to view your student dashboard.");
      setLoading(false);
      return;
    }
    studentFetch(`/api/students/dashboard/${encodeURIComponent(userId)}`)
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = dashboard?.student?.fullname?.split(" ")[0] || dashboard?.student?.username || "Student";

  return (
    <div className="flex min-h-screen bg-light text-primary">
      <NavBar userType="Student" />
      <main className="ml-64 flex-1">
        <Header user="Student" notification={[]} />
        <div className="container mx-auto p-6 pt-10">
          <h1 className="mb-6 text-xl font-semibold">Welcome, {firstName}</h1>
          {loading ? <p className="rounded-lg bg-white p-5">Loading your dashboard…</p> : null}
          {error ? <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p> : null}

          {!loading && dashboard && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <DashboardCard title="My Enrolled Courses">
                  {dashboard.courses.length ? dashboard.courses.map((course) => (
                    <Link key={course.course_id} href={`/student/course?courseId=${course.course_id}`} className="mb-2 flex items-center justify-between rounded-lg bg-gray-100 p-3 shadow-sm transition hover:bg-gray-200">
                      <div className="flex items-center">
                        <BookOpen size={20} className="mr-3 text-orange-500" />
                        <div>
                          <p className="font-semibold text-primary">{course.code || "Course"} — {course.title}</p>
                          <p className="text-sm text-gray-600">Instructor{course.instructors?.includes(",") ? "s" : ""}: {course.instructors || "Not assigned"}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">{course.semester_number ? `Semester ${course.semester_number}` : course.enrollment_status}</span>
                    </Link>
                  )) : <p className="text-gray-600">No approved course enrollments are available.</p>}
                </DashboardCard>
              </div>

              <div className="space-y-6">
                <DashboardCard title="Student Services">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <ActivityItem icon={Table} text="Timetable" link="/student/timetable" />
                    <ActivityItem icon={GraduationCap} text="Results" link="/student/result" />
                    <ActivityItem icon={CalendarDays} text="Calendar" link="/student/calendar" />
                    <ActivityItem icon={Notebook} text="Course Notes" link="/student/notes" />
                  </div>
                </DashboardCard>
                <DashboardCard title="My Activities">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <ActivityItem icon={CheckCircle} text="Assignments" count={dashboard.assignments?.pending || 0} link="/student/assignment" />
                    <ActivityItem icon={Notebook} text="Quizzes" count={dashboard.quizzes?.pending || 0} link="/student/quiz" />
                    <ActivityItem icon={List} text="Attendance" link="/student/attendance" />
                    <ActivityItem icon={MessageCircle} text="Discussions" link="/student/discussion" />
                  </div>
                </DashboardCard>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
