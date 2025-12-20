import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import pool from "../config/db.js"; 

const router = express.Router();

// Storage for profile + qualification docs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === "profilePicture") {
            cb(null, "public/uploads/profile");
        } else {
            cb(null, "public/uploads/qualifications");
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Accept profilePicture and multiple qualification documents
router.post("/register", upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "qualificationDocs" }  // array of files
]), async (req, res) => {
    try {
        const data = req.body;

        // Parse qualifications from string
        const qualifications = data.qualifications ? JSON.parse(data.qualifications) : [];

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Profile picture path
        const profilePath = req.files.profilePicture ? `/uploads/profile/${req.files.profilePicture[0].filename}` : "";

        // Insert into users
        const userResult = await pool.query(
            `INSERT INTO users 
            (user_name, first_name, last_name, father_name, email, password, phone, gender, address, cnic, profile_picture, role)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
            [
                data.userName,
                data.firstName,
                data.lastName || "",
                data.fatherName || "",
                data.email,
                hashedPassword,
                data.phone || null,
                data.gender || "",
                data.address || "",
                data.cnic || null,
                profilePath,
                "Instructor"
            ]
        );

        const userId = userResult.rows[0].id;

        // Insert into instructors
        const instructorResult = await pool.query(
            `INSERT INTO instructors
            (user_id, rank, office_timing, employment_type_id, department_id, research_speciality)
            VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
            [
                userId,
                data.rank || "",
                data.officeTiming || "",
                data.employmentTypeId || "",
                data.departmentId || "",
                data.researchSpeciality || ""
            ]
        );

        const instructorId = instructorResult.rows[0].id;

        // Insert qualifications with documents
        const qualificationFiles = req.files.qualificationDocs || [];
        for (let i = 0; i < qualifications.length; i++) {
            const q = qualifications[i];
            const docPath = qualificationFiles[i] ? `/uploads/qualifications/${qualificationFiles[i].filename}` : "";
            await pool.query(
                `INSERT INTO instructor_qualifications
                 (instructor_id, degree, field, institution, year, document)
                 VALUES ($1,$2,$3,$4,$5,$6)`,
                [instructorId, q.degree, q.field, q.institution, q.year, docPath]
            );
        }

        res.status(201).json({ message: "Instructor registered successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.get("/deans", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email 
       FROM users 
       WHERE role = 'Instructor'` 
    );

    res.status(200).json(result.rows); // return array of deans
  } catch (err) {
    console.error("Error fetching deans:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/hods", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email 
       FROM users 
       WHERE role = 'Instructor'` 
    );

    res.status(200).json(result.rows); // return array of deans
  } catch (err) {
    console.error("Error fetching deans:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.get("/advisor", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email 
       FROM users 
       WHERE role = 'Instructor'` 
    );

    res.status(200).json(result.rows); // return array of deans
  } catch (err) {
    console.error("Error fetching deans:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
