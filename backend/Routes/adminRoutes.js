import express from "express";
import {
    createAdmin,
    getAllAdmins,
    getAdminById,
    updateAdmin,
    approveRegistrationRequest, 
    generateReports,
    deleteAdmin
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/", createAdmin);
router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

router.put("/approve/:id", approveRegistrationRequest);
router.get("/reports", generateReports);

export default router;
