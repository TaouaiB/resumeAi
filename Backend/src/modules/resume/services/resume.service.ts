import { callHuggingFaceAPI } from "../../../lib/httpClient";
import { ResumeAnalysisResult } from "../types";
import { parsePDF } from "../utils/pdfParser";

export const analyzeResumeService = async (
  resumeBase64: string,
  jobDescription: string
): Promise<ResumeAnalysisResult> => {
  // 1. PARSE PDF
  const resumeText = await parsePDF(resumeBase64);
  console.log('▼▼▼ RESUME EXTRACT ▼▼▼', resumeText.substring(0, 200));

  // 2. ATTEMPT STRUCTURED ANALYSIS
  const structuredResult = await attemptStructuredAnalysis(resumeText, jobDescription);
  if (!structuredResult.failed) return structuredResult.result;

  // 3. FALLBACK TO MANUAL ANALYSIS
  return performManualAnalysis(resumeText, jobDescription);
};

// ============= STRUCTURED ANALYSIS ATTEMPT =============
const attemptStructuredAnalysis = async (
  resumeText: string,
  jobDescription: string
): Promise<{ failed: boolean; result: ResumeAnalysisResult }> => {
  const prompt = `
  ### STRICT RESPONSE FORMAT REQUIRED ###
  <strengths>
  - [Skill 1 from resume matching job]
  - [Skill 2 from resume matching job]
  - [Skill 3 from resume matching job]
  </strengths>

  <weaknesses>
  - [Missing requirement 1 from job]
  - [Missing requirement 2 from job]
  </weaknesses>

  <suggestions>
  - [Actionable suggestion 1]
  - [Actionable suggestion 2]
  </suggestions>

  ### JOB DESCRIPTION ###
  ${jobDescription}

  ### RESUME CONTENT ###
  ${resumeText.substring(0, 2500)}

  ### RULES ###
  1. Only write between XML-style tags
  2. Each item must start with "- "
  3. Never write outside tags
  `;

  try {
    const hfResponse = await callHuggingFaceAPI(JSON.stringify({
      model: "facebook/bart-large-cnn",
      inputs: prompt,
      parameters: {
        max_length: 2000,
        temperature: 0.1,
        repetition_penalty: 3.0,
        num_beams: 4
      }
    }));

    const resultText = hfResponse[0]?.generated_text || "";
    const result = parseStructuredResponse(resultText);

    if (!result.strengths[0].includes('section missing')) {
      return { failed: false, result };
    }
  } catch (error) {
    console.error('Structured analysis failed:', error);
  }
  return { 
    failed: true, 
    result: { 
      strengths: [], 
      weaknesses: [], 
      suggestions: [] 
    } 
  };
};

// ============= MANUAL FALLBACK ANALYSIS =============
const performManualAnalysis = (
  resumeText: string,
  jobDescription: string
): ResumeAnalysisResult => {
  // Tech stack keywords to check
  const techKeywords = [
    'React', 'Node.js', 'MongoDB', 'Express', 'JavaScript',
    'TypeScript', 'HTML', 'CSS', 'Git', 'REST API'
  ];

  // Find matching skills
  const foundSkills = techKeywords.filter(keyword => 
    resumeText.toLowerCase().includes(keyword.toLowerCase()) && 
    jobDescription.toLowerCase().includes(keyword.toLowerCase())
  );

  // Find missing requirements
  const missingSkills = techKeywords.filter(keyword =>
    jobDescription.toLowerCase().includes(keyword.toLowerCase()) && 
    !resumeText.toLowerCase().includes(keyword.toLowerCase())
  );

  return {
    strengths: foundSkills.length > 0 ? foundSkills : ['MERN stack experience'],
    weaknesses: missingSkills.length > 0 ? missingSkills : ['No major gaps detected'],
    suggestions: getSuggestions(missingSkills)
  };
};

// ============= HELPER FUNCTIONS =============
const parseStructuredResponse = (text: string): ResumeAnalysisResult => {
  const extractSection = (tag: string): string[] => {
    const start = `<${tag}>`;
    const end = `</${tag}>`;
    const startIdx = text.indexOf(start);
    const endIdx = text.indexOf(end);

    if (startIdx === -1 || endIdx === -1) return [`<${tag}> section missing`];

    return text
      .slice(startIdx + start.length, endIdx)
      .split('\n')
      .filter(line => line.trim().startsWith('- '))
      .map(line => line.replace('- ', '').trim())
      .filter(item => item.length > 0);
  };

  return {
    strengths: extractSection('strengths'),
    weaknesses: extractSection('weaknesses'),
    suggestions: extractSection('suggestions')
  };
};

const getSuggestions = (missingSkills: string[]): string[] => {
  const suggestions = [
    'Highlight more projects in your portfolio',
    'Add metrics to project descriptions (e.g. "Improved performance by 40%")'
  ];

  if (missingSkills.includes('TypeScript')) {
    suggestions.push('Learn TypeScript and add a TS project');
  }
  if (missingSkills.includes('AWS')) {
    suggestions.push('Get AWS Cloud Practitioner certified');
  }

  return suggestions.length > 0 ? suggestions : [
    'Tailor your resume to match job requirements more closely'
  ];
};