import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    // Courses search
    const courses = await db.course.findMany({
      where: query ? {
        OR: [
          { name: { contains: query } },
          { university: { name: { contains: query } } },
          { faculty: { contains: query } },
          { instructor: { contains: query } },
          { description: { contains: query } },
        ],
      } : {},
      include: {
        university: true,
      },
      take: 20,
    });

    // Universities search
    const universities = await db.university.findMany({
      where: query ? {
        OR: [
          { name: { contains: query } },
          { country: { contains: query } },
          { city: { contains: query } },
        ],
      } : {},
      take: 10,
    });

    const transformedCourses = courses.map(c => ({
      id: c.id,
      name: c.name,
      university: c.university.name,
      category: c.faculty,
      level: c.level,
      credits: c.credits,
      duration: c.duration,
      enrolled: c.enrolled,
      status: c.status,
      startDate: c.startDate ? c.startDate.toISOString() : null,
      color: c.color,
      initials: c.initials,
      instructor: c.instructor,
      description: c.description,
      prerequisites: JSON.parse(c.prerequisites || '[]'),
      quickFilters: JSON.parse(c.quickFilters || '[]'),
      intake: c.intake,
      tuitionFee: c.tuitionFee,
      applicationFee: c.applicationFee,
      currency: c.currency,
      country: c.university.country,
      requirements: JSON.parse(c.requirements || '[]'),
      applicationDeadline: c.applicationDeadline ? c.applicationDeadline.toISOString() : null,
      capacity: 5000,
    }));

    const transformedUniversities = universities.map(u => ({
      id: u.id,
      name: u.name,
      country: u.country,
      city: u.city,
      website: u.website,
      logo: u.logo,
      requirements: JSON.parse(u.requirements || '[]'),
      initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      color: `hsl(${u.name.length * 137 % 360}, 70%, 50%)`,
    }));

    return NextResponse.json({ 
      courses: transformedCourses,
      universities: transformedUniversities 
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
