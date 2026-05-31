import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const university = await db.university.findUnique({
      where: { id },
      include: {
        partner: true,
        courses: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    // Transform university data
    const transformed = {
      ...university,
      addedDate: university.createdAt,
      accredited: university.accreditation !== null,
      accreditation: university.accreditation ? (university.accreditation.startsWith('[') ? JSON.parse(university.accreditation) : [university.accreditation]) : [],
      color: `hsl(${university.name.length * 137 % 360}, 70%, 50%)`,
      initials: university.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      requirements: university.requirements ? (university.requirements.startsWith('[') ? JSON.parse(university.requirements) : [university.requirements]) : [],
      images: university.images ? (university.images.startsWith('[') ? JSON.parse(university.images) : [university.images]) : [],
    };

    // Group courses by faculty
    const groupedCourses: Record<string, any[]> = {};
    transformed.courses.forEach(course => {
      const faculty = course.faculty || 'General';
      if (!groupedCourses[faculty]) {
        groupedCourses[faculty] = [];
      }
      groupedCourses[faculty].push(course);
    });

    return NextResponse.json({
      ...transformed,
      groupedCourses,
    });
  } catch (error) {
    console.error('Error fetching university:', error);
    return NextResponse.json({ error: 'Failed to fetch university details' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    await db.university.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'University deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete university' }, { status: 500 });
  }
}

const parseSafeInt = (val: any) => {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseInt(val.toString());
  return isNaN(parsed) ? null : parsed;
};

const parseSafeFloat = (val: any) => {
  if (val === undefined || val === null || val === '') return null;
  const parsed = parseFloat(val.toString());
  return isNaN(parsed) ? null : parsed;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const updated = await db.university.update({
      where: { id },
      data: {
        name: data.name,
        shortName: data.shortName || null,
        country: data.country,
        city: data.city || '',
        website: data.websiteUrl || data.website || null,
        founded: parseSafeInt(data.establishedYear || data.foundedYear),
        accreditation: data.accreditationBody ? (typeof data.accreditationBody === 'string' ? data.accreditationBody : JSON.stringify(data.accreditationBody)) : (data.accreditation ? (typeof data.accreditation === 'string' ? data.accreditation : JSON.stringify(data.accreditation)) : null),
        ranking: parseSafeInt(data.ranking),
        logo: data.logo || null,
        banner: data.banner || null,
        images: data.images || (data.imagesList ? JSON.stringify(data.imagesList) : null),
        requirements: data.requirements ? (typeof data.requirements === 'string' ? data.requirements : JSON.stringify(data.requirements)) : null,
        partnerId: data.partnerId || null,
        partnershipAmount: parseSafeFloat(data.partnershipAmount),
        commissionType: data.commissionType || 'Percentage',
        commissionValue: parseSafeFloat(data.commissionValue),
        commissionCurrency: data.commissionCurrency || null,
        status: data.status || 'Active',
        type: data.type || 'Public',
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        description: data.description || null,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Failed to update university' }, { status: 500 });
  }
}
