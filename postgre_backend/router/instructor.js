import express from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import pool from "../config/db.js";

const router = express.Router();

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

router.get("/", async (req, res) => {
  const { departmentId } = req.query;

  try {
    const { rows } = await pool.query(
      `SELECT i.id, u.full_name
       FROM instructors i 
	   left join users u on u.id = i.user_id
       WHERE i.department_id = $1`,
      [departmentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

router.get("/courses/:instructorId", async (req, res) => {
  const { instructorId } = req.params;
  if (!instructorId) {
    return res.status(400).json({ message: "Instructor ID is required" });
  }

  try {
    const coursesRes = await pool.query(
      `
     SELECT c.id, c.title, c.code, s.semester_number, b.title as batch
      FROM course_assignments ic
      JOIN courses c ON c.id = ic.course_id
	  join semesters s on s.id = ic.semester_id
	  join batches b on b.id = s.batch_id
      WHERE ic.instructor_id = $1
      `,
      [instructorId]
    );

    res.json(coursesRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }

})

router.get("/:instructorId", async (req, res) => {
  const { instructorId } = req.params;

  if (!instructorId) {
    return res.status(400).json({ message: "Instructor ID is required" });
  }

  try {
    // 1️⃣ Get user & professional info
    const instructorRes = await pool.query(
      `
      SELECT 
        u.id AS user_id,
        u.full_name,
        u.username,
        u.email,
        u.phone,
        u.gender,
        u.address,
        u.profile_picture,
        i.rank,
        i.office_timing,
        i.employment_type,
        i.research_speciality,
        i.reason,
        d.title AS department
      FROM users u
      LEFT JOIN instructors i ON i.user_id = u.id
      LEFT JOIN departments d ON d.id = i.department_id
      WHERE u.id = $1
      `,
      [instructorId]
    );

    if (instructorRes.rowCount === 0) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const instructor = instructorRes.rows[0];

    // 2️⃣ Get qualifications
    const qualsRes = await pool.query(
      `
      SELECT degree, field, institution, year, document_file
      FROM user_qualifications
      WHERE user_id = $1
      ORDER BY year DESC
      `,
      [instructorId]
    );

    // 3️⃣ Get assigned courses
    const coursesRes = await pool.query(
      `
      SELECT c.id, c.title, c.code
      FROM course_assignments ic
      JOIN courses c ON c.id = ic.course_id
      WHERE ic.instructor_id = $1
      `,
      [instructorId]
    );

    res.json({
      personal_info: {
        full_name: instructor.full_name,
        username: instructor.username,
        email: instructor.email,
        phone: instructor.phone,
        gender: instructor.gender,
        address: instructor.address,
        profile_picture: instructor.profile_picture,
      },
      professional_info: {
        rank: instructor.rank,
        office_timing: instructor.office_timing,
        employment_type: instructor.employment_type,
        research_speciality: instructor.research_speciality,
        reason: instructor.reason,
        department: instructor.department,
      },
      qualifications: qualsRes.rows,
      assigned_courses: coursesRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;