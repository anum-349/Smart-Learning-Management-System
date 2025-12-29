import express from "express";
import pool from "../config/db.js"; // Postgres pool
import multer from "multer";
import fs from "fs"
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    // Get title from req.body
    let title = req.body.title || "file";

    // Sanitize title (remove spaces, special chars)
    title = title.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");

    const ext = path.extname(file.originalname); // Keep original file extension
    const fileName = `${title}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

router.post(
  "/instructor/register",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "qualificationDocs", maxCount: 10 }
  ]),
  async (req, res) => {
    console.log("Request body:", req.body);
    const {
      user_id, // existing user id
      father_name,
      username,
      email,
      date_of_birth,
      phone,
      gender,
      address,
      cnic,
      role, // should be 'Instructor'
      registration_no,
      full_name,
      rank,
      office_timing,
      employment_type,
      department_id,
      reason,
      research_speciality,
      qualifications
    } = req.body;

    try {
      // Update existing user
      const updateUserQuery = `
        UPDATE users SET
          username = $1,
          email = $2,
          father_name = $3,
          date_of_birth = $4,
          phone = $5,
          gender = $6,
          address = $7,
          cnic = $8,
          role = $9,
          registration_no = $10,
          full_name = $11
          ${req.files.profile_picture ? ", profile_picture = $12" : ""}
        WHERE id = $${req.files.profile_picture ? "13" : "12"}
        RETURNING id
      `;

      const values = [
        username,
        email,
        father_name,
        date_of_birth,
        phone,
        gender,
        address,
        cnic,
        role,
        registration_no || null,
        full_name
      ];

      if (req.files.profile_picture) values.push(req.files.profile_picture[0].path);
      values.push(user_id);

      await pool.query(updateUserQuery, values);

      // Upsert instructor details
      const instructorCheck = await pool.query(
        `SELECT id FROM instructors WHERE user_id = $1`,
        [user_id]
      );

      const deptId = department_id || null;
      const reasonVal = reason || null;

      if (instructorCheck.rowCount > 0) {
        await pool.query(
          `UPDATE instructors SET
            rank = $1,
            office_timing = $2,
            employment_type = $3,
            department_id = $4,
            reason = $5,
            research_speciality = $6
          WHERE user_id = $7`,
          [rank, office_timing, employment_type, deptId, reasonVal, research_speciality, user_id]
        );
      } else {
        await pool.query(
          `INSERT INTO instructors
            (user_id, rank, office_timing, employment_type, department_id, reason, research_speciality)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [user_id, rank, office_timing, employment_type, deptId, reasonVal, research_speciality]
        );
      }

      // Delete existing qualifications for this user
      await pool.query(`DELETE FROM user_qualifications WHERE user_id = $1`, [user_id]);

      // Insert new qualifications
      const quals = JSON.parse(qualifications || "[]");
      for (let i = 0; i < quals.length; i++) {
        await pool.query(
          `INSERT INTO user_qualifications
            (user_id, degree, field, institution, year, document_file)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            user_id,
            quals[i].degree,
            quals[i].field,
            quals[i].institution,
            quals[i].year,
            req.files.qualificationDocs?.[i]?.path || null
          ]
        );
      }

      res.json({ message: "Instructor details updated successfully", userId: user_id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// GET instructor profile
router.get("/instructor/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.full_name as fullname,
        u.email,
        u.phone,
        u.gender,
        u.address,
        u.profile_picture,
        i.rank,
        i.office_timing,
        i.employment_type,
        i.research_speciality,
        d.title AS department
      FROM users u
      LEFT JOIN instructors i ON i.user_id = u.id
      LEFT JOIN departments d ON d.id = i.department_id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Instructor not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/instructor/profile/:userId",
  upload.single("profile_picture"),
  async (req, res) => {
    const { userId } = req.params;

    const {
      fullname,
      username,
      email,
      phone,
      gender,
      address,
      rank,
      office_timing,
      employment_type,
      research_speciality,
    } = req.body;

    try {
      let oldImagePath = null;

      if (req.file) {
        const oldImg = await pool.query(
          `SELECT profile_picture FROM users WHERE id = $1`,
          [userId]
        );

        if (oldImg.rows.length && oldImg.rows[0].profile_picture) {
          oldImagePath = oldImg.rows[0].profile_picture;
        }
      }

      /* ------------------ 2. UPDATE USERS TABLE ------------------ */
      const userQuery = `
        UPDATE users SET
          username = $1,
          email = $2,
          phone = $3,
          gender = $4,
          address = $5,
          full_name = $6
          ${req.file ? ", profile_picture = $7" : ""}
        WHERE id = $${req.file ? 8 : 7}
      `;

      const userValues = [
        username,
        email,
        phone,
        gender,
        address,
        fullname,
      ];

      if (req.file) {
        userValues.push(req.file.path.replace(/\\/g, "/"));
      }

      userValues.push(userId);

      await pool.query(userQuery, userValues);

      /* ------------------ 3. DELETE OLD IMAGE FILE ------------------ */
      if (oldImagePath) {
        const absolutePath = path.join(process.cwd(), oldImagePath);

        fs.unlink(absolutePath, (err) => {
          if (err) {
            console.warn("Old image delete failed:", err.message);
          }
        });
      }

      /* ------------------ 4. UPSERT INSTRUCTOR TABLE ------------------ */
      const exists = await pool.query(
        `SELECT id FROM instructors WHERE user_id = $1`,
        [userId]
      );

      if (exists.rowCount > 0) {
        await pool.query(
          `
          UPDATE instructors SET
            rank = $1,
            office_timing = $2,
            employment_type = $3,
            research_speciality = $4
          WHERE user_id = $5
          `,
          [
            rank,
            office_timing,
            employment_type,
            research_speciality,
            userId,
          ]
        );
      } else {
        await pool.query(
          `
          INSERT INTO instructors
          (user_id, rank, office_timing, employment_type, research_speciality)
          VALUES ($1,$2,$3,$4,$5,$6)
          `,
          [
            userId,
            rank,
            office_timing,
            employment_type,
            research_speciality,
          ]
        );
      }

      res.json({ message: "Profile updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

router.post(
  "/student/register",
  upload.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "qualificationDocs", maxCount: 10 },
  ]),
  async (req, res) => {
    const {
      user_id,
      username,
      full_name,
      father_name,
      email,
      date_of_birth,
      phone,
      gender,
      address,
      cnic,
      role,
      registration_no,
      department_id,
      program_id,
      semester_id,
      status,
      qualifications,
    } = req.body;

    try {
      /* ---------- UPDATE USER ---------- */
      const userUpdateQuery = `
        UPDATE users SET
          username = $1,
          full_name = $2,
          father_name = $3,
          phone = $4,
          gender = $5,
          address = $6,
          cnic = $7,
          role = $8,
          registration_no = $9
          ${req.files.profile_picture ? ", profile_picture = $10" : ""}
        WHERE id = $${req.files.profile_picture ? "11" : "10"}
      `;

      const userValues = [
        username,
        full_name,
        father_name,
        phone,
        gender,
        address,
        cnic,
        role || "Student",
        registration_no || null,
      ];

      if (req.files.profile_picture) {
        userValues.push(req.files.profile_picture[0].path);
      }

      userValues.push(user_id);

      await pool.query(userUpdateQuery, userValues);

      /* ---------- UPSERT STUDENT ---------- */
      const studentExists = await pool.query(
        `SELECT id FROM students WHERE user_id = $1`,
        [user_id]
      );

      if (studentExists.rowCount > 0) {
        await pool.query(
          `UPDATE students SET
            department_id = $1,
            program_id = $2,
            semester_id = $3,
            status = $4
           WHERE user_id = $5`,
          [
            department_id || null,
            program_id || null,
            semester_id || null,
            status || "active",
            user_id,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO students
            (user_id, department_id, program_id, semester_id, status)
           VALUES ($1,$2,$3,$4,$5)`,
          [
            user_id,
            department_id || null,
            program_id || null,
            semester_id || null,
            status || "active",
          ]
        );
      }

      /* ---------- QUALIFICATIONS ---------- */
      await pool.query(
        `DELETE FROM user_qualifications WHERE user_id = $1`,
        [user_id]
      );

      const parsedQualifications = JSON.parse(qualifications || "[]");

      for (let i = 0; i < parsedQualifications.length; i++) {
        await pool.query(
          `INSERT INTO user_qualifications
            (user_id, degree, field, institution, year, document_file)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            user_id,
            parsedQualifications[i].degree,
            parsedQualifications[i].field,
            parsedQualifications[i].institution,
            parsedQualifications[i].year,
            req.files.qualificationDocs?.[i]?.path || null,
          ]
        );
      }

      res.json({
        message: "Student registered/updated successfully",
        userId: user_id,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Server error",
        error: err.message,
      });
    }
  }
);

export default router;