import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const ExtractedCandidateSchema = z.object({
  firstName: z.string().describe('First name of the candidate'),
  lastName: z.string().describe('Last name of the candidate'),
  email: z.string().optional().describe('Email address'),
  phone: z.string().optional().describe('Phone number'),
  currentRole: z.string().optional().describe('Most recent role/designation'),
  yearsOfExperience: z.number().optional().describe('Total years of experience as a number'),
  skills: z.array(z.string()).optional().describe('Array of key skills/technologies'),
  educationSummary: z.string().optional().describe('Short summary of education'),
  summary: z.string().optional().describe('One- or two-sentence summary of the candidate'),
});

export type ExtractedCandidate = z.infer<typeof ExtractedCandidateSchema>;

export async function extractCandidateFromCV(cvText: string): Promise<ExtractedCandidate> {
  const cleanedText = cvText.replace(/\s+/g, ' ').trim().slice(0, 20_000); // limit input size

  const systemPrompt = `You are a compact, cost-conscious resume parser. Return only a single JSON object and nothing else.`;

  const userPrompt = `Extract these fields from the CV text below and return ONLY a JSON object with keys: firstName, lastName, email, phone, currentRole, yearsOfExperience (number or null), skills (array, 3-10 strings), educationSummary, summary (1-2 sentence concise summary). Put candidate name in firstName and lastName, normalize the phone and email values, return skills as an array of keywords, and return educationSummary as a short phrase describing the degree or certification. If a field is not found, return empty string or null for numbers and empty array for skills. CV_TEXT: ${cleanedText}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.0,
      max_tokens: 250,
    });

    const content = response.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleaned);
    const validated = ExtractedCandidateSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw new Error('Failed to extract candidate information from CV');
  }
}
