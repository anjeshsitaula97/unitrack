import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const intakes = await db.intake.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(intakes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch intakes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    
    const newIntake = await db.intake.create({
      data: { name: data.name },
    });
    return NextResponse.json(newIntake, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create intake' }, { status: 400 });
  }
}
