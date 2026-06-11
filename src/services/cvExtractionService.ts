import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ExtractedCandidateSchema = z.object({
  firstName: z.string().describe('First name of the candidate'),
  lastName: z.string().describe('Last name of the candidate'),
  email: z.string().optional().describe('Email address'),
  phone: z.string().optional().describe('Phone number'),
  currentRole: z.string().optional().describe('Most recent role/designation'),
  yearsOfExperience: z.union([z.number(), z.string()]).optional().nullable().describe('Total years of experience as a number'),
  skills: z.union([z.array(z.string()), z.string()]).optional().describe('Array of key skills/technologies'),
  educationSummary: z.string().optional().describe('Short summary of education'),
  summary: z.string().optional().describe('One- or two-sentence summary of the candidate'),
});

export type ExtractedCandidate = z.infer<typeof ExtractedCandidateSchema>;

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_DIGITS_REGEX = /(?:\+?\d{1,3}[\s-.()]*)?(?:\d[\s-.()]*){9,15}/g;
const NAME_LABEL_REGEX = /(?:^|\n)\s*(?:name|candidate name|applicant name)\s*[:\-]\s*([A-Za-z][A-Za-z ,.'-]{1,})/i;
const CURRENT_ROLE_REGEX = /(?:current role|designation|position|title)\s*[:\-]\s*([A-Za-z0-9 .,&\/()-]{3,100})/i;
const EDUCATION_SECTION_REGEX = /education\s*[:\n]+([\s\S]*?)(?:\n\s*\n|experience\s*[:\n]|skills\s*[:\n]|$)/i;
const SKILLS_SECTION_REGEX = /skills\s*[:\n]+([\s\S]*?)(?:\n\s*\n|experience\s*[:\n]|education\s*[:\n]|$)/i;

function cleanAIResponse(text: string): string {
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

function findJsonObject(text: string): string {
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object found');

  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      return text.slice(start, i + 1);
    }
  }

  throw new Error('Incomplete JSON object');
}

function parseJsonCandidate(content: string) {
  const cleaned = cleanAIResponse(content);
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonText = findJsonObject(cleaned);
    return JSON.parse(jsonText);
  }
}

function normalizeYearsOfExperience(value: unknown, text: string): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(numeric)) return numeric;
  }

  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|y)\b/i);
  if (match) {
    const numeric = parseFloat(match[1]);
    if (!Number.isNaN(numeric)) return numeric;
  }

  return undefined;
}

function normalizeSkills(value: unknown, text: string): string[] {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim()).slice(0, 10);
  }

  if (typeof value === 'string') {
    const items = value
      .split(/[,;|\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (items.length > 0) return items.slice(0, 10);
  }

  const skillsSection = text.match(SKILLS_SECTION_REGEX)?.[1];
  if (skillsSection) {
    const items = skillsSection
      .split(/[,;|\n]/)
      .map((item) => item.replace(/^[\-\u2022\*\s]+/, '').trim())
      .filter(Boolean);
    return items.slice(0, 10);
  }

  return [];
}

function normalizeEmail(value: unknown, text: string): string {
  if (typeof value === 'string' && EMAIL_REGEX.test(value.trim())) {
    return value.trim();
  }

  return extractEmailFromText(text);
}

function normalizePhoneDigits(digits: string): string {
  const cleaned = digits.replace(/^0+/, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 11 && cleaned.startsWith('1')) return cleaned.slice(1);
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  if (cleaned.length > 10) return cleaned.slice(-10);
  return '';
}

function normalizePhone(value: unknown, text: string): string {
  const candidate = typeof value === 'string' ? value.replace(/\D/g, '') : '';
  const normalized = normalizePhoneDigits(candidate);
  if (normalized) return normalized;

  return extractPhoneFromText(text);
}

function extractEmailFromText(text: string): string {
  const match = text.match(EMAIL_REGEX);
  return match?.[0]?.trim() ?? '';
}

function extractPhoneFromText(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  for (const line of lines) {
    if (/\b(phone|mobile|contact|call)\b/i.test(line)) {
      const digits = line.replace(/\D/g, '');
      const normalized = normalizePhoneDigits(digits);
      if (normalized) return normalized;
    }
  }

  const matches = [...text.matchAll(PHONE_DIGITS_REGEX)].map((match) => match[0]);
  for (const raw of matches) {
    const digits = raw.replace(/\D/g, '');
    const normalized = normalizePhoneDigits(digits);
    if (normalized) return normalized;
  }

  return '';
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? 'Candidate',
    lastName: parts.slice(1).join(' ') || 'Unknown',
  };
}

function extractNameFromText(text: string) {
  const normalized = text.replace(/\r/g, '\n');
  const labelMatch = normalized.match(NAME_LABEL_REGEX);
  if (labelMatch?.[1]) {
    return splitName(labelMatch[1].replace(/\s{2,}/g, ' ').trim());
  }

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);

  for (const line of lines) {
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5 && words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w))) {
      return splitName(line);
    }
  }

  return { firstName: 'Candidate', lastName: 'Unknown' };
}

function extractCurrentRoleFromText(text: string): string {
  const labelMatch = text.match(CURRENT_ROLE_REGEX);
  if (labelMatch?.[1]) return labelMatch[1].trim();

  const lines = text.split(/\r?\n/).map((line) => line.trim());
  for (const line of lines) {
    if (/\b(experience|worked as|currently working as|role|position)\b/i.test(line) && line.length < 120) {
      return line.replace(/^(experience|worked as|currently working as)[\s:,-]*/i, '').trim();
    }
  }

  return '';
}

function extractEducationSummaryFromText(text: string): string {
  const match = text.match(EDUCATION_SECTION_REGEX)?.[1];
  if (!match) return '';
  const lines = match
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\-\u2022\*\s]+/, '').trim())
    .filter(Boolean);
  return lines.slice(0, 2).join(' ').trim();
}

async function extractFromAI(cvText: string): Promise<ExtractedCandidate> {
  const cleanedText = cvText.replace(/\s+/g, ' ').trim().slice(0, 20_000);

  const systemPrompt = `You are a structured resume parser. Output must be valid JSON only, with keys: firstName, lastName, email, phone, currentRole, yearsOfExperience, skills, educationSummary, summary. Use empty string for missing text fields, null for missing numbers, and [] for missing skills. Do not wrap the response in markdown.`;

  const userPrompt = `Parse the resume text below and return a JSON object only. Do not add any explanation.

Resume text:
${cleanedText}

Rules:
- firstName and lastName should be the candidate's full name.
- email must include '@' and a proper domain.
- phone must be exactly 10 digits with no separators.
- yearsOfExperience must be a number or null.
- skills must be an array of short strings.
- educationSummary should be a concise one-sentence summary.
- summary should be a single concise sentence.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0,
    max_tokens: 300,
  });

  const content = response.choices?.[0]?.message?.content?.trim() || '';
  const parsed = parseJsonCandidate(content);
  return ExtractedCandidateSchema.parse(parsed);
}

export async function extractCandidateFromCV(cvText: string): Promise<ExtractedCandidate> {
  const rawText = cvText.trim();
  let candidate: ExtractedCandidate = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentRole: '',
    yearsOfExperience: undefined,
    skills: [],
    educationSummary: '',
    summary: '',
  };

  try {
    const aiCandidate = await extractFromAI(rawText);
    candidate = {
      ...candidate,
      ...aiCandidate,
      skills: normalizeSkills(aiCandidate.skills, rawText),
      yearsOfExperience: normalizeYearsOfExperience(aiCandidate.yearsOfExperience, rawText),
    };
  } catch (error) {
    console.warn('AI extraction failed or invalid JSON output:', error);
  }

  candidate.email = normalizeEmail(candidate.email, rawText);
  candidate.phone = normalizePhone(candidate.phone, rawText);

  if (!candidate.currentRole) {
    candidate.currentRole = extractCurrentRoleFromText(rawText);
  }

  if (!candidate.educationSummary) {
    candidate.educationSummary = extractEducationSummaryFromText(rawText);
  }

  if (!candidate.firstName || !candidate.lastName || candidate.firstName === 'Candidate') {
    const fallbackName = extractNameFromText(rawText);
    if (!candidate.firstName) candidate.firstName = fallbackName.firstName;
    if (!candidate.lastName) candidate.lastName = fallbackName.lastName;
  }

  candidate.skills = normalizeSkills(candidate.skills, rawText);
  candidate.educationSummary = candidate.educationSummary ?? '';
  candidate.summary = candidate.summary ?? '';
  candidate.yearsOfExperience = candidate.yearsOfExperience ?? undefined;

  return candidate;
}
