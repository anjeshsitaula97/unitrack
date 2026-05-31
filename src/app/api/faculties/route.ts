import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const faculties = await db.faculty.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(faculties);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch faculties' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!data.name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    
    const newFaculty = await db.faculty.create({
      data: { name: data.name },
    });
    return NextResponse.json(newFaculty, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create faculty' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, name } = data;
    if (!id || !name) return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });

    const updated = await db.faculty.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update faculty' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.faculty.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete faculty' }, { status: 500 });
  }
}
