// PDF and DOCX parsing utilities
function normalizePdfReaderRows(rows: Array<{ y: number; items: Array<{ x: number; text: string }> }>) {
  return rows
    .sort((a, b) => a.y - b.y)
    .map((row) =>
      row
        .items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n')
    .trim();
}

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : String(err);
}

export async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  const dataBuffer = Buffer.from(buffer);

  // Strategy 1: try pdf-parse with normalized text output.
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule && (pdfParseModule.default || pdfParseModule)) as any;

    const result = await pdfParse(dataBuffer, {
      pagerender: (pageData: any) =>
        pageData
          .getTextContent({ normalizeWhitespace: true })
          .then((textContent: any) =>
            (textContent.items || [])
              .map((item: any) => item.str || '')
              .join(' ')
          ),
    });

    const text = (result?.text || '')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{2,}/g, '\n')
      .trim();

    if (text.length > 0) return text;
  } catch (err) {
    console.warn('pdf-parse failed, falling back to pdfreader:', getErrorMessage(err));
  }

  // Strategy 2: fallback to pdfreader (pure-JS text extraction).
  try {
    const { PdfReader } = await import('pdfreader');
    return await new Promise<string>((resolve, reject) => {
      const rows: Array<{ y: number; items: Array<{ x: number; text: string }> }> = [];

      new PdfReader().parseBuffer(dataBuffer, (err: any, item: any) => {
        if (err) return reject(err);
        if (!item) {
          return resolve(normalizePdfReaderRows(rows));
        }
        if (item.text) {
          const y = Math.round((item.y || 0) * 10) / 10;
          const x = Math.round((item.x || 0) * 10) / 10;
          let row = rows.find((r) => Math.abs(r.y - y) < 1);
          if (!row) {
            row = { y, items: [] };
            rows.push(row);
          }
          row.items.push({ x, text: String(item.text) });
        }
      });
    });
  } catch (err) {
    console.warn('pdfreader fallback failed:', getErrorMessage(err));
  }

  return '';
}

export async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  try {
    // For DOCX, unzip and extract word/document.xml then strip tags
    const text = await parseDocxBuffer(buffer);
    return text;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

async function parseDocxBuffer(buffer: ArrayBuffer): Promise<string> {
  // Use JSZip to read docx (ZIP) and extract word/document.xml
  // Dynamically import to avoid client-side bundling
  const jszipModule = await import('jszip');
  const JSZip = jszipModule && (jszipModule.default || jszipModule);
  const zip = await JSZip.loadAsync(Buffer.from(buffer));
  const docFile = zip.file('word/document.xml');
  if (!docFile) return '';
  const xml = await docFile.async('string');
  // Extract text nodes within <w:t> elements
  const matches = xml.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
  if (!matches) return '';
  return matches.map((m: string) => m.replace(/<[^>]+>/g, '')).join(' ').replace(/\s+/g, ' ').trim();
}
