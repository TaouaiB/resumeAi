import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { analyzeResumeService } from "../services/resume.service";

export const analyzeResumeController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const file = req.file;
    const jobDescription = req.body.jobDescription;

    if (!file) {
      res.status(400).json({ success: false, message: "Resume file is required" });
      return;
    }

    if (!jobDescription) {
      res.status(400).json({ success: false, message: "Job description is required" });
      return;
    }

    const resumeBase64 = file.buffer.toString("base64");
    const analysis = await analyzeResumeService(resumeBase64, jobDescription);

    res.json({ success: true, data: analysis });
  }
);
