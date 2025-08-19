import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { analyzeResumeService } from "../services/resume.service";

export const analyzeResumeController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {const file = req.file;
    const jobDescription = req.body.jobDescription;

    console.log('File info:', {
        originalname: file?.originalname, 
        size: file?.size,
        mimetype: file?.mimetype
      });
      console.log('Job Description:', jobDescription);

    if (!file) {
      res.status(400).json({ success: false, message: "Resume file is required" });
      return;
    }

    if (!jobDescription) {
      res.status(400).json({ success: false, message: "Job description is required" });
      return;
    }

    const resumeBase64 = file.buffer.toString("base64");
          console.log('Base64 length:', resumeBase64.length);

          
    const analysis = await analyzeResumeService(resumeBase64, jobDescription);

    res.json({ success: true, data: analysis });}
    catch (error) {
       console.error('DEBUG ERROR:', error);
    throw error;
    }
    
  }
);
