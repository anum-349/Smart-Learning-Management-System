import GradeReport from "../models/gradeReport.js";

export const createGradeReport = async (req, res) => {
  try {
    const report = await GradeReport.create(req.body);

    res.status(201).json({
      success: true,
      message: "Grade Report created successfully",
      data: report
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getAllGradeReports = async (req, res) => {
  try {
    const reports = await GradeReport.find()
      .populate("studentId", "firstName lastName email")
      .populate("semesterId", "title year")
      .populate("courses.courseAssignmentId");

    res.status(200).json({ success: true, data: reports });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getGradeReportById = async (req, res) => {
  try {
    const report = await GradeReport.findById(req.params.id)
      .populate("studentId", "firstName lastName email")
      .populate("semesterId", "title year")
      .populate("courses.courseAssignmentId");

    if (!report)
      return res.status(404).json({ error: "Grade Report not found" });

    res.status(200).json({ success: true, data: report });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateGradeReport = async (req, res) => {
  try {
    const updated = await GradeReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Grade Report not found" });

    res.status(200).json({
      success: true,
      message: "Grade Report updated successfully",
      data: updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const deleteGradeReport = async (req, res) => {
  try {
    const deleted = await GradeReport.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ error: "Grade Report not found" });

    res.status(200).json({
      success: true,
      message: "Grade Report deleted successfully"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getStudentGradeReports = async (req, res) => {
  try {
    const reports = await GradeReport.find({ studentId: req.params.studentId });

    res.status(200).json({ success: true, data: reports });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getSemesterGradeReports = async (req, res) => {
  try {
    const reports = await GradeReport.find({ semesterId: req.params.semesterId });

    res.status(200).json({ success: true, data: reports });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
