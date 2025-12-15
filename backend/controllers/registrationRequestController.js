import RegistrationRequest from "../models/registrationRequestModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";

export const createRequest = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    const studentExists = await User.findById(studentId);
    const courseExists = await Course.findById(courseId);

    if (!studentExists)
      return res.status(404).json({ error: "Student not found" });

    if (!courseExists)
      return res.status(404).json({ error: "Course not found" });

    const request = await RegistrationRequest.create({ studentId, courseId });

    res.status(201).json({
      message: "Registration request submitted successfully",
      data: request,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Request already submitted!" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getAllRequests = async (req, res) => {
  try {
    const requests = await RegistrationRequest.find()
      .populate("studentId", "name email")
      .populate("courseId", "name code");

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("courseId", "name code");

    if (!request)
      return res.status(404).json({ error: "Request not found" });

    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await RegistrationRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Request not found" });

    res.status(200).json({
      message: "Request updated",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const deleted = await RegistrationRequest.findByIdAndDelete(req.params.id);

    if (!deleted)
      return res.status(404).json({ error: "Request not found" });

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
