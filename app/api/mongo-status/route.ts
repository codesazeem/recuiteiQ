import { NextResponse } from 'next/server';
import clientPromise from '@/src/lib/mongodb';

console.log('Mongo status route module loaded');

export async function GET() {
  console.log('Mongo status route requested');

  try {
    const client = await clientPromise;
    const pingResult = await client.db().command({ ping: 1 });
    console.log('Mongo status route connected:', pingResult);
    return NextResponse.json({ connected: true, pingResult });
  } catch (error: any) {
    console.error('Mongo status route error:', error);
    return NextResponse.json(
      { connected: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
