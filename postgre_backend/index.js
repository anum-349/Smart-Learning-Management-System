import express from "express";
import cors from "cors";
import instructor from "./router/instructor.js";
import auth from "./router/auth.js"
import faculties from "./router/facultys.js"
import department from "./router/department.js"
import program from "./router/program.js"
import batch from "./router/batch.js"
import semester from "./router/semester.js"
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(path.resolve(), "public/uploads")));

app.use("/api/auth", auth);
app.use("/api/faculties", faculties);
app.use("/api/instructor", instructor);
app.use("/api/departments", department);
app.use("/api/programs", program);
app.use("/api/batches", batch);
app.use("/api/semesters", semester);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
