import express from "express";
import pool from "../config/db.js"; // Postgres pool
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ dest: "uploads/" });

/* ================== GET STUDENT PROFILE ================== */
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;

  console.log(req.body)

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
        u.date_of_birth,
        u.profile_picture,
        u.registration_no
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ message: "Student not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================== UPDATE STUDENT PROFILE ================== */
router.put(
  "/profile/:userId",
  upload.single("profile_picture"),
  async (req, res) => {
    const { userId } = req.params;
    const { fullname, username, email, phone, gender, address } = req.body;

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

      /* ------------------ 1. UPDATE USERS TABLE ------------------ */
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

      const userValues = [username, email, phone, gender, address, fullname];
      if (req.file) userValues.push(req.file.path.replace(/\\/g, "/"));
      userValues.push(userId);

      await pool.query(userQuery, userValues);

      /* ------------------ 2. DELETE OLD IMAGE ------------------ */
      if (oldImagePath) {
        const absolutePath = path.join(process.cwd(), oldImagePath);
        fs.unlink(absolutePath, (err) => {
          if (err) console.warn("Old image delete failed:", err.message);
        });
      }

      /* ------------------ 3. UPSERT STUDENT TABLE ------------------ */
      const exists = await pool.query(
        `SELECT id FROM students WHERE user_id = $1`,
        [userId]
      );

      if (exists.rowCount > 0) {
        // Update existing student record
        await pool.query(
          `
          UPDATE users SET
            registration_no = $1
          WHERE id = $2
        `,
          [req.body.registration_no || exists.rows[0].registration_no, userId]
        );
      } else {
        // Insert new student record if not exists
        await pool.query(
          `
          INSERT INTO students (user_id)
          VALUES ($1)
        `,
          [userId || ""]
        );
      }

      res.json({ message: "Student profile updated successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

export default router;
