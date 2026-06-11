import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, extractTextFromDocx } from '@/src/lib/fileParser';
import { extractCandidateFromCV } from '@/src/services/cvExtractionService';
import * as candidateService from '@/src/services/candidateService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseStudentNameFromText(text: string) {
  const normalized = text.replace(/\r/g, '');
  const nameMatch = normalized.match(/(?:^|\n)\s*name\s*[:\-]\s*([A-Za-z ,.'-]+)/i);
  const sourceName = nameMatch?.[1]?.trim() || normalized.split('\n').find((line) => line.trim().length > 0)?.trim() || '';

  const nameParts = sourceName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Student';
  const lastName = nameParts.slice(1).join(' ') || 'Unknown';

  return { firstName, lastName };
}

function buildFallbackCandidate(extractedText: string) {
  const { firstName, lastName } = parseStudentNameFromText(extractedText);
  return {
    firstName,
    lastName,
    email: '',
    phone: '',
    currentRole: '',
    yearsOfExperience: undefined,
    skills: [],
    educationSummary: '',
    summary: '',
  };
}

async function getCandidateData(extractedText: string) {
  if (process.env.OPENAI_API_KEY) {
    try {
      return await extractCandidateFromCV(extractedText);
    } catch (error) {
      console.warn('OpenAI extraction failed, falling back to text-only parsing:', error);
    }
  }

  return buildFallbackCandidate(extractedText);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;

    console.log('CV upload request received.');

    if (!file) {
      console.log('CV upload failed: no file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('CV upload file info:', { type: file.type, size: file.size });

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF or DOCX.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Convert file to buffer and parse in memory only; the file is not stored anywhere.
    const buffer = await file.arrayBuffer();

    let extractedText = '';
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(buffer);
    } else {
      extractedText = await extractTextFromDocx(buffer);
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from file. Please ensure the CV is readable.' },
        { status: 400 }
      );
    }

    const candidateData = await getCandidateData(extractedText);

    const savedCandidate = await candidateService.addCandidate({
      firstName: candidateData.firstName,
      lastName: candidateData.lastName,
      email: candidateData.email || undefined,
      phone: candidateData.phone || undefined,
      currentRole: candidateData.currentRole || undefined,
      yearsOfExperience: candidateData.yearsOfExperience ?? undefined,
      educationSummary: candidateData.educationSummary || undefined,
      status: 'lead',
      source: 'resume-upload',
      tags: candidateData.skills ?? [],
      summary: candidateData.summary || extractedText.substring(0, 300),
    });

    return NextResponse.json({ success: true, candidate: savedCandidate }, { status: 200 });
  } catch (error: any) {
    console.error('CV upload error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to process CV' },
      { status: 500 }
    );
  }
}
