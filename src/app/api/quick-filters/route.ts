import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const filters = await db.quickFilter.findMany({
      orderBy: { label: 'asc' },
    });
    return NextResponse.json(filters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch filters' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { label, icon } = await req.json();
    if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 });

    const filter = await db.quickFilter.create({
      data: { label, icon: icon || 'Filter' },
    });
    return NextResponse.json(filter, { status: 201 });
  } catch (error) {
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Filter already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create filter' }, { status: 500 });
  }
}
