import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.systemSettings.findFirst({
      where: { id: 'system-config' }
    });
    
    return NextResponse.json(settings ?? {
      id: 'system-config',
      country: 'United States',
      currencyCode: 'USD',
      phoneCode: '+1',
      language: 'English',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch localization settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const settings = await db.systemSettings.upsert({
      where: { id: 'system-config' },
      update: {
        country: data.country,
        currencyCode: data.currencyCode,
        phoneCode: data.phoneCode,
        language: data.language,
        enableBranches: data.enableBranches,
        officeLatitude: data.officeLatitude != null ? parseFloat(data.officeLatitude) : null,
        officeLongitude: data.officeLongitude != null ? parseFloat(data.officeLongitude) : null,
        officeRadius: data.officeRadius != null ? parseFloat(data.officeRadius) : 100,
      },
      create: {
        id: 'system-config',
        country: data.country,
        currencyCode: data.currencyCode,
        phoneCode: data.phoneCode,
        language: data.language,
        enableBranches: data.enableBranches || false,
        officeLatitude: data.officeLatitude != null ? parseFloat(data.officeLatitude) : null,
        officeLongitude: data.officeLongitude != null ? parseFloat(data.officeLongitude) : null,
        officeRadius: data.officeRadius != null ? parseFloat(data.officeRadius) : 100,
      },
    });
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update localization settings' }, { status: 500 });
  }
}
