import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

export async function GET() {
  try {
    const visaTypes = await prisma.visaType.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(visaTypes);
  } catch (error) {
    console.error('Failed to fetch visa types:', error);
    return NextResponse.json({ error: 'Failed to fetch visa types' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { label, description } = await req.json();
    
    if (!label) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 });
    }

    const existing = await prisma.visaType.findUnique({
      where: { label }
    });

    if (existing) {
      return NextResponse.json({ error: 'Visa Type already exists' }, { status: 400 });
    }

    const newVisaType = await prisma.visaType.create({
      data: {
        label,
        description
      }
    });

    return NextResponse.json(newVisaType, { status: 201 });
  } catch (error) {
    console.error('Failed to create visa type:', error);
    return NextResponse.json({ error: 'Failed to create visa type' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.visaType.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete visa type:', error);
    return NextResponse.json({ error: 'Failed to delete visa type' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, label, description } = await req.json();

    if (!id || !label) {
      return NextResponse.json({ error: 'ID and Label are required' }, { status: 400 });
    }

    const updatedVisaType = await prisma.visaType.update({
      where: { id },
      data: {
        label,
        description
      }
    });

    return NextResponse.json(updatedVisaType);
  } catch (error) {
    console.error('Failed to update visa type:', error);
    return NextResponse.json({ error: 'Failed to update visa type' }, { status: 500 });
  }
}
