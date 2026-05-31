import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const qualifications = await db.qualification.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(qualifications);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch qualifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const qualification = await db.qualification.create({
      data: { name }
    });
    return NextResponse.json(qualification);
  } catch (error) {
    console.error(error);
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Qualification already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create qualification' }, { status: 500 });
  }
}
