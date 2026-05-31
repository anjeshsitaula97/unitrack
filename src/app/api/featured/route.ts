import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const prisma = db;

export async function GET() {
  try {
    const featuredUniversities = await prisma.university.findMany({
      where: { isFeatured: true },
      include: { courses: true },
    });

    const featuredCourses = await prisma.course.findMany({
      where: { isFeatured: true },
      include: { university: true },
    });

    return NextResponse.json({
      universities: featuredUniversities,
      courses: featuredCourses,
    });
  } catch (error) {
    console.error('Failed to fetch featured content:', error);
    return NextResponse.json({ error: 'Failed to fetch featured content' }, { status: 500 });
  }
}
