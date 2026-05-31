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

    const embassyDetails = await prisma.embassyDetail.findFirst({
      where: { country, visaType }
    });

    return NextResponse.json(embassyDetails || null);
  } catch (error) {
    console.error('Failed to fetch embassy details:', error);
    return NextResponse.json({ error: 'Failed to fetch embassy details' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { country, visaType, name, address, phone, email, website, workingHours } = await req.json();

    if (!country || !visaType || !name) {
      return NextResponse.json({ error: 'Country, visaType, and name are required' }, { status: 400 });
    }

    const existing = await prisma.embassyDetail.findFirst({
      where: { country, visaType }
    });

    if (existing) {
      const updated = await prisma.embassyDetail.update({
        where: { id: existing.id },
        data: { name, address, phone, email, website, workingHours }
      });
      return NextResponse.json(updated);
    } else {
      const newEmbassy = await prisma.embassyDetail.create({
        data: { country, visaType, name, address, phone, email, website, workingHours }
      });
      return NextResponse.json(newEmbassy, { status: 201 });
    }
  } catch (error) {
    console.error('Failed to save embassy details:', error);
    return NextResponse.json({ error: 'Failed to save embassy details' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.embassyDetail.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete embassy details:', error);
    return NextResponse.json({ error: 'Failed to delete embassy details' }, { status: 500 });
  }
}
