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
      `SELECT i.user_id AS id, u.full_name, u.email, u.registration_no,
        i.department_id, d.title AS department_title, i.rank, i.office_timing,
        i.employment_type, i.research_speciality, i.status
       FROM instructors i
       JOIN users u ON u.id = i.user_id
       LEFT JOIN departments d ON d.id = i.department_id
       WHERE ($1::int IS NULL OR i.department_id = $1)
       ORDER BY u.full_name`,
      [departmentId || null]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  const { fullName, username, email, password, registrationNo, departmentId, rank, employmentType, officeTiming, researchSpeciality, status } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO users (username, full_name, email, password, role, registration_no)
       VALUES ($1,$2,$3,$4,'Instructor',$5) RETURNING id`,
      [username?.trim() || email.split("@")[0], fullName.trim(), email.trim(), passwordHash, registrationNo?.trim() || null]
    );
    await client.query(
      `INSERT INTO instructors (user_id, department_id, rank, employment_type, office_timing, research_speciality, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [user.rows[0].id, departmentId || null, rank || null, employmentType || null, officeTiming || null, researchSpeciality || null, status || "active"]
    );
    await client.query("COMMIT");
    res.status(201).json({ id: user.rows[0].id, message: "Instructor created" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Admin instructor create error:", err);
    res.status(err.code === "23505" ? 409 : 500).json({
      message: err.code === "23505" ? "Email, username, or registration number is already in use" : "Failed to create instructor",
    });
  } finally {
    client.release();
  }
});

router.put("/:instructorId", async (req, res) => {
  const { fullName, username, email, password, registrationNo, departmentId, rank, employmentType, officeTiming, researchSpeciality, status } = req.body;
  if (!fullName?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query("SELECT user_id FROM instructors WHERE user_id=$1 FOR UPDATE", [req.params.instructorId]);
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Instructor not found" });
    }
    const values = [username?.trim() || email.split("@")[0], fullName.trim(), email.trim(), registrationNo?.trim() || null];
    let updateUser = `UPDATE users SET username=$1, full_name=$2, email=$3, registration_no=$4`;
    if (password) {
      values.push(await bcrypt.hash(password, 10));
      updateUser += `, password=$${values.length}`;
    }
    values.push(req.params.instructorId);
    await client.query(`${updateUser} WHERE id=$${values.length}`, values);
    await client.query(
      `UPDATE instructors SET department_id=$1, rank=$2, employment_type=$3,
       office_timing=$4, research_speciality=$5, status=$6 WHERE user_id=$7`,
      [departmentId || null, rank || null, employmentType || null, officeTiming || null, researchSpeciality || null, status || "active", req.params.instructorId]
    );
    await client.query("COMMIT");
    res.json({ message: "Instructor updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Admin instructor update error:", err);
    res.status(err.code === "23505" ? 409 : 500).json({
      message: err.code === "23505" ? "Email, username, or registration number is already in use" : "Failed to update instructor",
    });
  } finally {
    client.release();
  }
});

router.delete("/:instructorId", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const instructor = await client.query("DELETE FROM instructors WHERE user_id=$1 RETURNING user_id", [req.params.instructorId]);
    if (!instructor.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Instructor not found" });
    }
    await client.query("DELETE FROM users WHERE id=$1", [req.params.instructorId]);
    await client.query("COMMIT");
    res.json({ message: "Instructor deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Admin instructor delete error:", err);
    res.status(500).json({ message: "Failed to delete instructor. Related records may need to be removed first." });
  } finally {
    client.release();
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
