import express from 'express'
import {createData, getAllData, getDataById, updateData, deleteData,
    getSubmissionsByAssignment,
    getSubmissionsByStudent,
    hasSubmitted,
    gradeSubmission,
    getAssignmentSummary
} from '../controllers/assignmentSubmissionController.js'

router = express.Router();

router.post("/", createData);
router.get("/", getAllData);
router.get("/:id", getDataById);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

router.get("/assignment/:assignmentId", getSubmissionsByAssignment);
router.get("/student/:studentId", getSubmissionsByStudent);
router.get("/check/:assignmentId/:studentId", hasSubmitted);
router.put("/grade/:id", gradeSubmission);
router.get("/summary/:assignmentId", getAssignmentSummary);

export default router;