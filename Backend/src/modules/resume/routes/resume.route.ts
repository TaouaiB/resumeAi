// src/modules/resume/routes/resume.route.ts
import { Router } from "express";
import multer from "multer";
import { analyzeResumeController } from "../controllers/resume.controller";
import { validateAnalyzeRequest } from "../validators/resume.validator";
import { parsePDF } from "../utils/pdfParser";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() }); // store file in memory

router.post('/debug-text', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }
    const text = await parsePDF(req.file.buffer.toString('base64'));
    res.json({ 
      length: text.length, 
      sample: text.substring(0, 500),
      success: true 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
});

router.post("/", upload.single("resumeBase64"),validateAnalyzeRequest, analyzeResumeController);

export default router;
