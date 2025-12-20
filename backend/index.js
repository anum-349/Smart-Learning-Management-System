import express from "express";
import connect from "./config.js";
import path from "path"
import cors from "cors"
import adminRoutes from "./Routes/adminRoutes.js"
import announcementRoutes from "./Routes/announcementRoutes.js"
import assignmentRoutes from "./Routes/assignmentRoutes.js"
import assignmentSubmissionRoutes from "./Routes/assignmentSubmissionRoutes.js"
import attendanceAnalyticsRoutes from "./Routes/attendanceAnalyticsRoutes.js"
import attendanceRecordRoutes from "./Routes/attendanceRecordRoutes.js"
import attendanceSessionRoutes from "./Routes/attendanceSessionRoutes.js"
import batchRoutes from "./Routes/batchRoutes.js"
import calendarRoutes from "./Routes/calendarRoutes.js"
import courseAssignmentRoutes from "./Routes/courseAssignmentRoutes.js"
import courseContentRoutes from "./Routes/courseContentRoutes.js"
import courseRoutes from "./Routes/courseRoutes.js"
import departmentRoutes from "./Routes/departmentRoutes.js"
import documentResourcesRoutes from "./Routes/documentResourcesRoutes.js"
import eventReminderRoutes from "./Routes/eventReminderRoutes.js"
import examResultRoutes from "./Routes/examResultRoutes.js"
import examRoutes from "./Routes/examRoutes.js"
import facultyRoutes from "./Routes/facultyRoutes.js"
import gradeItemRoutes from "./Routes/gradeItemRoutes.js"
import gradeReportRoutes from "./Routes/gradeReportRoutes.js"
import gradeRoutes from "./Routes/gradeRoutes.js"
import helpDeskTicketsRoutes from "./Routes/helpDeskTicketsRoutes.js"
import instructorsRoutes from "./Routes/instructorsRoutes.js"
import linkRoutes from "./Routes/LinkRoutes.js"
import messageReplyRoutes from "./Routes/messageReplyRoutes.js"
import messageRoutes from "./Routes/messageRoutes.js"
import notificationRoutes from "./Routes/notificationRoutes.js"
import performanceAnalyticsRoutes from "./Routes/performanceAnalyticsRoutes.js"
import programRoutes from "./Routes/programRoutes.js"
import qualificationRoutes from "./Routes/qualificationRoutes.js"
import quizRoutes from "./Routes/quizRoutes.js"
import quizSubmissionRoutes from "./Routes/quizSubmissionRoutes.js"
import registrationRequestRoutes from "./Routes/registrationRequestRoutes.js"
import semesterRoutes from "./Routes/semesterRoutes.js"
import studentCourseRoutes from "./Routes/studentCourseRoutes.js"
import studentRoutes from "./Routes/studentRoutes.js"
import ticketReplyRoutes from "./Routes/ticketReplyRoutes.js"
import timetableRoutes from "./Routes/timetableRoutes.js"
import userRoutes from "./Routes/userRoutes.js"

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connect();

app.use('/uploads', express.static(path.join(path.resolve(), "uploads")));

app.get("/", (req, res) => {
    res.send("Welcome to LMS API");
});

app.use("/api/admin", adminRoutes)
app.use("/api/announcement", announcementRoutes)
app.use("/api/assignment", assignmentRoutes)
app.use("/api/assignment-submission", assignmentSubmissionRoutes)
app.use("/api/attendance-analytics", attendanceAnalyticsRoutes)
app.use("/api/attendance-record", attendanceRecordRoutes)
app.use("/api/attendance-session", attendanceSessionRoutes)
app.use("/api/batch", batchRoutes)
app.use("/api/calendar", calendarRoutes)
app.use("/api/course-assignment", courseAssignmentRoutes)
app.use("/api/course-content", courseContentRoutes)
app.use("/api/course", courseRoutes)
app.use("/api/department", departmentRoutes)
app.use("/api/document-resources", documentResourcesRoutes)
app.use("/api/event-reminder", eventReminderRoutes)
app.use("/api/exam-result", examResultoutes)
app.use("/api/exam", examRoutes)
app.use("/api/faculty", facultyRoutes)
app.use("/api/grade-item", gradeItemRoutes)
app.use("/api/grade-report", gradeReportRoutes)
app.use("/api/grade", gradeRoutes)
app.use("/api/help-desk-tickets", helpDeskTicketsRoutes)
app.use("/api/instructor", instructorsRoutes)
app.use("/api/link", linkRoutes)
app.use("/api/message-reply", messageReplyRoutes)
app.use("/api/message", messageRoutes)
app.use("/api/notification", notificationRoutes)
app.use("/api/performance-analytics", performanceAnalyticsRoutes)
app.use("/api/program", programRoutes)
app.use("/api/qualification", qualificationRoutes)
app.use("/api/quiz", quizRoutes)
app.use("/api/quiz-submission", quizSubmissionRoutes)
app.use("/api/registration-request", registrationRequestRoutes)
app.use("/api/semester", semesterRoutes)
app.use("/api/student-course", studentCourseRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/ticket-reply", ticketReplyRoutes)
app.use("/api/timetable", timetableRoutes)
app.use("/api/user", userRoutes)

app.listen(5001, ()=>{
    console.log("http://localhost:5001");
})