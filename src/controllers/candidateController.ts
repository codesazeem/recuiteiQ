import * as candidateService from '@/src/services/candidateService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const candidates = await candidateService.listCandidates();
  return NextResponse.json(candidates);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const candidate = await candidateService.addCandidate({
    ...body,
    status: body.status ?? 'lead',
    tags: body.tags ?? [],
  });
  return NextResponse.json(candidate, { status: 201 });
}
