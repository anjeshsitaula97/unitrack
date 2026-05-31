import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { decryptBackup } from '@/lib/crypto';
import type { EncryptedPayload } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    let payload = await req.json();

    // Decrypt if the backup is encrypted
    if (payload.encrypted) {
      const enc = payload as EncryptedPayload & { password?: string; selectedTables?: string[] };
      if (!enc.password) {
        return NextResponse.json({ error: 'Backup is encrypted. Please provide a password.' }, { status: 400 });
      }
      const decrypted: string = decryptBackup(enc, enc.password);
      payload = { ...JSON.parse(decrypted), selectedTables: enc.selectedTables };
    }

    const backup = payload;
    
    if (!backup.data || !backup.timestamp) {
      return NextResponse.json({ error: 'Invalid backup file format' }, { status: 400 });
    }

    const { data, selectedTables } = backup;

    const shouldRestore = (tableName: string) => {
      return (!selectedTables || selectedTables.includes(tableName)) && data[tableName] && data[tableName].length > 0;
    };

    await db.$transaction(async (tx) => {
      // 1. Delete existing data in reverse dependency order
      // (most dependent / child tables first)
      if (shouldRestore('chatMessages')) await tx.chatMessage.deleteMany();
      if (shouldRestore('chatRooms')) await tx.chatRoom.deleteMany();
      if (shouldRestore('payrollItems')) await tx.payrollItem.deleteMany();
      if (shouldRestore('payrolls')) await tx.payroll.deleteMany();
      if (shouldRestore('leaveRequests')) await tx.leaveRequest.deleteMany();
      if (shouldRestore('leaveBalances')) await tx.leaveBalance.deleteMany();
      if (shouldRestore('attendance')) await tx.attendance.deleteMany();
      if (shouldRestore('employeeDocuments')) await tx.employeeDocument.deleteMany();
      if (shouldRestore('loginLogs')) await tx.loginLog.deleteMany();
      if (shouldRestore('tickets')) await tx.ticket.deleteMany();
      if (shouldRestore('emailSettings')) await tx.emailSetting.deleteMany();
      if (shouldRestore('learningResources')) await tx.learningResource.deleteMany();
      if (shouldRestore('applications')) await tx.application.deleteMany();
      if (shouldRestore('courses')) await tx.course.deleteMany();
      if (shouldRestore('studentDocuments')) await tx.studentDocument.deleteMany();
      if (shouldRestore('payments')) await tx.payment.deleteMany();
      if (shouldRestore('students')) await tx.student.deleteMany();
      if (shouldRestore('universities')) await tx.university.deleteMany();
      if (shouldRestore('tasks')) await tx.task.deleteMany();
      if (shouldRestore('notifications')) await tx.notification.deleteMany();
      if (shouldRestore('activityLogs')) await tx.activityLog.deleteMany();
      if (shouldRestore('branches')) await tx.branch.deleteMany();
      if (shouldRestore('users')) await tx.user.deleteMany();
      if (shouldRestore('leads')) await tx.lead.deleteMany();
      if (shouldRestore('roles')) await tx.role.deleteMany();
      if (shouldRestore('systemSettings')) await tx.systemSettings.deleteMany();
      if (shouldRestore('apiKeys')) await tx.apiKey.deleteMany();
      if (shouldRestore('countries')) await tx.country.deleteMany();
      if (shouldRestore('learningCategories')) await tx.learningCategory.deleteMany();
      if (shouldRestore('quickFilters')) await tx.quickFilter.deleteMany();
      if (shouldRestore('faculties')) await tx.faculty.deleteMany();
      if (shouldRestore('degreeTypes')) await tx.degreeType.deleteMany();
      if (shouldRestore('intakes')) await tx.intake.deleteMany();
      if (shouldRestore('qualifications')) await tx.qualification.deleteMany();
      if (shouldRestore('departments')) await tx.department.deleteMany();
      if (shouldRestore('designations')) await tx.designation.deleteMany();
      if (shouldRestore('partners')) await tx.partner.deleteMany();
      if (shouldRestore('visaTypes')) await tx.visaType.deleteMany();
      if (shouldRestore('visaChecklists')) await tx.visaChecklist.deleteMany();
      if (shouldRestore('workflowStages')) await tx.workflowStage.deleteMany();
      if (shouldRestore('embassyDetails')) await tx.embassyDetail.deleteMany();
      if (shouldRestore('leaveTypes')) await tx.leaveType.deleteMany();
      if (shouldRestore('expenses')) await tx.expense.deleteMany();

      // 2. Re-populate data in correct dependency order
      // Independent / lookup tables first
      if (shouldRestore('quickFilters')) await tx.quickFilter.createMany({ data: data.quickFilters });
      if (shouldRestore('faculties')) await tx.faculty.createMany({ data: data.faculties });
      if (shouldRestore('degreeTypes')) await tx.degreeType.createMany({ data: data.degreeTypes });
      if (shouldRestore('intakes')) await tx.intake.createMany({ data: data.intakes });
      if (shouldRestore('qualifications')) await tx.qualification.createMany({ data: data.qualifications });
      if (shouldRestore('countries')) await tx.country.createMany({ data: data.countries });
      if (shouldRestore('learningCategories')) await tx.learningCategory.createMany({ data: data.learningCategories });
      if (shouldRestore('roles')) await tx.role.createMany({ data: data.roles });
      if (shouldRestore('systemSettings')) await tx.systemSettings.createMany({ data: data.systemSettings });
      if (shouldRestore('partners')) await tx.partner.createMany({ data: data.partners });
      if (shouldRestore('departments')) await tx.department.createMany({ data: data.departments });
      if (shouldRestore('designations')) await tx.designation.createMany({ data: data.designations });
      if (shouldRestore('visaTypes')) await tx.visaType.createMany({ data: data.visaTypes });
      if (shouldRestore('visaChecklists')) await tx.visaChecklist.createMany({ data: data.visaChecklists });
      if (shouldRestore('workflowStages')) await tx.workflowStage.createMany({ data: data.workflowStages });
      if (shouldRestore('embassyDetails')) await tx.embassyDetail.createMany({ data: data.embassyDetails });
      if (shouldRestore('leaveTypes')) await tx.leaveType.createMany({ data: data.leaveTypes });
      
      // Branch-dependent models
      if (shouldRestore('branches')) await tx.branch.createMany({ data: data.branches });
      if (shouldRestore('emailSettings')) await tx.emailSetting.createMany({ data: data.emailSettings });
      
      // User-dependent models
      if (shouldRestore('users')) await tx.user.createMany({ data: data.users });
      if (shouldRestore('apiKeys')) await tx.apiKey.createMany({ data: data.apiKeys });
      if (shouldRestore('leads')) await tx.lead.createMany({ data: data.leads });
      if (shouldRestore('loginLogs')) await tx.loginLog.createMany({ data: data.loginLogs });
      if (shouldRestore('tickets')) await tx.ticket.createMany({ data: data.tickets });
      if (shouldRestore('attendance')) await tx.attendance.createMany({ data: data.attendance });
      if (shouldRestore('employeeDocuments')) await tx.employeeDocument.createMany({ data: data.employeeDocuments });
      if (shouldRestore('leaveBalances')) await tx.leaveBalance.createMany({ data: data.leaveBalances });
      if (shouldRestore('leaveRequests')) await tx.leaveRequest.createMany({ data: data.leaveRequests });
      if (shouldRestore('payrolls')) await tx.payroll.createMany({ data: data.payrolls });
      if (shouldRestore('payrollItems')) await tx.payrollItem.createMany({ data: data.payrollItems });
      if (shouldRestore('chatRooms')) await tx.chatRoom.createMany({ data: data.chatRooms });
      if (shouldRestore('chatMessages')) await tx.chatMessage.createMany({ data: data.chatMessages });
      
      // Student & academic models
      if (shouldRestore('universities')) await tx.university.createMany({ data: data.universities });
      if (shouldRestore('students')) await tx.student.createMany({ data: data.students });
      if (shouldRestore('courses')) await tx.course.createMany({ data: data.courses });
      if (shouldRestore('applications')) await tx.application.createMany({ data: data.applications });
      if (shouldRestore('studentDocuments')) await tx.studentDocument.createMany({ data: data.studentDocuments });
      if (shouldRestore('payments')) await tx.payment.createMany({ data: data.payments });
      if (shouldRestore('expenses')) await tx.expense.createMany({ data: data.expenses });
      
      // Activity & content models
      if (shouldRestore('tasks')) await tx.task.createMany({ data: data.tasks });
      if (shouldRestore('learningResources')) await tx.learningResource.createMany({ data: data.learningResources });
      if (shouldRestore('activityLogs')) await tx.activityLog.createMany({ data: data.activityLogs });
      if (shouldRestore('notifications')) await tx.notification.createMany({ data: data.notifications });
    });

    return NextResponse.json({ success: true, message: 'Data restored successfully' });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Failed to restore data. Check file compatibility.' }, { status: 500 });
  }
}
