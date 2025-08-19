// src/modules/resume/validators/resume.validator.ts
import { Request, Response, NextFunction } from "express";

export const validateAnalyzeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req.file; // multer stores uploaded file here
  const jobDescription = req.body.jobDescription;

  if (!file) {
    return res.status(400).json({ success: false, message: "Resume file is required" });
  }

  if (!jobDescription) {
    return res.status(400).json({ success: false, message: "jobDescription is required" });
  }

  next();
};
