import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const students = await db.student.findMany({
      include: {
        documents: true,
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    if (!data.name && (!data.firstName || !data.lastName)) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Ensure name is set
    const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();

    const student = await db.student.create({
      data: {
        name,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        admissionEmail: data.admissionEmail,
        studentPassword: data.studentPassword,
        phone: data.phone,
        whatsappNumber: data.whatsappNumber,
        gender: data.gender,
        dob: data.dob,
        dobAd: data.dobAd,
        dobBs: data.dobBs,
        nationality: data.nationality,
        maritalStatus: data.maritalStatus,
        photoUrl: data.photoUrl,
        
        address: data.address,
        permanentProvince: data.permanentProvince,
        permanentDistrict: data.permanentDistrict,
        permanentMunicipality: data.permanentMunicipality,
        permanentWardNo: data.permanentWardNo,
        permanentAddress: data.permanentAddress,
        
        temporaryProvince: data.temporaryProvince,
        temporaryDistrict: data.temporaryDistrict,
        temporaryMunicipality: data.temporaryMunicipality,
        temporaryWardNo: data.temporaryWardNo,
        temporaryAddress: data.temporaryAddress,

        passportNumber: data.passportNumber,
        passportNationality: data.passportNationality,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        passportIssuePlace: data.passportIssuePlace,

        education: data.education,
        workExperience: data.workExperience,
        training: data.training,

        testType: data.testType,
        overallScore: data.overallScore,
        readingScore: data.readingScore,
        writingScore: data.writingScore,
        listeningScore: data.listeningScore,
        speakingScore: data.speakingScore,
        moi: data.moi,
        testDate: data.testDate,
        testRegNumber: data.testRegNumber,

        studyLevel: data.studyLevel,
        intakeTerm: data.intakeTerm,
        major: data.major,
        interestedCountry: data.interestedCountry,
        targetUniversities: data.targetUniversities,

        spouseName: data.spouseName,
        childrenDetails: typeof data.childrenDetails === 'string' 
          ? data.childrenDetails 
          : JSON.stringify(data.childrenDetails || []),
        
        guardianName: data.guardianName,
        guardianPhone: data.guardianPhone,
        guardianEmail: data.guardianEmail,
        guardianRelation: data.guardianRelation,
        guardianAddress: data.guardianAddress,

        status: data.status || 'New Leads',
        statusColor: data.statusColor,
        initials: data.initials,
        color: data.color,
        university: data.university,
        country: data.country,
        lastActivity: data.lastActivity,
        counselor: data.counselor,
        lead: data.lead,
        branchId: data.branchId,
        documents: data.documents ? {
          create: data.documents.map((doc: any) => ({
            type: doc.type,
            name: doc.name,
            url: doc.url,
            status: doc.status || 'Uploaded'
          }))
        } : undefined,
      }
    });
    
    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
