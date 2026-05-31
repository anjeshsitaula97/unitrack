import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        loginLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    let generatedPassword = '';
    let passwordToHash = data.password;

    if (data.autoGeneratePassword) {
      // Generate a simple 10-char random password
      generatedPassword = Math.random().toString(36).slice(-10);
      passwordToHash = generatedPassword;
    }

    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    const newUser = await (db.user as any).create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || 'Viewer',
        status: 'Pending',
        lastLogin: 'Never',
        avatar: data.avatar || data.name.substring(0, 2).toUpperCase(),
      },
    });

    let apiKey = null;
    if (data.generateApiKey) {
      const token = 'uk_' + Math.random().toString(36).substring(2, 15);
      apiKey = await db.apiKey.create({
        data: {
          name: `${data.name}'s Auto-key`,
          tokenHash: token, // In a real app, hash this
        }
      });
    }

    return NextResponse.json({ 
      user: newUser, 
      generatedPassword: generatedPassword || null,
      apiKey: apiKey ? apiKey.tokenHash : null 
    }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create user/invite' }, { status: 400 });
  }
}
