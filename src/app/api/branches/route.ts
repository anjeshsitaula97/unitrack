import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const branches = await db.branch.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(branches);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.name) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });
    }

    const branch = await db.branch.create({
      data: {
        name: data.name,
        location: data.location,
        manager: data.manager,
        phone: data.phone,
        email: data.email,
        status: data.status || 'Active',
        latitude: data.latitude != null ? parseFloat(data.latitude) : null,
        longitude: data.longitude != null ? parseFloat(data.longitude) : null,
      }
    });
    
    return NextResponse.json(branch);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}
