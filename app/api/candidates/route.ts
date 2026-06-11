import { NextRequest, NextResponse } from 'next/server';
import * as candidateController from '@/src/controllers/candidateController';

export async function GET() {
  try {
    const candidates = await candidateController.GET();
    return candidates;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const response = await candidateController.POST(request);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
