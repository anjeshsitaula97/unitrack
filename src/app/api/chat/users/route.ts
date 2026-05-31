import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/session';

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    return await verifyAuth(token);
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await db.systemSettings.findFirst();
  const branchesEnabled = settings?.enableBranches ?? false;

  const users = await db.user.findMany({
    where: {
      id: { not: session.id },
      status: 'Active',
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ users, branchesEnabled });
}
