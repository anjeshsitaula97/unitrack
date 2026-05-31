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

    const stages = await prisma.workflowStage.findMany({
      where: { country, visaType },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Failed to fetch workflow stages:', error);
    return NextResponse.json({ error: 'Failed to fetch workflow stages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { country, visaType, name, order, description } = await req.json();

    if (!country || !visaType || !name) {
      return NextResponse.json({ error: 'Country, visaType, and name are required' }, { status: 400 });
    }

    const newStage = await prisma.workflowStage.create({
      data: {
        country,
        visaType,
        name,
        order: order || 0,
        description
      }
    });

    return NextResponse.json(newStage, { status: 201 });
  } catch (error) {
    console.error('Failed to create workflow stage:', error);
    return NextResponse.json({ error: 'Failed to create workflow stage' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.workflowStage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workflow stage:', error);
    return NextResponse.json({ error: 'Failed to delete workflow stage' }, { status: 500 });
  }
}
