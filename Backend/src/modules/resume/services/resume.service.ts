import { parsePDF } from "../utils/pdfParser";
import { callHuggingFaceAPI } from "../../../lib/httpClient";
import { ResumeAnalysisResult } from "../types";

export const analyzeResumeService = async (
  resumeBase64: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> => {
  // Parse PDF text properly
  const resumeText = await parsePDF(resumeBase64);

  const prompt = `
You are an expert recruiter. Analyze the following resume and compare it to the job description.
Provide your response in JSON format with fields: strengths, weaknesses, suggestions.

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

  const result = await callHuggingFaceAPI(prompt);

  // Extract generated text from Hugging Face output
  const generatedText = result[0]?.generated_text || "";

  // Attempt to parse JSON from the AI output
  let analysis: ResumeAnalysisResult = {
    strengths: [],
    weaknesses: [],
    suggestions: [],
  };

  try {
    analysis = JSON.parse(generatedText);
  } catch (err) {
    console.warn("Failed to parse HF result as JSON, returning raw text");
    analysis.suggestions = [generatedText]; // fallback
  }

  return analysis;
};
