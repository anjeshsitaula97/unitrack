import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const visaType = searchParams.get('visaType');

    if (!country || !visaType) {
      return NextResponse.json({ error: 'Country and visaType are required' }, { status: 400 });
    }

    const checklists = await prisma.visaChecklist.findMany({
      where: { country, visaType },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error('Failed to fetch visa checklists:', error);
    return NextResponse.json({ error: 'Failed to fetch visa checklists' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { country, visaType, title, description, isRequired } = await req.json();

    if (!country || !visaType || !title) {
      return NextResponse.json({ error: 'Country, visaType, and title are required' }, { status: 400 });
    }

    const newChecklist = await prisma.visaChecklist.create({
      data: {
        country,
        visaType,
        title,
        description,
        isRequired: isRequired !== undefined ? isRequired : true
      }
    });

    return NextResponse.json(newChecklist, { status: 201 });
  } catch (error) {
    console.error('Failed to create visa checklist:', error);
    return NextResponse.json({ error: 'Failed to create visa checklist' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.visaChecklist.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete visa checklist:', error);
    return NextResponse.json({ error: 'Failed to delete visa checklist' }, { status: 500 });
  }
}
