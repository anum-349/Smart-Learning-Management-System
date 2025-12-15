import GradeItem from "../models/gradeItem.js";

export const createGradeItem = async (req, res) => {
  try {
    const { courseAssignmentId, itemType, weightage, maxScore } = req.body;

    const exists = await GradeItem.findOne({
      courseAssignmentId,
      itemType
    });

    if (exists)
      return res.status(400).json({
        message: `${itemType} already exists for this course`
      });

    const item = await GradeItem.create({
      courseAssignmentId,
      itemType,
      weightage,
      maxScore
    });

    res.status(201).json({ message: "Grade item created", data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllGradeItems = async (req, res) => {
  try {
    const items = await GradeItem.find()
      .populate("courseAssignmentId", "courseId instructorId");

    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getGradeItemById = async (req, res) => {
  try {
    const item = await GradeItem.findById(req.params.id)
      .populate("courseAssignmentId", "courseId instructorId");

    if (!item)
      return res.status(404).json({ message: "Grade item not found" });

    res.status(200).json({ data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateGradeItem = async (req, res) => {
  try {
    const updated = await GradeItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Grade item not found" });

    res.status(200).json({ message: "Updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteGradeItem = async (req, res) => {
  try {
    const deleted = await GradeItem.findOneAndDelete({ _id: req.params.id });

    if (!deleted)
      return res.status(404).json({ message: "Grade item not found" });

    res.status(200).json({ message: "Grade item deleted (grades also removed)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getCourseGradeItems = async (req, res) => {
  try {
    const items = await GradeItem.find({
      courseAssignmentId: req.params.courseAssignmentId
    });

    res.status(200).json({ data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
