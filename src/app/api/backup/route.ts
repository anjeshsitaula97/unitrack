import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { encryptBackup } from '@/lib/crypto';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tablesParam = searchParams.get('tables');
    const password = searchParams.get('password');
    const selectedTables = tablesParam ? tablesParam.split(',') : null;

    const exportTable = async (tableName: string, fetchFn: () => Promise<any>) => {
      if (!selectedTables || selectedTables.includes(tableName)) {
        return await fetchFn();
      }
      return [];
    };

    const data = {
      // Core models
      universities: await exportTable('universities', () => db.university.findMany()),
      partners: await exportTable('partners', () => db.partner.findMany()),
      courses: await exportTable('courses', () => db.course.findMany()),
      faculties: await exportTable('faculties', () => db.faculty.findMany()),
      degreeTypes: await exportTable('degreeTypes', () => db.degreeType.findMany()),
      intakes: await exportTable('intakes', () => db.intake.findMany()),
      qualifications: await exportTable('qualifications', () => db.qualification.findMany()),
      quickFilters: await exportTable('quickFilters', () => db.quickFilter.findMany()),

      // Student & application models
      students: await exportTable('students', () => db.student.findMany()),
      applications: await exportTable('applications', () => db.application.findMany()),
      studentDocuments: await exportTable('studentDocuments', () => db.studentDocument.findMany()),
      payments: await exportTable('payments', () => db.payment.findMany()),
      expenses: await exportTable('expenses', () => db.expense.findMany()),
      leads: await exportTable('leads', () => db.lead.findMany()),

      // HR & organizational models
      departments: await exportTable('departments', () => db.department.findMany()),
      designations: await exportTable('designations', () => db.designation.findMany()),
      employeeDocuments: await exportTable('employeeDocuments', () => db.employeeDocument.findMany()),
      attendance: await exportTable('attendance', () => db.attendance.findMany()),
      leaveTypes: await exportTable('leaveTypes', () => db.leaveType.findMany()),
      leaveBalances: await exportTable('leaveBalances', () => db.leaveBalance.findMany()),
      leaveRequests: await exportTable('leaveRequests', () => db.leaveRequest.findMany()),
      payrolls: await exportTable('payrolls', () => db.payroll.findMany()),
      payrollItems: await exportTable('payrollItems', () => db.payrollItem.findMany()),

      // Access & security models
      users: await exportTable('users', () => db.user.findMany()),
      roles: await exportTable('roles', () => db.role.findMany()),
      apiKeys: await exportTable('apiKeys', () => db.apiKey.findMany()),
      loginLogs: await exportTable('loginLogs', () => db.loginLog.findMany()),

      // Support & communication models
      tickets: await exportTable('tickets', () => db.ticket.findMany()),
      chatRooms: await exportTable('chatRooms', () => db.chatRoom.findMany()),
      chatMessages: await exportTable('chatMessages', () => db.chatMessage.findMany()),

      // Configuration models
      systemSettings: await exportTable('systemSettings', () => db.systemSettings.findMany()),
      branches: await exportTable('branches', () => db.branch.findMany()),
      emailSettings: await exportTable('emailSettings', () => db.emailSetting.findMany()),
      visaTypes: await exportTable('visaTypes', () => db.visaType.findMany()),
      embassyDetails: await exportTable('embassyDetails', () => db.embassyDetail.findMany()),
      visaChecklists: await exportTable('visaChecklists', () => db.visaChecklist.findMany()),
      workflowStages: await exportTable('workflowStages', () => db.workflowStage.findMany()),
      countries: await exportTable('countries', () => db.country.findMany()),
      learningCategories: await exportTable('learningCategories', () => db.learningCategory.findMany()),
      learningResources: await exportTable('learningResources', () => db.learningResource.findMany()),

      // Activity & notification models
      activityLogs: await exportTable('activityLogs', () => db.activityLog.findMany()),
      notifications: await exportTable('notifications', () => db.notification.findMany()),
      tasks: await exportTable('tasks', () => db.task.findMany()),
    };

    const backup = {
      version: "2.0",
      timestamp: new Date().toISOString(),
      data
    };

    let body: string;
    if (password) {
      body = JSON.stringify(encryptBackup(JSON.stringify(backup), password));
    } else {
      body = JSON.stringify(backup, null, 2);
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="unitrack-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup error:', error);
    return NextResponse.json({ error: 'Failed to generate backup' }, { status: 500 });
  }
}
