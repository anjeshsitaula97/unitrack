import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    
    if (!data.name || !data.fileUrl) {
      return NextResponse.json({ error: 'Document name and URL are required' }, { status: 400 });
    }

    const document = await db.studentDocument.create({
      data: {
        studentId: params.id,
        name: data.name,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
      }
    });
    
    return NextResponse.json(document);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}
