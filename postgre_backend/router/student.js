// server.js
import express from "express";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "profilePicture") {
            const dir = "./public/uploads/profiles";
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } else if (file.fieldname.startsWith("qualificationDocs")) {
            const dir = "./public/uploads/qualifications";
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

/**
 * Expecting:
 * - profilePicture: single
 * - qualificationDocs: multiple (array)
 */
router.post(
    "/api/students/register",
    upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "qualificationDocs", maxCount: 20 },
    ]),
    async (req, res) => {
        const { user, student } = JSON.parse(req.body.data); // data sent as stringified JSON

        if (!user || !student) return res.status(400).json({ message: "Invalid payload" });

        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Profile picture path
            const profilePicture = req.files["profilePicture"]
                ? `/uploads/profiles/${req.files["profilePicture"][0].filename}`
                : "";

            // Insert into users table
            const userResult = await pool.query(
                `INSERT INTO users 
                (user_name, first_name, last_name, father_name, email, password, phone, gender, date_of_birth, address, cnic, profile_picture, role, registration_no)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
                RETURNING id`,
                [
                    user.userName,
                    user.firstName,
                    user.lastName || "",
                    user.fatherName,
                    user.email,
                    hashedPassword,
                    user.phone || null,
                    user.gender || "Male",
                    user.dateOfBirth || null,
                    user.address || "",
                    user.cnic || null,
                    profilePicture,
                    user.role || "Student",
                    user.registrationNo,
                ]
            );

            const userId = userResult.rows[0].id;

            // Insert into students table
            const studentResult = await pool.query(
                `INSERT INTO students (user_id, department_id, program_id, semester_id, status)
                 VALUES ($1,$2,$3,$4,$5) RETURNING id`,
                [
                    userId,
                    student.departmentId,
                    student.programId,
                    student.semesterId,
                    student.status || "active",
                ]
            );

            const studentId = studentResult.rows[0].id;

            // Insert qualifications with documents
            if (student.qualifications && student.qualifications.length > 0) {
                for (let i = 0; i < student.qualifications.length; i++) {
                    const q = student.qualifications[i];
                    let docPath = "";

                    if (req.files[`qualificationDocs[${i}]`] && req.files[`qualificationDocs[${i}]`][0]) {
                        docPath = `/uploads/qualifications/${req.files[`qualificationDocs[${i}]`][0].filename}`;
                    }

                    await pool.query(
                        `INSERT INTO qualifications (student_id, degree, field, institution, year, document_path)
                         VALUES ($1,$2,$3,$4,$5,$6)`,
                        [studentId, q.degree, q.field, q.institution, q.year, docPath]
                    );
                }
            }

            res.status(201).json({ message: "Student registered successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error", error: err.message });
        }
    }
);

export default router;
