import express from "express";
import {
    createQualification,
    getAllQualifications,
    getQualificationById,
    updateQualification,
    deleteQualification,
    addCertificate,
    removeCertificate
} from "../controllers/qualificationController.js";

const router = express.Router();

router.post("/", createQualification);
router.get("/", getAllQualifications);
router.get("/:id", getQualificationById);
router.put("/:id", updateQualification);
router.delete("/:id", deleteQualification);

router.post("/:id/certificate", addCertificate);
router.delete("/:id/certificate/:certificateId", removeCertificate);

export default router;
