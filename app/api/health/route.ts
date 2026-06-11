import { NextResponse } from 'next/server';
import clientPromise from '@/src/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    // Ping the admin database to check connection
    const result = await client.db().admin().ping();
    return NextResponse.json({ ok: true, mongo: result }, { status: 200 });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
