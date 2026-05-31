import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const student = await db.student.findUnique({
      where: { id: params.id },
      include: {
        documents: {
          orderBy: { uploadedAt: 'desc' }
        }
      }
    });
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(student);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();
    
    const name = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();

    const student = await db.student.update({
      where: { id: params.id },
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

        status: data.status,
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
          deleteMany: {},
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
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.student.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
