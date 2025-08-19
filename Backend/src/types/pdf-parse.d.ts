// src/types/pdf-parse.d.ts
declare module "pdf-parse" {
  const pdfParse: (data: Buffer) => Promise<{ text: string }>;
  export default pdfParse;
}
