import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const profileQuery = `
  SELECT u.id, st.id AS student_id, u.username, u.full_name AS fullname,
    u.father_name, u.email, u.phone, u.gender, u.address, u.date_of_birth,
    u.profile_picture, u.registration_no, st.status,
    d.title AS department, p.title AS program,
    sem.semester_number, sem.id AS semester_id
  FROM users u
  LEFT JOIN students st ON st.user_id = u.id
  LEFT JOIN departments d ON d.id = st.department_id
  LEFT JOIN programs p ON p.id = st.program_id
  LEFT JOIN semesters sem ON sem.id = st.semester_id
  WHERE u.id = $1
`;

const getStudentRecord = async (userId, client = pool) => {
  const result = await client.query("SELECT id FROM students WHERE user_id=$1", [userId]);
  return result.rows[0] || null;
};

// Administrative student directory and CRUD endpoints.
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT st.id AS student_id, st.user_id, st.department_id, st.program_id, st.semester_id, st.status,
        u.full_name, u.email, u.registration_no,
        d.title AS department_title, p.title AS program_title, sem.semester_number
      FROM students st
      JOIN users u ON u.id = st.user_id
      LEFT JOIN departments d ON d.id = st.department_id
      LEFT JOIN programs p ON p.id = st.program_id
      LEFT JOIN semesters sem ON sem.id = st.semester_id
      ORDER BY u.full_name
    `);
    res.json(rows);
  } catch (err) {
    console.error("Admin student list error:", err);
    res.status(500).json({ message: "Failed to load students" });
  }
});

router.post("/", async (req, res) => {
  const { fullName, username, email, password, registrationNo, departmentId, programId, semesterId, status } = req.body;
  if (!fullName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await client.query(
      `INSERT INTO users (username, full_name, email, password, role, registration_no)
       VALUES ($1,$2,$3,$4,'Student',$5) RETURNING id`,
      [username?.trim() || email.split("@")[0], fullName.trim(), email.trim(), passwordHash, registrationNo?.trim() || null]
    );
    const student = await client.query(
      `INSERT INTO students (user_id, department_id, program_id, semester_id, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [user.rows[0].id, departmentId || null, programId || null, semesterId || null, status || "active"]
    );
    await client.query("COMMIT");
    res.status(201).json({ student_id: student.rows[0].id, user_id: user.rows[0].id, message: "Student created" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Admin student create error:", err);
    res.status(err.code === "23505" ? 409 : 500).json({
      message: err.code === "23505" ? "Email, username, or registration number is already in use" : "Failed to create student",
    });
  } finally {
    client.release();
  }
});

router.put("/:studentId", async (req, res) => {
  const { fullName, username, email, password, registrationNo, departmentId, programId, semesterId, status } = req.body;
  if (!fullName?.trim() || !email?.trim()) {
    return res.status(400).json({ message: "Name and email are required" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query("SELECT user_id FROM students WHERE id=$1 FOR UPDATE", [req.params.studentId]);
    if (!found.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student not found" });
    }
    const values = [username?.trim() || email.split("@")[0], fullName.trim(), email.trim(), registrationNo?.trim() || null];
    let updateUser = `UPDATE users SET username=$1, full_name=$2, email=$3, registration_no=$4`;
    if (password) {
      values.push(await bcrypt.hash(password, 10));
      updateUser += `, password=$${values.length}`;
    }
    values.push(found.rows[0].user_id);
    await client.query(`${updateUser} WHERE id=$${values.length}`, values);
    await client.query(
      `UPDATE students SET department_id=$1, program_id=$2, semester_id=$3, status=$4 WHERE id=$5`,
      [departmentId || null, programId || null, semesterId || null, status || "active", req.params.studentId]
    );
    await client.query("COMMIT");
    res.json({ message: "Student updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Admin student update error:", err);
    res.status(err.code === "23505" ? 409 : 500).json({
      message: err.code === "23505" ? "Email, username, or registration number is already in use" : "Failed to update student",
    });
  } finally {
    client.release();
  }
});

router.delete("/:studentId", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const student = await client.query("DELETE FROM students WHERE id=$1 RETURNING user_id", [req.params.studentId]);
    if (!student.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student not found" });
    }
    await client.query("DELETE FROM users WHERE id=$1", [student.rows[0].user_id]);
    await client.query("COMMIT");
    res.json({ message: "Student deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Admin student delete error:", err);
    res.status(500).json({ message: "Failed to delete student. Related records may need to be removed first." });
  } finally {
    client.release();
  }
});

const getStudentCourses = async (userId, client = pool) => {
  const { rows } = await client.query(
    `SELECT c.id AS course_id, c.code, c.title, c.credit_hours AS credits,
      er.status AS enrollment_status, er.created_at AS enrolled_at,
      st.semester_id, sem.semester_number,
      COALESCE((
        SELECT string_agg(DISTINCT instructor.full_name, ', ' ORDER BY instructor.full_name)
        FROM course_assignments ca
        JOIN users instructor ON instructor.id=ca.instructor_id
        WHERE ca.course_id=c.id
      ), '') AS instructors
     FROM students st
     JOIN enrollment_requests er ON er.student_id=st.id
     JOIN courses c ON c.id=er.course_id
     LEFT JOIN semesters sem ON sem.id=st.semester_id
     WHERE st.user_id=$1 AND er.status IN ('Approved','Enrolled')
     ORDER BY c.title`,
    [userId]
  );
  return rows;
};

router.get("/:userId/enrollment-options", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id AS course_id,c.code,c.title,c.credit_hours AS credits,
        req.status AS enrollment_status,sem.semester_number
       FROM students st
       JOIN semester_assignments sa ON sa.program_id=st.program_id AND sa.semester=st.semester_id
       CROSS JOIN LATERAL unnest(sa.assigned_course_ids) AS offered(course_id)
       JOIN courses c ON c.id=offered.course_id
       LEFT JOIN semesters sem ON sem.id=st.semester_id
       LEFT JOIN LATERAL (
         SELECT er.status FROM enrollment_requests er
         WHERE er.student_id=st.id AND er.course_id=c.id
         ORDER BY er.created_at DESC LIMIT 1
       ) req ON TRUE
       WHERE st.user_id=$1
       ORDER BY c.title`,
      [req.params.userId]
    );
    const profile = await pool.query(profileQuery, [req.params.userId]);
    if (!profile.rowCount || !profile.rows[0].student_id) return res.status(404).json({ message: "Student profile not found" });
    res.json({ student: profile.rows[0], courses: rows });
  } catch (err) {
    console.error("Student enrollment options error:", err);
    res.status(500).json({ message: "Failed to load enrollment options" });
  }
});

router.post("/:userId/enrollment-requests", async (req, res) => {
  const courseIds = Array.isArray(req.body.course_ids) ? [...new Set(req.body.course_ids.map(Number).filter(Number.isInteger))] : [];
  const { registration_no } = req.body;
  if (!courseIds.length || !registration_no?.trim()) {
    return res.status(400).json({ message: "Select at least one course and confirm your registration number" });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const studentResult = await client.query(
      `SELECT st.id,st.program_id,st.semester_id,u.registration_no
       FROM students st JOIN users u ON u.id=st.user_id WHERE st.user_id=$1 FOR UPDATE`,
      [req.params.userId]
    );
    if (!studentResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student profile not found" });
    }
    const student = studentResult.rows[0];
    if (student.registration_no !== registration_no.trim()) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Registration number does not match your profile" });
    }
    const offeredResult = await client.query(
      `SELECT DISTINCT offered.course_id::int AS course_id
       FROM semester_assignments sa
       CROSS JOIN LATERAL unnest(sa.assigned_course_ids) AS offered(course_id)
       WHERE sa.program_id=$1 AND sa.semester=$2`,
      [student.program_id, student.semester_id]
    );
    const offeredIds = new Set(offeredResult.rows.map((row) => Number(row.course_id)));
    if (courseIds.some((courseId) => !offeredIds.has(courseId))) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "One or more selected courses are not offered for your program and semester" });
    }

    const requests = [];
    for (const courseId of courseIds) {
      const previous = await client.query(
        `SELECT id,status FROM enrollment_requests WHERE student_id=$1 AND course_id=$2 ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
        [student.id, courseId]
      );
      if (previous.rowCount && ["Pending", "Approved", "Enrolled", "Created"].includes(previous.rows[0].status)) {
        requests.push(previous.rows[0]);
        continue;
      }
      if (previous.rowCount) {
        const updated = await client.query(
          `UPDATE enrollment_requests SET status='Pending',created_at=NOW() WHERE id=$1 RETURNING id,status`,
          [previous.rows[0].id]
        );
        requests.push(updated.rows[0]);
      } else {
        const inserted = await client.query(
          `INSERT INTO enrollment_requests (student_id,course_id,status) VALUES ($1,$2,'Pending') RETURNING id,status`,
          [student.id, courseId]
        );
        requests.push(inserted.rows[0]);
      }
    }
    await client.query("COMMIT");
    res.status(201).json({ message: "Course enrollment requests submitted", requests });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Student enrollment request error:", err);
    res.status(500).json({ message: "Failed to submit enrollment requests", error: err.message });
  } finally {
    client.release();
  }
});

/* Student home dashboard */
router.get("/dashboard/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await pool.query(profileQuery, [userId]);
    if (!profile.rowCount || !profile.rows[0].student_id) {
      return res.status(404).json({ message: "Student profile not found" });
    }
    const [courses, assignments, quizzes] = await Promise.all([
      getStudentCourses(userId),
      pool.query(
        `SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE sub.id IS NULL)::int AS pending
         FROM students st
         JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
         JOIN assignments a ON a.course_id=er.course_id
         LEFT JOIN assignment_submissions sub ON sub.assignment_id=a.id AND sub.student_id=st.user_id
         WHERE st.user_id=$1`, [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE sub.id IS NULL)::int AS pending
         FROM students st
         JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
         JOIN quizzes q ON q.course_id=er.course_id
         LEFT JOIN quiz_submissions sub ON sub.quiz_id=q.id AND sub.student_id=st.user_id
         WHERE st.user_id=$1`, [userId]
      ),
    ]);
    res.json({
      student: profile.rows[0],
      courses,
      assignments: assignments.rows[0],
      quizzes: quizzes.rows[0],
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    res.status(500).json({ message: "Failed to load student dashboard" });
  }
});

/* Enrolled courses */
router.get("/:userId/courses", async (req, res) => {
  try {
    const student = await getStudentRecord(req.params.userId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    res.json(await getStudentCourses(req.params.userId));
  } catch (err) {
    console.error("Student courses error:", err);
    res.status(500).json({ message: "Failed to load courses" });
  }
});

/* Assignments and the student's current submission */
router.get("/:userId/assignments", async (req, res) => {
  try {
    const student = await getStudentRecord(req.params.userId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    const { rows } = await pool.query(
      `SELECT DISTINCT a.id, a.course_id, c.title AS course_title, c.code AS course_code,
        a.title, a.description, a.file_name, COALESCE(a.file_path,a.file_url) AS file_path,
        COALESCE(a.deadline,a.due_date) AS deadline, a.total_marks, a.created_at,
        sub.id AS submission_id, sub.file_name AS submitted_file_name,
        sub.file_path AS submitted_file_path, sub.submitted_at, sub.grade, sub.feedback,
        CASE WHEN sub.id IS NULL THEN 'Not Submitted'
             WHEN sub.grade IS NULL THEN 'Submitted' ELSE 'Graded' END AS status
       FROM students st
       JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
       JOIN assignments a ON a.course_id=er.course_id
       JOIN courses c ON c.id=a.course_id
       LEFT JOIN assignment_submissions sub ON sub.assignment_id=a.id AND sub.student_id=st.user_id
       WHERE st.user_id=$1
       ORDER BY COALESCE(a.deadline,a.due_date) NULLS LAST, a.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Student assignments error:", err);
    res.status(500).json({ message: "Failed to load assignments" });
  }
});

/* Quizzes and the student's current submission */
router.get("/:userId/quizzes", async (req, res) => {
  try {
    const student = await getStudentRecord(req.params.userId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    const { rows } = await pool.query(
      `SELECT DISTINCT q.id, q.course_id, c.title AS course_title, c.code AS course_code,
        q.title, q.description, q.file_name, q.file_path, q.total_marks,
        q.start_date, q.deadline, q.created_at,
        sub.id AS submission_id, sub.file_name AS submitted_file_name,
        sub.file_path AS submitted_file_path, sub.submitted_at, sub.status,
        sub.grade, sub.feedback
       FROM students st
       JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
       JOIN quizzes q ON q.course_id=er.course_id
       JOIN courses c ON c.id=q.course_id
       LEFT JOIN quiz_submissions sub ON sub.quiz_id=q.id AND sub.student_id=st.user_id
       WHERE st.user_id=$1
       ORDER BY q.deadline NULLS LAST, q.created_at DESC`,
      [req.params.userId]
    );
    res.json(rows.map((row) => ({ ...row, status: row.status || "Not Submitted" })));
  } catch (err) {
    console.error("Student quizzes error:", err);
    res.status(500).json({ message: "Failed to load quizzes" });
  }
});

/* Published resources and course content for enrolled courses */
router.get("/:userId/resources", async (req, res) => {
  try {
    const student = await getStudentRecord(req.params.userId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    const courseId = req.query.course_id || null;
    const { rows } = await pool.query(
      `SELECT * FROM (
        SELECT cr.id, cr.course_id, c.code AS course_code, c.title AS course_title,
          cr.title, cr.type, cr.file_name, cr.file_path, cr.uploaded_at AS created_at,
          'resource'::text AS source
        FROM students st
        JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
        JOIN course_resources cr ON cr.course_id=er.course_id
        JOIN courses c ON c.id=cr.course_id
        WHERE st.user_id=$1
        UNION ALL
        SELECT cc.id, cc.course_id::int, c.code AS course_code, c.title AS course_title,
          cc.title, cc.type, regexp_replace(cc.file_url, '^.*/', '') AS file_name,
          cc.file_url AS file_path, cc.created_at, 'content'::text AS source
        FROM students st
        JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
        JOIN course_contents cc ON cc.course_id::int=er.course_id
        JOIN courses c ON c.id=er.course_id
        WHERE st.user_id=$1
      ) published
      WHERE ($2::int IS NULL OR course_id=$2::int)
      ORDER BY created_at DESC NULLS LAST`,
      [req.params.userId, courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Student resources error:", err);
    res.status(500).json({ message: "Failed to load course resources" });
  }
});

/* Course attendance history, keyed through students.id in attendance_records */
router.get("/:userId/attendance", async (req, res) => {
  try {
    const student = await getStudentRecord(req.params.userId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    const courseId = req.query.course_id || null;
    const { rows } = await pool.query(
      `SELECT c.id AS course_id, c.code AS course_code, c.title AS course_title,
        sem.semester_number, ats.id AS session_id, ats.session_date, ar.status
       FROM students st
       JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
       JOIN courses c ON c.id=er.course_id
       LEFT JOIN semesters sem ON sem.id=st.semester_id
       JOIN LATERAL (
         SELECT ca.id FROM course_assignments ca
         WHERE ca.course_id=c.id
         ORDER BY CASE WHEN ca.semester_id=st.semester_id THEN 0 ELSE 1 END, ca.id LIMIT 1
       ) ca ON TRUE
       LEFT JOIN attendance_sessions ats ON ats.course_assignment_id=ca.id
       LEFT JOIN attendance_records ar ON ar.session_id=ats.id AND ar.student_id=st.id
       WHERE st.user_id=$1 AND ($2::int IS NULL OR c.id=$2::int)
       ORDER BY c.title, ats.session_date NULLS LAST`,
      [req.params.userId, courseId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Student attendance error:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
});

/* Recorded assignment and quiz marks; the LMS has no official final-results table. */
router.get("/:userId/results", async (req, res) => {
  try {
    const student = await getStudentRecord(req.params.userId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    const { rows } = await pool.query(
      `SELECT * FROM (
        SELECT c.id AS course_id, c.code AS course_code, c.title AS course_title,
          c.credit_hours AS credits, 'Assignment'::text AS assessment_type,
          a.title AS assessment_title, sub.grade AS obtained_marks,
          a.total_marks AS max_marks, sub.feedback, sub.submitted_at AS graded_at
        FROM students st
        JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
        JOIN assignments a ON a.course_id=er.course_id
        JOIN courses c ON c.id=a.course_id
        JOIN assignment_submissions sub ON sub.assignment_id=a.id AND sub.student_id=st.user_id
        WHERE st.user_id=$1 AND sub.grade IS NOT NULL
        UNION ALL
        SELECT c.id AS course_id, c.code AS course_code, c.title AS course_title,
          c.credit_hours AS credits, 'Quiz'::text AS assessment_type,
          q.title AS assessment_title, sub.grade AS obtained_marks,
          q.total_marks AS max_marks, sub.feedback, sub.submitted_at AS graded_at
        FROM students st
        JOIN enrollment_requests er ON er.student_id=st.id AND er.status IN ('Approved','Enrolled')
        JOIN quizzes q ON q.course_id=er.course_id
        JOIN courses c ON c.id=q.course_id
        JOIN quiz_submissions sub ON sub.quiz_id=q.id AND sub.student_id=st.user_id
        WHERE st.user_id=$1 AND sub.grade IS NOT NULL
      ) assessment_results
      ORDER BY course_title, graded_at DESC NULLS LAST`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Student results error:", err);
    res.status(500).json({ message: "Failed to load assessment results" });
  }
});

/* ================== GET STUDENT PROFILE ================== */
router.get("/profile/:userId", async (req, res) => {
  try {
    const result = await pool.query(profileQuery, [req.params.userId]);
    if (!result.rowCount) return res.status(404).json({ message: "Student not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Student profile error:", err);
    res.status(500).json({ message: "Failed to load student profile" });
  }
});

/* ================== UPDATE STUDENT PROFILE ================== */
router.put("/profile/:userId", upload.single("profile_picture"), async (req, res) => {
  const { fullname, username, email, phone, gender, address, registration_no, date_of_birth } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const previous = req.file
      ? await client.query("SELECT profile_picture FROM users WHERE id=$1", [req.params.userId])
      : null;
    const values = [username, email, phone || null, gender || null, address || null, fullname, registration_no || null, date_of_birth || null];
    let query = `UPDATE users SET username=$1,email=$2,phone=$3,gender=$4,address=$5,
      full_name=$6,registration_no=$7,date_of_birth=$8`;
    if (req.file) {
      values.push(req.file.path.replace(/\\/g, "/"));
      query += `,profile_picture=$${values.length}`;
    }
    values.push(req.params.userId);
    query += ` WHERE id=$${values.length} RETURNING id`;
    const updated = await client.query(query, values);
    if (!updated.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student not found" });
    }

    const studentRecord = await client.query("SELECT id FROM students WHERE user_id=$1", [req.params.userId]);
    if (!studentRecord.rowCount) {
      await client.query("INSERT INTO students (user_id,status) VALUES ($1,'active')", [req.params.userId]);
    }
    await client.query("COMMIT");
    const oldImage = previous?.rows[0]?.profile_picture;
    if (oldImage && req.file) fs.unlink(path.resolve(oldImage), () => {});
    res.json({ message: "Student profile updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Student profile update error:", err);
    res.status(500).json({ message: "Failed to update student profile", error: err.message });
  } finally {
    client.release();
  }
});

export default router;
