import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const universities = await db.university.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const transformed = universities.map(u => ({
      id: u.id,
      name: u.name,
      status: u.status || 'Active',
      country: u.country,
      website: u.websiteUrl,
      addedDate: u.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      // Mocking some fields for UI consistency
      completion: Math.floor(Math.random() * 60) + 40, // 40-100
      assignees: ['#6366f1', '#8b5cf6', '#ec4899'].slice(0, Math.floor(Math.random() * 3) + 1),
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Recent Universities Error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent universities' }, { status: 500 });
  }
}
