import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const course = await db.course.findUnique({
      where: { id },
      include: { university: true }
    });
    
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const course = await db.course.update({
      where: { id },
      data: {
        name: data.name,
        universityId: data.universityId,
        faculty: data.faculty,
        degreeType: data.degreeType,
        level: data.level,
        credits: parseInt(data.credits) || 0,
        duration: data.duration,
        startDate: data.startDate && !isNaN(new Date(data.startDate).getTime()) 
          ? new Date(data.startDate) 
          : null,
        color: data.color,
        initials: data.initials || data.name?.substring(0, 2).toUpperCase(),
        instructor: data.instructor,
        description: data.description,
        prerequisites: Array.isArray(data.prerequisites) ? JSON.stringify(data.prerequisites) : data.prerequisites,
        intake: data.intake,
        language: data.language,
        mode: data.mode,
        academicRequirement: data.academicRequirement,
        percentageRequired: data.percentageRequired,
        gpaRequired: data.gpaRequired,
        englishLanguageType: data.englishLanguageType,
        englishOverallScore: data.englishOverallScore,
        englishReadingScore: data.englishReadingScore,
        englishWritingScore: data.englishWritingScore,
        englishListeningScore: data.englishListeningScore,
        englishSpeakingScore: data.englishSpeakingScore,
        tuitionFee: data.tuitionFee,
        applicationFee: data.applicationFee,
        applicationFeeCurrency: data.applicationFeeCurrency,
        currency: data.currency,
        quickFilters: Array.isArray(data.quickFilters) ? JSON.stringify(data.quickFilters) : data.quickFilters,
        requirements: Array.isArray(data.requirements) ? JSON.stringify(data.requirements) : data.requirements,
        applicationDeadline: data.applicationDeadline && !isNaN(new Date(data.applicationDeadline).getTime()) 
          ? new Date(data.applicationDeadline) 
          : null,
        status: data.status,
        courseCode: data.courseCode,
        englishTests: typeof data.englishTests === 'string' ? data.englishTests : JSON.stringify(data.englishTests || []),
      }
    });
    return NextResponse.json(course);
  } catch (error) {
    console.error('Course Update Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update course', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await db.course.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
