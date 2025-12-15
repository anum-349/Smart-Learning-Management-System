import Grade from "../models/grade.js";

export const createGrade = async (req, res) => {
  try {
    const { studentId, gradeItemId, score } = req.body;

    const exists = await Grade.findOne({ studentId, gradeItemId });
    if (exists)
      return res.status(400).json({ message: "Grade already exists for this student & grade item" });

    const newGrade = await Grade.create({ studentId, gradeItemId, score });

    res.status(201).json({ message: "Grade added successfully", data: newGrade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate("studentId", "name rollNo")
      .populate("gradeItemId", "title totalMarks");

    res.status(200).json({ data: grades });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getGradeById = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate("studentId", "name rollNo")
      .populate("gradeItemId", "title totalMarks");

    if (!grade) return res.status(404).json({ message: "Grade not found" });

    res.status(200).json({ data: grade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateGrade = async (req, res) => {
  try {
    const updated = await Grade.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Grade not found" });

    res.status(200).json({ message: "Updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const deleteGrade = async (req, res) => {
  try {
    const deleted = await Grade.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Grade not found" });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getStudentGrades = async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId })
      .populate("gradeItemId", "title totalMarks");

    res.status(200).json({ data: grades });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getGradesByItem = async (req, res) => {
  try {
    const grades = await Grade.find({ gradeItemId: req.params.gradeItemId })
      .populate("studentId", "name rollNo");

    res.status(200).json({ data: grades });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
