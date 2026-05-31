import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const prisma = db;

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Fetch Leads Error:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, email, phone, source, status, notes, 
      uploadedBy, uploaderNotes, counselor, counselorNotes,
      assignedDate, nextFollowUp,
      interestedCountry, maritalStatus, childrenCount,
      referenceName
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        source: source || "Website",
        status: status || "New",
        notes,
        uploadedBy,
        uploaderNotes,
        counselor,
        counselorNotes,
        assignedDate: assignedDate ? new Date(assignedDate) : null,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
        interestedCountry,
        maritalStatus: maritalStatus || "Single",
        childrenCount: childrenCount ? parseInt(childrenCount) : 0,
        referenceName,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Create Lead Error:", error);
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: "A lead with this email already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
