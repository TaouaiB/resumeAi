// src/modules/resume/routes/resume.route.ts
import { Router } from "express";
import multer from "multer";
import { analyzeResumeController } from "../controllers/resume.controller";
import { validateAnalyzeRequest } from "../validators/resume.validator";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() }); // store file in memory


router.post("/", upload.single("resumeBase64"),validateAnalyzeRequest, analyzeResumeController);

export default router;
