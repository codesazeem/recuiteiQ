import fs from 'fs';
import path from 'path';
import url from 'url';

const filePath = path.resolve('uploaded-resume/sample-resume.pdf');
const pdfParseModule = await import('pdf-parse');
const PDFParse = pdfParseModule.PDFParse || (pdfParseModule.default && pdfParseModule.default.PDFParse);
console.log('PDFParse loaded:', !!PDFParse);
const data = fs.readFileSync(filePath);
const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
console.log('buffer length', data.length, 'arrayBuffer length', ab.byteLength);
try {
  const parser = new PDFParse({ data: Buffer.from(ab) });
  const result = await parser.getText();
  console.log('result length', result.text.length);
  console.log(result.text.slice(0,200));
} catch (err) {
  console.error('parser error:', err);
}
