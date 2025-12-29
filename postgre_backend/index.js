import express from "express";
import cors from "cors";
import instructor from "./router/instructor.js";
import auth from "./router/auth.js"
import faculties from "./router/facultys.js"
import department from "./router/department.js"
import program from "./router/program.js"
import batch from "./router/batch.js"
import semester from "./router/semester.js"
import course from "./router/course.js"
import courseContent from "./router/course_content.js"
import courseAssignments from "./router/courseAssignment.js"
import semesterCourseAssignments from "./router/semesterCourseAssignment.js"
import registrationRequest from "./router/registrationRequest.js"
import enrollmentRequests from "./router/registrationRequest.js"
import registration from "./router/registration.js"
import resource from "./router/resources.js"
import timetable from "./router/timetable.js"
import quiz from "./router/quiz.js"
import students from "./router/student.js"
import quizSubmission from "./router/quizSubmission.js"

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", auth);
app.use("/api/faculties", faculties);
app.use("/api/instructor", instructor);
app.use("/api/students", students);
app.use("/api/departments", department);
app.use("/api/programs", program);
app.use("/api/batches", batch);
app.use("/api/semesters", semester);
app.use("/api/courses", course);
app.use("/api/course-contents", courseContent)
app.use("/api/course-assignments", courseAssignments);
app.use("/api/semester-course-assignments", semesterCourseAssignments);
app.use("/api/registration-request", registrationRequest);
app.use("/api/enrollment-requests", enrollmentRequests)
app.use('/api/registration', registration)
app.use("/api/resources", resource);
app.use("/api/timetable", timetable);
app.use("/api/quiz-submissions", quizSubmission);
app.use("/api/quiz", quiz);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
