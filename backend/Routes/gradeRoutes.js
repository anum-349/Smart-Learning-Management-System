import express from 'express'
import {createData, getAllData, getDataById, updateData, deleteData} from '../controllers/gradeController.js'

router = express.Router();

router.post("/", createData);
router.get("/", getAllData);
router.get("/:id", getDataById);
router.put("/:id", updateData);
router.delete("/:id", deleteData);

export default router;