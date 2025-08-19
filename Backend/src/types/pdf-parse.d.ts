declare module "pdf-parse" {
  interface PDFParseOptions {
    max?: number;
  }

  interface PDFParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: Record<string, any>;
    version: string;
  }

  function pdfParse(
    buffer: Buffer,
    options?: PDFParseOptions
  ): Promise<PDFParseResult>;

  export default pdfParse;
}