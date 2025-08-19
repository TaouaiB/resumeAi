// src/modules/resume/types.ts

export interface ResumeAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  matchScore?: number; // optional score between resume & job description
}
