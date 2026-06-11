import fs from 'fs';

const pdfParseModule = await import('pdf-parse');
console.log('pdf-parse module keys:', Object.keys(pdfParseModule));
const PDFParse = pdfParseModule.PDFParse || (pdfParseModule.default && pdfParseModule.default.PDFParse);
if (!PDFParse) {
  console.error('PDFParse not found in module');
  process.exit(1);
}

const path = './uploaded-resume/sample-resume.pdf';

(async () => {
  try {
    const buffer = fs.readFileSync(path);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    console.log('--- Extracted text (first 1000 chars) ---');
    console.log(result.text.substring(0, 1000));
  } catch (err) {
    console.error('Extraction error:', err);
    process.exit(1);
  }
})();
