const fs = require('fs');
const path = require('path');

function findPageFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && !full.includes('node_modules') && !full.includes('.next') && !full.includes('api')) {
      results.push(...findPageFiles(full));
    } else if (e.isFile() && e.name === 'page.tsx') {
      results.push(full);
    }
  }
  return results;
}

const root = 'D:/Coding/Softwares/Autocad_2025_English/Softwares/unitrack/unitrack/src/app';
const pageFiles = findPageFiles(root);

const titles = {
  'page': 'Home',
  'access': 'Access Control',
  'analytics': 'Analytics',
  'api-keys': 'API Keys',
  'applications': 'Applications',
  'automations': 'Automations',
  'courses': 'Courses',
  'courses/add': 'Add Course',
  'courses/edit/[id]': 'Edit Course',
  'dashboard': 'Dashboard',
  'expenses': 'Expenses',
  'featured': 'Featured Universities',
  'hr': 'HR Dashboard',
  'hr/attendance': 'Attendance',
  'hr/departments': 'Departments',
  'hr/designations': 'Designations',
  'hr/employees': 'Employees',
  'hr/employees/[id]/face-enrollment': 'Face Enrollment',
  'hr/leave': 'Leave Management',
  'hr/payroll': 'Payroll',
  'leads': 'Leads',
  'learning-hub': 'Learning Hub',
  'notifications': 'Notifications',
  'payments': 'Payments',
  'reports': 'Reports',
  'search': 'Search',
  'settings': 'Settings',
  'staff': 'Staff',
  'staff-tasks': 'Staff Tasks',
  'students': 'Students',
  'support': 'Support',
  'tasks': 'Visa Workflow',
  'tickets': 'Tickets',
  'universities': 'Universities',
  'universities/add': 'Add University',
  'universities/[id]/edit': 'Edit University',
  'universities/[id]': 'University Details',
};

function getRelativePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const prefix = root.replace(/\\/g, '/');
  let rel = normalized.replace(prefix + '/', '').replace('/page.tsx', '');
  // Replace dynamic segment patterns like [id] with [id]
  rel = rel.replace(/\/\[id\]/g, '/[id]');
  return rel;
}

let count = 0;
for (const file of pageFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  if (content.includes('export const metadata') || content.includes('export async function generateMetadata')) {
    continue;
  }
  if (content.includes("'use client'") || content.includes('"use client"')) {
    continue;
  }
  if (file.includes('backups')) continue;

  const relPath = getRelativePath(file);
  const title = titles[relPath];
  if (!title) {
    console.log('SKIP (no title):', relPath);
    continue;
  }

  const metadataBlock = `export const metadata = {
  title: '${title} | UniTrack',
  description: 'UniTrack administration - ${title}',
};

`;

  const lines = content.split('\n');
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith('import ')) {
      lastImport = i;
    }
  }

  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, '', metadataBlock.trim());
    fs.writeFileSync(file, lines.join('\n'));
    count++;
    console.log('OK:', relPath);
  }
}
console.log('Total pages updated:', count);
