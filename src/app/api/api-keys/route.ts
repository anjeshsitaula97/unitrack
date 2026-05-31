import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const keys = await db.apiKey.findMany({
      orderBy: { created: 'desc' },
    });
    return NextResponse.json(keys);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Simulate token generation logic
    const mockHash = 'pk_live_' + crypto.randomBytes(12).toString('hex');
    
    const newKey = await db.apiKey.create({
      data: {
        name: data.name || 'Generated Key',
        tokenHash: mockHash,
      },
    });
    return NextResponse.json(newKey, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create API Key' }, { status: 400 });
  }
}
