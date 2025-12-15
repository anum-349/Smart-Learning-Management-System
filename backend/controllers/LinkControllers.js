import Faculty from "../models/facultyModel.js";
import Department from "../models/departmentModel.js";
import Semester from "../models/semesterModel.js";
import Course from "../models/courseModel.js";
import CourseAssignment from "../models/courseAssignmentModel.js";
import Student from "../models/studentModel.js";
import Instructor from "../models/instructorModel.js";

export const assignDepartmentToFaculty = async (req, res) => {
    try {
        const { departmentId, facultyId } = req.body;

        const faculty = await Faculty.findById(facultyId);
        const department = await Department.findById(departmentId);

        if (!faculty || !department)
            return res.status(404).json({ message: "Faculty or Department not found" });

        department.facultyId = faculty._id;
        await department.save();

        res.status(200).json({ message: "Department assigned to Faculty", department });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const assignStudentDepartmentSemester = async (req, res) => {
    try {
        const { studentId, departmentId, semesterId } = req.body;

        const student = await Student.findById(studentId);
        const department = await Department.findById(departmentId);
        const semester = await Semester.findById(semesterId);

        if (!student || !department || !semester)
            return res.status(404).json({ message: "Student, Department, or Semester not found" });

        student.departmentId = department._id;
        student.semester = semester._id;

        await student.save();

        res.status(200).json({ message: "Student assigned to Department and Semester", student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCourseAssignment = async (req, res) => {
    try {
        const { courseId, instructorId, semesterId } = req.body;

        const course = await Course.findById(courseId);
        const instructor = await Instructor.findById(instructorId);
        const semester = await Semester.findById(semesterId);

        if (!course || !instructor || !semester)
            return res.status(404).json({ message: "Course, Instructor, or Semester not found" });

        const assignment = await CourseAssignment.create({
            courseId: course._id,
            instructorId: instructor._id,
            semesterId: semester._id
        });

        res.status(201).json({ message: "CourseAssignment created", assignment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentLinkedInfo = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate({
                path: "departmentId",
                populate: { path: "facultyId" } 
            })
            .populate("semester");

        if (!student)
            return res.status(404).json({ message: "Student not found" });

        res.status(200).json({ student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
