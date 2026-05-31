import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { safeParseArray } from '@/lib/json';
import { logActivity } from '@/lib/activity';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch (err) {
    return null;
  }
}

export async function GET() {
  try {
    const courses = await db.course.findMany({
      orderBy: { name: 'asc' },
      include: { university: true },
    });
    // Transform to flat structure for the frontend if needed
    const transformed = courses.map((course: any) => ({
      ...course,
      university: course.university?.name || 'Unknown',
      universityLogo: course.university?.logo || null,
      faculty: course.faculty || 'General',
      degreeType: course.degreeType || 'None',
      // Convert JSON strings to arrays
      prerequisites: safeParseArray(course.prerequisites),
      quickFilters: safeParseArray(course.quickFilters),
      requirements: safeParseArray(course.requirements),
      applicationDeadline: course.applicationDeadline,
    }));
    return NextResponse.json(transformed);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const newCourse = await db.course.create({
      // ... existing data ...
      data: {
        name: data.name || data.title,
        universityId: data.universityId,
        faculty: data.faculty || 'General',
        degreeType: data.degreeType || 'None',
        level: data.studyLevel || 'Undergraduate',
        credits: parseInt(data.credits) || 0,
        duration: data.duration || '0',
        startDate: data.startDate && !isNaN(new Date(data.startDate).getTime()) 
          ? new Date(data.startDate) 
          : null,
        color: data.color || '#6366f1',
        initials: data.initials || data.name?.substring(0, 2).toUpperCase() || 'CX',
        instructor: data.instructor || 'TBA',
        description: data.description || '',
        prerequisites: JSON.stringify(data.prerequisites || []),
        intake: data.intake || '',
        language: data.language || 'English',
        mode: data.mode || 'Online',
        academicRequirement: data.academicRequirement || '',
        percentageRequired: data.percentageRequired || '',
        gpaRequired: data.gpaRequired || '',
        englishLanguageType: data.englishLanguageType || 'IELTS',
        englishOverallScore: data.englishOverallScore || '',
        englishReadingScore: data.englishReadingScore || '',
        englishWritingScore: data.englishWritingScore || '',
        englishListeningScore: data.englishListeningScore || '',
        englishSpeakingScore: data.englishSpeakingScore || '',
        tuitionFee: data.tuitionFee || '',
        applicationFee: data.applicationFee || '',
        applicationFeeCurrency: data.applicationFeeCurrency || '',
        currency: data.currency || '',
        quickFilters: JSON.stringify(data.quickFilters || []),
        requirements: JSON.stringify(data.requirements || []),
        applicationDeadline: data.applicationDeadline && !isNaN(new Date(data.applicationDeadline).getTime()) 
          ? new Date(data.applicationDeadline) 
          : null,
        courseCode: data.courseCode || null,
        englishTests: typeof data.englishTests === 'string' ? data.englishTests : JSON.stringify(data.englishTests || []),
      },
    });

    if (session) {
      const user = await db.user.findUnique({ where: { id: session.id as string } });
      await logActivity({
        actorName: user?.name || 'System',
        action: 'created a new course',
        target: newCourse.name,
      });
    }

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Course Creation Error:', error);
    return NextResponse.json({ 
      error: 'Failed to create course', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 400 });
  }
}
