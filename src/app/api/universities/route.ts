import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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
    const universities = await db.university.findMany({
      include: {
        partner: true,
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    // Transform to have the course count directly as "courses" for the frontend
    const transformed = universities.map(u => ({
      ...u,
      courses: u._count.courses,
      students: 0, // Placeholder as we don't track students yet
      type: u.type || 'Public',
      addedDate: u.createdAt,
      accredited: u.accreditation !== null,
      color: `hsl(${u.name.length * 137 % 360}, 70%, 50%)`,
      initials: u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2),
      requirements: u.requirements ? (u.requirements.startsWith('[') ? JSON.parse(u.requirements) : [u.requirements]) : [],
      accreditation: u.accreditation ? (u.accreditation.startsWith('[') ? JSON.parse(u.accreditation) : [u.accreditation]) : [],
    }));
    return NextResponse.json(transformed);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const newUniversity = await db.university.create({
      data: {
        name: data.name || data.title,
        shortName: data.shortName || null,
        country: data.country || '',
        city: data.city || '',
        type: data.type || 'Public',
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        website: data.websiteUrl || data.website || null,
        founded: data.establishedYear ? parseInt(data.establishedYear) : (data.foundedYear ? parseInt(data.foundedYear) : null),
        accreditation: data.accreditationBody ? (typeof data.accreditationBody === 'string' ? data.accreditationBody : JSON.stringify(data.accreditationBody)) : (data.accreditation ? (typeof data.accreditation === 'string' ? data.accreditation : JSON.stringify(data.accreditation)) : null),
        ranking: data.ranking ? parseInt(data.ranking.toString()) : null,
        logo: data.logo || null,
        banner: data.banner || null,
        images: data.images || (data.imagesList ? JSON.stringify(data.imagesList) : null),
        requirements: data.requirements ? (typeof data.requirements === 'string' ? data.requirements : JSON.stringify(data.requirements)) : null,
        partnerId: data.partnerId || null,
        partnershipAmount: data.partnershipAmount ? parseFloat(data.partnershipAmount.toString()) : null,
        commissionType: data.commissionType || 'Percentage',
        commissionValue: data.commissionValue ? parseFloat(data.commissionValue.toString()) : null,
        commissionCurrency: data.commissionCurrency || null,
        description: data.description || null,
        status: data.status || 'Active',
      },
    });

    if (session) {
      const user = await db.user.findUnique({ where: { id: session.id as string } });
      await logActivity({
        actorName: user?.name || 'System',
        action: 'created a new university',
        target: newUniversity.name,
      });
    }

    return NextResponse.json(newUniversity, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create university' }, { status: 400 });
  }
}
