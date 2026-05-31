import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const degreeTypes = await db.degreeType.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(degreeTypes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch degree types' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    
    const newDegreeType = await db.degreeType.create({
      data: { name: data.name },
    });
    return NextResponse.json(newDegreeType, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create degree type' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, name } = data;
    if (!id || !name) return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });

    const updated = await db.degreeType.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update degree type' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.degreeType.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete degree type' }, { status: 500 });
  }
}
