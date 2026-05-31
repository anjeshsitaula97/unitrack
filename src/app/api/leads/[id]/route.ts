import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

const prisma = db;

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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const [{ id }, body] = await Promise.all([
      params,
      req.json()
    ]);
    
    // Get current lead to check previous status
    const currentLead = await prisma.lead.findUnique({ where: { id } });
    if (!currentLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        source: body.source,
        status: body.status,
        notes: body.notes,
        uploadedBy: body.uploadedBy,
        uploaderNotes: body.uploaderNotes,
        counselor: body.counselor,
        counselorNotes: body.counselorNotes,
        assignedDate: body.assignedDate ? new Date(body.assignedDate) : null,
        nextFollowUp: body.nextFollowUp ? new Date(body.nextFollowUp) : null,
        interestedCountry: body.interestedCountry,
        maritalStatus: body.maritalStatus,
        childrenCount: body.childrenCount ? parseInt(body.childrenCount) : 0,
        referenceName: body.referenceName,
      },
    });

    // Handle conversion to student
    if (body.status === 'Converted' && currentLead.status !== 'Converted') {
      try {
        // Check if student already exists by email
        const existingStudent = await prisma.student.findUnique({
          where: { email: lead.email }
        });

        if (!existingStudent) {
          // Calculate initials
          const initials = lead.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);

          // Create the student record
          await prisma.student.create({
            data: {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              interestedCountry: lead.interestedCountry,
              maritalStatus: lead.maritalStatus,
              counselor: lead.counselor,
              lead: 'Converted from Leads',
              status: 'New Leads',
              initials: initials || 'ST',
              color: '#6366f1', // Default branding color
              country: lead.interestedCountry,
            }
          });
        }
      } catch (studentError) {
        console.error("Migration to Student failed:", studentError);
        // We don't fail the whole request if student creation fails, 
        // but we should probably log it.
      }
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Update Lead Error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'Admin') {
      return NextResponse.json({ error: 'Only admins can delete leads' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.lead.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Lead Error:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
