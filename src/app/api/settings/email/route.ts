import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const settings = await db.emailSetting.findMany({
      include: {
        branch: {
          select: {
            name: true
          }
        }
      }
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json({ error: 'Failed to fetch email settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id, 
      type, 
      branchId, 
      smtpHost, 
      smtpPort, 
      smtpUser, 
      smtpPass, 
      smtpEncryption, 
      fromEmail, 
      fromName,
      isActive 
    } = body;

    if (!smtpHost || !smtpUser || !fromEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let setting;
    if (id) {
      // Update existing
      setting = await db.emailSetting.update({
        where: { id },
        data: {
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass,
          smtpEncryption,
          fromEmail,
          fromName,
          isActive
        }
      });
    } else {
      // Create new
      // Check if global or branch setting already exists
      if (type === 'Global') {
        const existing = await db.emailSetting.findFirst({ where: { type: 'Global' } });
        if (existing) {
          return NextResponse.json({ error: 'Global email settings already exist. Update the existing one.' }, { status: 400 });
        }
      } else if (branchId) {
        const existing = await db.emailSetting.findUnique({ where: { branchId } });
        if (existing) {
          return NextResponse.json({ error: 'Email settings for this branch already exist.' }, { status: 400 });
        }
      }

      setting = await db.emailSetting.create({
        data: {
          type,
          branchId: type === 'Branch' ? branchId : null,
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPass,
          smtpEncryption,
          fromEmail,
          fromName,
          isActive
        }
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error saving email settings:', error);
    return NextResponse.json({ error: 'Failed to save email settings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    await db.emailSetting.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
  }
}
