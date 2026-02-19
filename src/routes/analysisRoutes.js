import express from "express";
import multer from "multer";
import { analyzeVCF } from "../controllers/analysisController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post("/", upload.single("vcf"), analyzeVCF);

export default router;