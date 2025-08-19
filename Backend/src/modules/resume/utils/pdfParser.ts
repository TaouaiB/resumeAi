// src/modules/resume/utils/pdfParser.ts
import pdfParse from "pdf-parse";

export const parsePDF = async (base64: string): Promise<string> => {
  const buffer = Buffer.from(base64, "base64");
  const data = await pdfParse(buffer);
  return data.text;
};
