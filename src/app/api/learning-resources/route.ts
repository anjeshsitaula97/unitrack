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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const countryId = searchParams.get('countryId');
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (countryId) where.countryId = countryId;
    if (categoryId) where.categoryId = categoryId;

    const resources = await db.learningResource.findMany({
      where,
      include: {
        country: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { title, description, type, categoryId, countryId, url, thumbnail, fileSize } = data;

    if (!title || !url) return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });

    const [newResource, user] = await Promise.all([
      db.learningResource.create({
        data: {
          title,
          description,
          type: type || 'Document',
          categoryId,
          countryId,
          url,
          thumbnail,
          fileSize
        }
      }),
      db.user.findUnique({ where: { id: session.id as string } })
    ]);
    await logActivity({
      actorName: user?.name || 'System',
      action: 'added a hub resource',
      target: newResource.title,
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add resource' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.learningResource.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { id, title, description, type, categoryId, countryId, url, thumbnail, fileSize } = data;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const updatedResource = await db.learningResource.update({
      where: { id },
      data: {
        title,
        description,
        type,
        categoryId,
        countryId,
        url,
        thumbnail,
        fileSize
      }
    });

    return NextResponse.json(updatedResource);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}
