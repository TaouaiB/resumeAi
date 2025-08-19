import { callHuggingFaceAPI } from "../../../lib/httpClient";
import { parsePDF } from "../utils/pdfParser";
import { ResumeAnalysisResult } from "../types";

export const analyzeResumeService = async (
  resumeBase64: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> => {
  // 1. PARSE PDF TO TEXT
  const resumeText = await parsePDF(resumeBase64);
  console.log("▼ Resume Extract ▼", resumeText.substring(0, 500));

  // 2. ATTEMPT AI ANALYSIS
  try {
    const aiResult = await attemptAIAnalysis(resumeText, jobDescription);
    return aiResult;
  } catch (err) {
    console.error("AI analysis failed, falling back:", err);
    return fallbackKeywordAnalysis(resumeText, jobDescription);
  }
};

/* ======================================================
   ATTEMPT AI ANALYSIS
====================================================== */
const attemptAIAnalysis = async (
  resumeText: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> => {
  const prompt = `
You are an expert ATS (Applicant Tracking System). 
Compare the resume with the job description and return a JSON object only.

JSON STRUCTURE:
{
  "matchScore": number (0-100),
  "strengths": [ "skill/experience" ],
  "weaknesses": [ "missing skill/requirement" ],
  "suggestions": [ "personalized tip" ]
}

### JOB DESCRIPTION ###
${jobDescription}

### RESUME CONTENT ###
${resumeText.substring(0, 3000)}
`;

  const hfResponse = await callHuggingFaceAPI(prompt);

  // Hugging Face sometimes returns array/object → normalize
  let resultText: string;
  if (Array.isArray(hfResponse)) {
    resultText = hfResponse[0]?.generated_text || "";
  } else if (hfResponse.generated_text) {
    resultText = hfResponse.generated_text;
  } else if (typeof hfResponse === "string") {
    resultText = hfResponse;
  } else {
    throw new Error("Unexpected HF response format");
  }

  console.log("▼ AI Raw Output ▼", resultText.substring(0, 300));

  try {
    return JSON.parse(resultText) as ResumeAnalysisResult;
  } catch {
    throw new Error("Failed to parse AI output");
  }
};

/* ======================================================
   FALLBACK ANALYSIS (Keyword Matching)
====================================================== */
const fallbackKeywordAnalysis = (
  resumeText: string,
  jobDescription: string
): ResumeAnalysisResult => {
  // 1. Extract keywords from job description
  const jdKeywords = jobDescription
    .split(/[\s,.;:()\n]/) // split into tokens
    .filter(word => word.length > 2) // ignore short words
    .map(w => w.replace(/[^a-zA-Z0-9+.#]/g, "")) // clean punctuation
    .map(w => w.toLowerCase());

  const uniqueJDKeywords = [...new Set(jdKeywords)];

  // 2. Match with resume text
  const resumeLower = resumeText.toLowerCase();

  const foundSkills = uniqueJDKeywords.filter(k => resumeLower.includes(k));
  const missingSkills = uniqueJDKeywords.filter(k => !resumeLower.includes(k));

  // 3. Simple match score
  const matchScore = Math.round(
    (foundSkills.length / (foundSkills.length + missingSkills.length || 1)) * 100
  );

  // 4. Suggestions
  const suggestions: string[] = [
    "Tailor your resume to highlight more job-specific skills",
    ...(missingSkills.length > 0
      ? [`Consider adding experience with: ${missingSkills.slice(0, 5).join(", ")}`]
      : ["Resume already aligns well with the job description"])
  ];

  return {
    matchScore,
    strengths: foundSkills.length ? foundSkills : ["Some relevant experience detected"],
    weaknesses: missingSkills.length ? missingSkills : ["No major skill gaps detected"],
    suggestions
  };
};
