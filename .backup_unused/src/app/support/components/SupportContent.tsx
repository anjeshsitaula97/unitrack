'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  ChevronRight, 
  HelpCircle, 
  Shield, 
  CreditCard, 
  User, 
  Settings, 
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  Globe,
  MapPin,
  ExternalLink,
  Clock,
  BarChart3,
  ArrowLeft,
  FileText,
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Step {
  title: string;
  instruction: string;
  screenshot?: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  steps?: Step[];
  relatedLinks?: { label: string; href: string }[];
}

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  href: string;
  articles: Article[];
}

const ARTICLES: Category[] = [
  {
    id: 'hr',
    label: 'HR & Attendance',
    icon: <Clock className="text-cyan-500" />,
    color: 'cyan',
    desc: 'Face verification check-in/out, geolocation, and attendance reports',
    href: '/hr',
    articles: [
      {
        id: 'face-verification',
        title: 'Face Verification Check-In & Check-Out',
        description: 'Learn how face verification works for secure attendance tracking using motion-based liveness detection.',
        steps: [
          {
            title: 'Navigate to HR > Attendance',
            instruction: 'From the sidebar, click "HR" then "Attendance" to open the attendance page. The main table shows all attendance records for the current date.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Check your current status in Quick Actions',
            instruction: 'The Quick Actions card on the right shows your check-in status for today. If you are not checked in, you will see a "Face Verification Check In" button. If you are checked in, a "Face Verification Check Out" button is shown.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Click the face verification button',
            instruction: 'Click "Face Verification Check In" or "Face Verification Check Out". The system first verifies that your face is enrolled. If not enrolled, you will be prompted to enroll first.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Complete the liveness detection',
            instruction: 'A camera modal opens. Look at the camera and keep your face within the detection box. The system tracks subtle head movements across 5 frames to confirm you are a live person (not a photo or video).',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Verification result',
            instruction: 'If your face matches your enrolled descriptor and liveness is confirmed, the check-in or checkout is recorded. You will see a success toast and the attendance table updates immediately.',
            screenshot: 'hr-attendance.png',
          },
        ],
        relatedLinks: [
          { label: 'Enrolling Your Face', href: '#enrolling-face' },
          { label: 'Geolocation & Geofencing', href: '#geolocation-geofencing' },
        ],
      },
      {
        id: 'enrolling-face',
        title: 'Enrolling Your Face',
        description: 'Step-by-step guide to enroll your face for attendance verification.',
        steps: [
          {
            title: 'Go to HR > Employees',
            instruction: 'Click "HR" from the sidebar, then select "Employees". Find your employee record in the list. Each employee row shows their name, department, and a camera icon on the right.',
            screenshot: 'hr-employees.png',
          },
          {
            title: 'Click the camera icon',
            instruction: 'Next to your employee name or avatar, click the camera icon. This opens the face enrollment page in a new tab. If no camera icon is visible, you may need to edit your profile first.',
            screenshot: 'hr-employees.png',
          },
          {
            title: 'Position your face in the camera',
            instruction: 'On the enrollment page, ensure your device camera is accessible. Position your face in the center of the detection box. Good lighting and a clear view of your face are important.',
            screenshot: 'hr-face-enrollment.png',
          },
          {
            title: 'Follow the movement prompts',
            instruction: 'Once your face is detected, the system prompts you to move your head slightly (left, right, up, down). Move slowly and naturally. The system captures 5 frames from different angles to create a unique face descriptor.',
            screenshot: 'hr-face-enrollment.png',
          },
          {
            title: 'Confirm enrollment',
            instruction: 'After all frames are captured, a success message confirms enrollment. Your face descriptor is saved to your profile. You can now use face verification for daily check-in and checkout.',
            screenshot: 'hr-face-enrollment.png',
          },
        ],
        relatedLinks: [
          { label: 'Face Verification Process', href: '#face-verification' },
        ],
      },
      {
        id: 'geolocation-geofencing',
        title: 'Geolocation & Geofencing',
        description: 'Why location is required and how geofence validation works for attendance.',
        steps: [
          {
            title: 'Configure office location',
            instruction: 'Go to Settings > Localization. Enter the Office Latitude and Office Longitude for your main office. Set the Geofence Radius in meters (default: 100m). This is the fallback location used when an employee has no branch assigned.',
            screenshot: 'settings-localization.png',
          },
          {
            title: 'Set branch locations (optional)',
            instruction: 'If you have multiple offices, go to Settings > Branches and add or edit a branch. Enter its latitude and longitude coordinates. Employees assigned to this branch will use its location for geofence validation.',
            screenshot: 'settings-branches.png',
          },
          {
            title: 'Assign employees to branches',
            instruction: 'Go to HR > Employees, edit an employee profile, and select their branch from the Branch dropdown. If a branch with coordinates is selected, that location takes priority over the main office.',
            screenshot: 'hr-employees.png',
          },
          {
            title: 'Location is checked on check-in/out',
            instruction: 'When an employee checks in or out, their device GPS is captured and compared against the reference location. The Haversine formula calculates the distance. If they are outside the radius, the action is blocked.',
            screenshot: 'hr-attendance.png',
          },
        ],
        relatedLinks: [
          { label: 'Managing Branches & Locations', href: '#managing-branches' },
          { label: 'Attendance Reports & Filters', href: '#attendance-reports' },
        ],
      },
      {
        id: 'attendance-reports',
        title: 'Attendance Reports & Filters',
        description: 'How to view, filter, sort, and understand attendance records.',
        steps: [
          {
            title: 'Open the Attendance page',
            instruction: 'Navigate to HR > Attendance. The main panel shows the attendance table with employee names, check-in/check-out times, status, and verification columns.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Set a date range',
            instruction: 'Use the from and to date pickers at the top of the Attendance Report card to select a date range. The summary cards and table update automatically to show records for the selected period.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Use filters to narrow results',
            instruction: 'Click the "Filters" button to expand the filter bar. Use the Employee Search field to find a specific person by name or employee ID. Use the Status dropdown to filter by Present, Late, Absent, or Half-Day.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Sort by check-in or check-out',
            instruction: 'Click the "Check In" or "Check Out" column headers to sort records. Click once for ascending order (earliest first), click again for descending (latest first). The active sort column shows an arrow indicator.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'View location on Google Maps',
            instruction: 'Each check-in and check-out entry shows GPS coordinates. Click the coordinates or the "Map" link to open the exact location in Google Maps. The Quick Actions card also shows your own coordinates as clickable links.',
            screenshot: 'hr-attendance.png',
          },
        ],
        relatedLinks: [
          { label: 'Geolocation & Geofencing', href: '#geolocation-geofencing' },
        ],
      },
      {
        id: 'managing-branches',
        title: 'Managing Branches & Office Locations',
        description: 'How to set up branches, assign employees, and configure geofence locations.',
        steps: [
          {
            title: 'Go to Settings > Localization',
            instruction: 'Navigate to Settings from the sidebar and click the Localization tab. Here you can set the main office latitude, longitude, and geofence radius. These settings apply as the default for all employees without a branch assignment.',
            screenshot: 'settings-localization.png',
          },
          {
            title: 'Set the office coordinates',
            instruction: 'Enter the Office Latitude and Office Longitude for your main office location. Use Google Maps to find the exact coordinates if needed. Set the Geofence Radius (in meters) — 100m is the default.',
            screenshot: 'settings-localization.png',
          },
          {
            title: 'Add or edit branches',
            instruction: 'Scroll down to the Branches section. Click "Add Branch" to create a new branch or click an existing branch to edit. Enter the branch name, address, and its latitude/longitude coordinates.',
            screenshot: 'settings-branches.png',
          },
          {
            title: 'Assign employees to branches',
            instruction: 'Go to HR > Employees and edit an employee. In the Branch dropdown, select the appropriate branch. Only active branches with coordinates appear in the dropdown. Save the employee profile.',
            screenshot: 'hr-employees.png',
          },
        ],
        relatedLinks: [
          { label: 'Geolocation & Geofencing', href: '#geolocation-geofencing' },
        ],
      },
    ],
  },
  {
    id: 'universities',
    label: 'University Management',
    icon: <Globe className="text-blue-500" />,
    color: 'blue',
    desc: 'Managing profiles, contact details, and institutional branding',
    href: '/universities',
    articles: [
      {
        id: 'adding-universities',
        title: 'Adding & Editing Universities',
        description: 'How to create and manage university profiles in the system.',
        steps: [
          {
            title: 'Navigate to Universities',
            instruction: 'Click "Universities" from the sidebar. The universities page shows all registered universities in a card grid or table view.',
            screenshot: 'universities.png',
          },
          {
            title: 'Click "Add University"',
            instruction: 'Click the "Add University" button in the top-right corner. A form opens with fields for university name, country, website, contact information, and description.',
            screenshot: 'universities-add.png',
          },
          {
            title: 'Fill in the required details',
            instruction: 'Enter the university name (required), select its country, add the official website URL, and provide contact email and phone number. Optional fields include accreditation, affiliations, and a description.',
            screenshot: 'universities-add.png',
          },
          {
            title: 'Save the university profile',
            instruction: 'Click "Save" to create the university. The new university appears in the list. Click on any university card to open its detail view where you can manage programs, partnerships, and documents.',
            screenshot: 'universities-add.png',
          },
        ],
        relatedLinks: [
          { label: 'Managing Contact Information', href: '#university-contacts' },
          { label: 'Configuring Partner Commissions', href: '#university-commissions' },
        ],
      },
      {
        id: 'university-contacts',
        title: 'Managing Contact Information & Branding',
        description: 'How to update university contact details and customize branding.',
        content: `Each university profile supports comprehensive contact information and branding options.

## Contact Information
- Official Email: Primary contact email for the university.
- Phone Number: Main office phone with country code.
- Physical Address: Street, city, state/province, and postal code.
- Website URL: Link to the official university website.
- Social Media: Optional links to social media profiles.

## Branding
- Logo: Upload the university logo (PNG/JPG, recommended 200x200px).
- Banner Image: A cover image for the university profile detail page.
- Color Theme: Optional accent colors for the university\'s card display.

## Updating Contact Info
1. Open the university detail view.
2. Click "Edit Profile".
3. Scroll to the Contact Information section.
4. Update the desired fields.
5. Click "Save Changes" to apply updates.

## Best Practices
- Keep contact information up to date for partner communications.
- Use high-resolution logos for professional display.
- Verify website URLs are correct before saving.`,
        relatedLinks: [
          { label: 'Adding & Editing Universities', href: '#adding-universities' },
        ],
      },
      {
        id: 'university-commissions',
        title: 'Configuring Partner Commissions',
        description: 'How to set up commission structures for university partnerships.',
        content: `Commissions track partner earnings for student enrollments at specific universities.

## Commission Types
- Flat: A fixed amount per enrolled student (e.g., $500 per student).
- Percentage: A percentage of tuition fees per enrolled student (e.g., 10% of first-year tuition).

## Setting Up a Commission
1. Open the university detail view.
2. Navigate to the "Partnerships" or "Commissions" section.
3. Click "Add Commission".
4. Select the partner from the dropdown.
5. Choose the commission type (Flat or Percentage).
6. Enter the commission value (amount or percentage).
7. Optionally set a valid-from and valid-to date.
8. Click "Save" to activate the commission.

## Editing or Removing Commissions
- Click on an existing commission to edit its parameters.
- Use the delete option to remove a commission (this does not affect past enrollments).`,
        relatedLinks: [
          { label: 'Adding & Editing Universities', href: '#adding-universities' },
        ],
      },
      {
        id: 'university-search',
        title: 'University Search & Filtering',
        description: 'How to find universities using search, filters, and sorting.',
        content: `The Universities page provides powerful search and filtering capabilities.

## Search Bar
- Type the university name, country, or any keyword in the search bar at the top.
- Results update in real-time as you type.

## Filters
- Country: Filter universities by country of location.
- Status: Filter by active/inactive universities.
- Partnership: Show only universities with active commission structures.

## Sorting
- Sort universities by name (A-Z or Z-A).
- Sort by date added (newest/oldest first).
- Sort by number of associated programs.

## Quick Actions
- Click a university card to open its detail view.
- Use the action menu (three dots) on each card for quick edit or delete.`,
        relatedLinks: [
          { label: 'Adding & Editing Universities', href: '#adding-universities' },
        ],
      },
    ],
  },
  {
    id: 'courses',
    label: 'Program Catalog',
    icon: <Book className="text-amber-500" />,
    color: 'amber',
    desc: 'Adding courses, faculties, and specific program requirements',
    href: '/courses',
    articles: [
      {
        id: 'adding-courses',
        title: 'Adding Courses & Programs',
        description: 'How to create and manage academic programs in the catalog.',
        steps: [
          {
            title: 'Navigate to Courses',
            instruction: 'Click "Courses" from the sidebar. The Program Catalog shows all courses in a searchable, filterable list.',
            screenshot: 'courses.png',
          },
          {
            title: 'Click "Add Course"',
            instruction: 'Click the "Add Course" button. Fill in the program name, select the university from the dropdown, choose the faculty/department, degree level, duration, and tuition fee.',
            screenshot: 'courses-add.png',
          },
          {
            title: 'Add program requirements',
            instruction: 'Add entry requirements, language requirements, and application deadlines. You can also upload supporting documents and brochures.',
            screenshot: 'courses-add.png',
          },
          {
            title: 'Save the program',
            instruction: 'Click "Save" to add the program to the catalog. It will appear in search results and be available for student applications.',
            screenshot: 'courses-add.png',
          },
        ],
        relatedLinks: [
          { label: 'Managing Faculties & Departments', href: '#managing-faculties' },
          { label: 'Program Search & Filters', href: '#program-search' },
        ],
      },
      {
        id: 'managing-faculties',
        title: 'Managing Faculties & Departments',
        description: 'How to organize programs by faculty and department structures.',
        content: `Faculties and departments help organize programs into logical academic groupings.

## Adding a Faculty
1. Go to Courses or Settings from the sidebar.
2. Navigate to the Faculties section.
3. Click "Add Faculty".
4. Enter the faculty name (e.g., "Faculty of Science and Technology").
5. Optionally add a description.
6. Save the faculty.

## Adding a Department
- Departments are sub-groupings within a faculty.
- Select a parent faculty when creating a department.

## Assigning Programs to Faculties
- When adding or editing a program, select its faculty and department from the dropdown menus.
- Programs can be filtered by faculty for easier browsing.

## Editing or Deleting
- Use the edit option to rename or update faculties/departments.
- Deleting a faculty requires all associated programs to be reassigned first.`,
        relatedLinks: [
          { label: 'Adding Courses & Programs', href: '#adding-courses' },
        ],
      },
      {
        id: 'program-requirements',
        title: 'Setting Course Requirements',
        description: 'How to configure entry requirements, prerequisites, and program details.',
        content: `Each program can have detailed requirements to help applicants understand eligibility.

## Types of Requirements
- Academic Entry Requirements: Minimum GPA, previous degree requirements.
- Language Requirements: IELTS, TOEFL, or other language test scores.
- Application Documents: Required documents like transcripts, CV, recommendation letters.
- Additional Criteria: Work experience, portfolio, entrance exam scores.

## Configuring Requirements
1. Open the program detail view.
2. Navigate to the "Requirements" tab.
3. Add each requirement with a title and description.
4. Mark requirements as mandatory or optional.
5. Save the configuration.

## Display
- Requirements are shown on the program detail page.
- Applicants can view requirements before starting an application.`,
        relatedLinks: [
          { label: 'Adding Courses & Programs', href: '#adding-courses' },
        ],
      },
      {
        id: 'program-search',
        title: 'Program Search & Filters',
        description: 'How to find programs using search, filters, and sorting.',
        content: `The Program Catalog offers multiple ways to find specific programs.

## Search by Keyword
- Type program name, university, or keyword in the search bar.
- Search matches against program name, university name, and description.

## Advanced Filters
- University: Filter by specific partner university.
- Faculty: Filter by academic faculty.
- Degree Level: Bachelor, Master, PhD, Diploma, Certificate.
- Status: Active, Inactive, or All programs.
- Country: Filter by university country.

## Sorting Options
- Sort by program name (A-Z).
- Sort by tuition fee (low to high or high to low).
- Sort by duration.
- Sort by date added.`,
        relatedLinks: [
          { label: 'Adding Courses & Programs', href: '#adding-courses' },
        ],
      },
    ],
  },
  {
    id: 'partners',
    label: 'Partners & Commissions',
    icon: <User className="text-purple-500" />,
    color: 'purple',
    desc: 'Tracking university partners and commission structures',
    href: '/settings',
    articles: [
      {
        id: 'registering-partners',
        title: 'Registering University Partners',
        description: 'How to register and manage partner organizations in the system.',
        content: `Partners are organizations or individuals who recruit students for partner universities.

## Adding a New Partner
1. Navigate to Settings > Partners from the sidebar.
2. Click "Add Partner".
3. Enter partner details:
   - Partner Name (required)
   - Contact Person
   - Email Address
   - Phone Number
   - Country
   - Contract Start/End Dates
4. Click "Save" to register the partner.

## Managing Partners
- View all partners in a searchable, filterable list.
- Click any partner to view their profile, commission history, and linked universities.
- Edit partner details at any time.
- Deactivate partners who are no longer active.

## Partner Statuses
- Active: Eligible for commissions and new referrals.
- Inactive: Cannot earn commissions but historical data is retained.
- Pending: Awaiting contract finalization.`,
        relatedLinks: [
          { label: 'Setting Up Commission Structures', href: '#commission-structures' },
        ],
      },
      {
        id: 'commission-structures',
        title: 'Setting Up Commission Structures',
        description: 'How to configure flat and percentage-based commissions.',
        content: `Commissions define how partners are compensated for student referrals.

## Commission Models
- Flat Fee: A fixed amount paid per enrolled student. Best for programs with consistent value.
- Percentage: A percentage of tuition fees. Scales with program cost.

## Creating a Commission Structure
1. Open the university detail view.
2. Go to the "Partnerships" tab.
3. Click "Add Commission".
4. Select the partner from the list.
5. Choose commission type (Flat or Percentage).
6. Enter the value.
7. Set effective dates (optional).
8. Save.

## Commission Reporting
- View all commission earnings in the Partners section.
- Filter by date range, partner, or university.
- Export commission reports for accounting purposes.`,
        relatedLinks: [
          { label: 'Registering Partners', href: '#registering-partners' },
        ],
      },
      {
        id: 'partner-performance',
        title: 'Tracking Partner Performance',
        description: 'How to monitor partner activity, enrollments, and commission earnings.',
        content: `Partner performance tracking helps you evaluate the effectiveness of your partnerships.

## Performance Metrics
- Total Referrals: Number of students referred by the partner.
- Enrolled Students: Number of referred students who successfully enrolled.
- Conversion Rate: Percentage of referrals that resulted in enrollment.
- Total Commissions Earned: Sum of all commissions paid to the partner.

## Viewing Performance
1. Go to the Partners section.
2. Click on a partner name to open their detail view.
3. The dashboard shows key metrics and a timeline of activity.

## Exporting Reports
- Use the filter options to narrow by date range.
- Click "Export" to download a CSV report of partner activity.`,
        relatedLinks: [
          { label: 'Registering Partners', href: '#registering-partners' },
        ],
      },
    ],
  },
  {
    id: 'finance',
    label: 'Forex & Tuition',
    icon: <CreditCard className="text-emerald-500" />,
    color: 'emerald',
    desc: 'Real-time currency conversion (NPR) and fee management',
    href: '/settings',
    articles: [
      {
        id: 'forex-rates',
        title: 'Understanding Forex Rate Conversion',
        description: 'How real-time currency conversion works for displaying tuition fees.',
        content: `The Forex system automatically converts tuition fees from foreign currencies to Nepalese Rupees (NPR).

## How It Works
- Tuition fees are stored in the original currency (e.g., USD, AUD, GBP, EUR).
- When you view a fee on a university detail page, click "Show in NPR".
- The system fetches the latest exchange rate from the configured forex API.
- The fee is converted and displayed in NPR.

## Viewing Fees in NPR
1. Open any university or program detail page.
2. Locate the tuition fee display.
3. Click the "Show in NPR" button.
4. The converted amount appears alongside the original fee.

## Rate Accuracy
- Rates are updated regularly from the forex API provider.
- The system shows when the rate was last updated.
- Use the "Refresh" button to fetch the very latest rate.`,
        relatedLinks: [
          { label: 'Viewing Tuition Fees in NPR', href: '#tuition-npr' },
        ],
      },
      {
        id: 'tuition-npr',
        title: 'Viewing Tuition Fees in NPR',
        description: 'Step-by-step guide to viewing and understanding fees in NPR.',
        content: `Displaying tuition fees in Nepalese Rupees helps students and counselors understand costs.

## Steps
1. Navigate to a university or program detail page.
2. Look for the tuition fee section showing the original fee and currency.
3. Click the "Show in NPR" button.
4. The system will display the converted amount.

## Understanding the Display
- "Fee: $10,000 USD (~₨1,350,000 NPR)"
- The approximate symbol (~) indicates the amount may vary slightly with exchange rate fluctuations.

## Additional Fee Information
- Some programs show annual fees, total program fees, or per-semester fees.
- Check the program details for the exact fee structure.`,
        relatedLinks: [
          { label: 'Understanding Forex Rate Conversion', href: '#forex-rates' },
        ],
      },
      {
        id: 'fee-management',
        title: 'Managing Fee Structures',
        description: 'How to configure and update tuition fees for programs.',
        content: `Fee management allows you to set and update tuition costs for academic programs.

## Setting Program Fees
1. Open the program detail view (Courses > Program Name).
2. Navigate to the "Fee" or "Tuition" section.
3. Enter the fee amount.
4. Select the currency from the dropdown.
5. Choose the fee type: Annual, Total, Per Semester, or Per Credit.
6. Save the program.

## Fee Types
- Annual Fee: Cost per academic year.
- Total Fee: Full cost of the entire program.
- Per Semester: Cost per semester/term.
- Per Credit: Cost per credit hour.

## Updating Fees
- You can update fees at any time.
- Previous fee amounts are not overwritten on existing applications.
- Use the "Effective Date" field to track when new fees take effect.`,
        relatedLinks: [
          { label: 'Viewing Tuition Fees in NPR', href: '#tuition-npr' },
        ],
      },
    ],
  },
  {
    id: 'applications',
    label: 'Student Applications',
    icon: <MessageCircle className="text-rose-500" />,
    color: 'rose',
    desc: 'Tracking leads and student application lifecycles',
    href: '/applications',
    articles: [
      {
        id: 'application-lifecycle',
        title: 'Application Lifecycle Overview',
        description: 'Understand the complete student application journey from lead to enrollment.',
        steps: [
          {
            title: 'Open the Applications page',
            instruction: 'Click "Applications" from the sidebar. The main view shows all applications in a pipeline or kanban board organized by status.',
            screenshot: 'applications.png',
          },
          {
            title: 'Understand the application stages',
            instruction: 'Applications move through: Lead, Applied, Under Review, Offer Made, Offer Accepted, Enrolled, Rejected, or Withdrawn. Each stage has specific actions and document requirements.',
            screenshot: 'applications.png',
          },
          {
            title: 'Update application statuses',
            instruction: 'Click on any application to open its detail view. Use the "Update Status" button to move the application to the next stage. Status changes are logged in the activity timeline.',
            screenshot: 'applications.png',
          },
          {
            title: 'Review documents',
            instruction: 'In the application detail view, navigate to the Documents tab. Each required document can be verified or rejected. All documents must be verified before an application can reach "Enrolled" status.',
            screenshot: 'applications.png',
          },
        ],
        relatedLinks: [
          { label: 'Tracking Leads & Applications', href: '#tracking-leads' },
          { label: 'Document Verification Process', href: '#document-verification' },
        ],
      },
      {
        id: 'tracking-leads',
        title: 'Tracking Leads & Applications',
        description: 'How to manage prospective students and convert them to applicants.',
        content: `The Leads section helps you track prospective students from initial contact through to application submission.

## Adding a Lead
1. Go to Leads from the sidebar.
2. Click "Add Lead".
3. Enter the prospective student's details:
   - Name and contact information.
   - Interested university and program.
   - Source of the lead (website, referral, walk-in, etc.).
   - Assigned counselor.
4. Save the lead.

## Converting a Lead to Application
- When a lead is ready to apply, open their profile.
- Click "Convert to Application".
- The lead's information is pre-populated into a new application form.
- Complete any missing details and submit.

## Lead Management
- View all leads in a table or kanban view.
- Filter by status (New, Contacted, Qualified, Converted, Lost).
- Set follow-up reminders for pending leads.`,
        relatedLinks: [
          { label: 'Application Lifecycle Overview', href: '#application-lifecycle' },
        ],
      },
      {
        id: 'application-statuses',
        title: 'Managing Application Statuses',
        description: 'How to update and manage student application statuses.',
        content: `Application statuses track where each student is in the enrollment process.

## Updating a Status
1. Open the application detail view.
2. Click the current status badge or the "Update Status" button.
3. Select the new status from the dropdown.
4. Optionally add a note or comment about the status change.
5. Click "Update" to save.

## Bulk Status Updates
- Select multiple applications using the checkboxes.
- Choose "Update Status" from the bulk actions menu.
- Select the new status and confirm.

## Automatic Status Triggers
- When an offer letter is uploaded, status may auto-update to "Offer Made".
- When all required documents are verified, status may auto-update to "Ready for Review".`,
        relatedLinks: [
          { label: 'Application Lifecycle Overview', href: '#application-lifecycle' },
        ],
      },
      {
        id: 'document-verification',
        title: 'Document Verification Process',
        description: 'How to upload, verify, and manage student application documents.',
        content: `Document verification ensures that all required application materials are complete and valid.

## Required Documents
- Academic transcripts and certificates.
- English language test scores (IELTS, TOEFL, etc.).
- Passport copy.
- Statement of Purpose.
- Recommendation letters.
- Financial documents.

## Uploading Documents
- Documents can be uploaded by staff on behalf of students.
- Supported formats: PDF, JPG, PNG (max 10MB per file).
- Each document should be labeled with its type.

## Verification Process
1. Open the application detail view.
2. Navigate to the "Documents" tab.
3. Each document shows its upload status and verification status.
4. Click "Verify" to mark a document as verified.
5. Add verification notes if needed.
6. Documents can be marked as "Verified", "Rejected", or "Needs Review".`,
        relatedLinks: [
          { label: 'Application Lifecycle Overview', href: '#application-lifecycle' },
        ],
      },
    ],
  },
  {
    id: 'security',
    label: 'Access & Roles',
    icon: <Shield className="text-indigo-500" />,
    color: 'indigo',
    desc: 'Staff permissions and system access management',
    href: '/access',
    articles: [
      {
        id: 'roles-permissions',
        title: 'Roles & Permissions Overview',
        description: 'Understanding how roles and permissions control system access.',
        steps: [
          {
            title: 'Navigate to Access & Roles',
            instruction: 'Click "Access" from the sidebar. The Access page shows a summary of staff accounts, roles, and permissions.',
            screenshot: 'access.png',
          },
          {
            title: 'View available roles',
            instruction: 'The Roles section lists all defined roles (Admin, Manager, Staff, Viewer, and any custom roles). Each role shows the number of assigned staff members.',
            screenshot: 'access.png',
          },
          {
            title: 'Check role permissions',
            instruction: 'Click on a role to view its permissions. Each module has View, Create, Edit, and Delete permissions. The Admin role has full access to all modules.',
            screenshot: 'access.png',
          },
          {
            title: 'Create custom roles',
            instruction: 'Click "Add Role" to create a custom role. Name the role and configure module-level permissions. Assign staff members to the role after saving.',
            screenshot: 'access.png',
          },
        ],
        relatedLinks: [
          { label: 'Managing Staff Accounts', href: '#staff-accounts' },
          { label: 'Setting Up Access Control', href: '#access-control' },
        ],
      },
      {
        id: 'staff-accounts',
        title: 'Managing Staff Accounts',
        description: 'How to create, edit, and manage staff user accounts.',
        content: `Staff accounts control who can access the system and what they can do.

## Creating a Staff Account
1. Go to Access or Staff from the sidebar.
2. Click "Add Staff" or "Invite User".
3. Enter the staff member's details:
   - Name (required)
   - Email address (required, used for login)
   - Phone number
   - Department
4. Assign one or more roles.
5. Click "Save" — the staff member will receive a login invite via email.

## Editing a Staff Account
1. Find the staff member in the list.
2. Click to open their profile.
3. Update any details or role assignments.
4. Save changes.

## Deactivating Accounts
- Instead of deleting, you can deactivate a staff account.
- Deactivated users cannot log in but their historical records are preserved.
- Reactivate the account at any time.`,
        relatedLinks: [
          { label: 'Roles & Permissions Overview', href: '#roles-permissions' },
        ],
      },
      {
        id: 'access-control',
        title: 'Setting Up Access Control',
        description: 'How to configure module-level permissions for each role.',
        content: `Access control lets you define exactly which modules and actions each role can access.

## Configuring Role Permissions
1. Go to Access > Roles from the sidebar.
2. Select a role to edit, or click "Add Role" to create a new one.
3. You will see a list of all system modules.
4. For each module, set permissions:
   - View: Can see the module and its data.
   - Create: Can add new records.
   - Edit: Can modify existing records.
   - Delete: Can remove records.
5. Save the role configuration.

## Creating Custom Roles
1. Click "Add Role" on the Roles page.
2. Enter a name for the role (e.g., "Admissions Officer").
3. Configure module permissions as described above.
4. Assign staff members to this role.

## Best Practices
- Follow the principle of least privilege.
- Use roles to group staff with similar responsibilities.
- Review role assignments periodically.`,
        relatedLinks: [
          { label: 'Roles & Permissions Overview', href: '#roles-permissions' },
        ],
      },
      {
        id: 'security-best-practices',
        title: 'Security Best Practices',
        description: 'Recommendations for keeping your system and data secure.',
        content: `Follow these best practices to maintain a secure system environment.

## Account Security
- Use strong passwords with a mix of letters, numbers, and symbols.
- Enable two-factor authentication if available.
- Never share login credentials.
- Log out when leaving your workstation.

## Role Management
- Regularly review active staff accounts and remove inactive ones.
- Audit role permissions quarterly.
- Ensure departing staff are deactivated promptly.
- Use the principle of least privilege.

## Data Protection
- Sensitive student data should only be accessed by authorized personnel.
- Use the document verification system to control access to uploaded files.
- Regularly backup the database (Settings > Backups).
- Export reports to secure, encrypted storage.

## Monitoring
- Check the activity log regularly for unusual access patterns.
- Review failed login attempts.
- Monitor API key usage in the API Keys section.`,
        relatedLinks: [
          { label: 'Roles & Permissions Overview', href: '#roles-permissions' },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: <BarChart3 className="text-pink-500" />,
    color: 'pink',
    desc: 'Dashboard insights, attendance summaries, and exportable reports',
    href: '/reports',
    articles: [
      {
        id: 'dashboard-overview',
        title: 'Dashboard Overview',
        description: 'Understanding the main dashboard and its key metrics.',
        steps: [
          {
            title: 'Open the Dashboard',
            instruction: 'Click "Dashboard" from the sidebar. The main dashboard shows summary cards for universities, programs, applications, and students.',
            screenshot: 'dashboard.png',
          },
          {
            title: 'View charts and trends',
            instruction: 'Below the summary cards, charts show application trends over time, applications by status, top universities by applications, and recent activity.',
            screenshot: 'dashboard.png',
          },
          {
            title: 'Use date range filters',
            instruction: 'Use the date range selector at the top of the dashboard to view data for specific periods. Charts and summary cards update automatically.',
            screenshot: 'dashboard.png',
          },
          {
            title: 'Access the HR Dashboard',
            instruction: 'If you have HR permissions, click "HR" then "Dashboard" to view today\'s attendance count, present/late/absent breakdown, pending leave requests, and recent check-in activity.',
            screenshot: 'hr-dashboard.png',
          },
        ],
        relatedLinks: [
          { label: 'Attendance Summaries', href: '#attendance-summaries' },
          { label: 'Exporting Reports', href: '#exporting-reports' },
        ],
      },
      {
        id: 'attendance-summaries',
        title: 'Attendance Summaries',
        description: 'How to view and understand attendance summary reports.',
        steps: [
          {
            title: 'Go to HR > Attendance',
            instruction: 'Navigate to HR > Attendance. The top of the table shows summary cards: Present (green), Late (amber), and Absent (rose) counts for the selected date range.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Filter by date range',
            instruction: 'Use the from/to date pickers to view summaries over any period. The summary counts update automatically based on the filtered records.',
            screenshot: 'hr-attendance.png',
          },
          {
            title: 'Drill down into records',
            instruction: 'The table below the summaries shows individual attendance records with employee names, check-in/check-out times, statuses, and verification details.',
            screenshot: 'hr-attendance.png',
          },
        ],
        relatedLinks: [
          { label: 'Dashboard Overview', href: '#dashboard-overview' },
          { label: 'Attendance Reports & Filters', href: '#attendance-reports' },
        ],
      },
      {
        id: 'exporting-reports',
        title: 'Exporting & Custom Reports',
        description: 'How to generate and export custom reports from the system.',
        steps: [
          {
            title: 'Navigate to Reports',
            instruction: 'Click "Reports" from the sidebar. The Reports page shows available report types and generation options.',
            screenshot: 'reports.png',
          },
          {
            title: 'Select a report type',
            instruction: 'Choose from Application Reports, University Reports, Financial Reports, Attendance Reports, or Activity Reports. Each report type has specific filters and fields.',
            screenshot: 'reports.png',
          },
          {
            title: 'Set filters and date range',
            instruction: 'Configure the date range and apply filters relevant to the report type. For attendance reports, you can filter by employee, department, and status.',
            screenshot: 'reports.png',
          },
          {
            title: 'Generate and export',
            instruction: 'Click "Generate" to preview the report. Review the data and click "Export" to download in CSV format for spreadsheet analysis or PDF for formatted, printable reports.',
            screenshot: 'reports.png',
          },
        ],
        relatedLinks: [
          { label: 'Dashboard Overview', href: '#dashboard-overview' },
          { label: 'Attendance Summaries', href: '#attendance-summaries' },
        ],
      },
    ],
  },
];

const FAQS = [
  { 
    question: "How do I add university contact details?", 
    answer: "Open the university detail view and click 'Edit Profile'. You can now add comprehensive contact information including official email, phone number, and physical address in the updated contact section." 
  },
  { 
    question: "Can I view tuition fees in NPR?", 
    answer: "Yes. On any university detail page, click the 'Show in NPR' button. The system fetches real-time forex rates to automatically convert and display all tuition fees in Nepalese Rupees." 
  },
  { 
    question: "How are commission types handled?", 
    answer: "The system supports both 'Flat' and 'Percentage' based commissions. You can configure these in the Partnership section when adding or editing a university profile." 
  },
  { 
    question: "How do I manage university partners?", 
    answer: "Navigate to Settings > Partners to register and manage your global partners. These partners can then be linked to specific universities in the Partnership section." 
  },
  { 
    question: "How do I search for specific programs?", 
    answer: "Use the global Search module or the search bar within a university profile to filter programs by name, faculty, or degree level." 
  },
  { 
    question: "How does face verification work for attendance?", 
    answer: "Face verification uses motion-based liveness detection to confirm you are physically present. When checking in or out, the system captures your photo and verifies it against your enrolled face descriptor. The process runs entirely in your browser — no face data is sent to external servers." 
  },
  { 
    question: "How do I enroll my face for check-in/checkout?", 
    answer: "Go to HR > Employees, open your profile, and click the camera icon next to your name. On the enrollment page, look at the camera and follow the on-screen prompt to move your head slightly. The system captures 5 frames of your face to create a unique descriptor. Once enrolled, you can use face verification for daily check-in and checkout." 
  },
  { 
    question: "Why do I need to enable location for attendance?", 
    answer: "Location is compulsory for both check-in and checkout to verify you are at the office or branch. The system checks your GPS coordinates against the configured geofence radius. If you are outside the allowed area, check-in/checkout will be blocked. This ensures accurate attendance tracking for all employees." 
  },
  { 
    question: "How do I set up office and branch locations?", 
    answer: "Go to Settings > Localization to set the main office latitude, longitude, and geofence radius (default 10m). For branch-specific locations, edit a Branch record and enter its latitude/longitude. If an employee is assigned to a branch with coordinates, that branch location is used for geofence validation instead of the main office." 
  },
  { 
    question: "How do I filter and sort attendance records?", 
    answer: "Open HR > Attendance. Use the date range pickers to view attendance over a period, click the 'Filters' button to search by employee name or filter by status (Present, Late, Absent, Half-Day). Click the Check In or Check Out column headers to sort records in ascending or descending order." 
  },
  { 
    question: "Can I view check-in location in Google Maps?", 
    answer: "Yes. The attendance table shows GPS coordinates for each check-in and check-out. Click the coordinates or the 'Map' link in the Verify column to open the exact location in Google Maps. The Quick Actions card also displays your own coordinates as clickable map links." 
  },
  { 
    question: "What is the application lifecycle?", 
    answer: "Applications move through stages: Lead, Applied, Under Review, Offer Made, Offer Accepted, Enrolled, Rejected, or Withdrawn. Each stage has specific actions and document requirements. You can track and update statuses from the Applications module." 
  },
  { 
    question: "How do I export attendance reports?", 
    answer: "Go to HR > Attendance, set your desired date range and filters, then use the Reports section to generate and export attendance data in CSV format for payroll processing." 
  },
  { 
    question: "How do I reset my password?", 
    answer: "On the login page, click 'Forgot Password'. Enter your email address to receive a password reset link. If you don't receive the email, contact your system administrator." 
  },
];

const totalArticles = ARTICLES.reduce((acc, cat) => acc + cat.articles.length, 0);

export default function SupportContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const selectedCategory = selectedCategoryId
    ? ARTICLES.find(c => c.id === selectedCategoryId) || null
    : null;

  const selectedArticle = selectedArticleId && selectedCategory
    ? selectedCategory.articles.find(a => a.id === selectedArticleId) || null
    : null;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return ARTICLES;
    const q = searchQuery.toLowerCase();
    return ARTICLES.filter(cat => {
      if (cat.label.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q)) return true;
      return cat.articles.some(a =>
        a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.steps && a.steps.some(s => s.instruction.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)))
      );
    });
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(faq =>
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim() || !selectedCategory) return selectedCategory?.articles || [];
    const q = searchQuery.toLowerCase();
    return selectedCategory.articles.filter(a =>
      a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.steps && a.steps.some(s => s.instruction.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)))
    );
  }, [searchQuery, selectedCategory]);

  const hasResults = filteredCategories.length > 0 || filteredFaqs.length > 0;

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedArticleId(null);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedArticleId(null);
  };

  const handleSelectArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSelectedCategoryId(null);
      setSelectedArticleId(null);
    }
  };

  const renderArticleContent = () => {
    if (!selectedArticle || !selectedCategory) return null;

    return (
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <button type="button" onClick={() => setSelectedArticleId(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft size={16} className="text-slate-400" />
            </button>
            <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center">
              {selectedCategory.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCategory.label}</p>
              <h2 className="text-lg font-bold text-slate-800">{selectedArticle.title}</h2>
            </div>
          </div>
          <div className="h-px bg-slate-100 mb-6"></div>

          {selectedArticle.steps ? (
            <div className="space-y-8">
              {selectedArticle.steps.map((step, idx) => (
                <div key={step.title}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-800 mb-1">{step.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{step.instruction}</p>
                    </div>
                  </div>
                  {step.screenshot && (
                    <div className="ml-10 mb-2">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <Image
                          src={`/screenshots/${step.screenshot}`}
                          alt={step.title}
                          width={1440}
                          height={900}
                          className="w-full h-auto object-contain"
                          unoptimized
                        />
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-sm">
                          <ImageIcon size={10} />
                          Screenshot
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : selectedArticle.content ? (
            <div className="prose prose-sm max-w-none">
              <MarkdownContent content={selectedArticle.content} />
            </div>
          ) : null}

          {selectedArticle.relatedLinks && selectedArticle.relatedLinks.length > 0 && (
            <>
              <div className="h-px bg-slate-100 my-6"></div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Related Articles</h3>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.relatedLinks.map((link, i) => (
                  <button type="button"
                    key={link.href}
                    onClick={() => {
                      const targetId = link.href.replace('#', '');
                      const foundCat = ARTICLES.find(c =>
                        c.articles.some(a => a.id === targetId)
                      );
                      if (foundCat) {
                        setSelectedCategoryId(foundCat.id);
                        setSelectedArticleId(targetId);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="h-px bg-slate-100 my-6"></div>
          <div className="flex items-center justify-between">
            <Link href={selectedCategory.href} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Open {selectedCategory.label} <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderArticleList = () => {
    if (!selectedCategory) return null;
    const articles = searchedArticles;

    return (
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <button type="button" onClick={handleBackToCategories} className="p-2 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Previous"> <ArrowLeft size={16} className="text-slate-400" />
            </button>
            <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              {selectedCategory.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCategory.label}</h2>
              <p className="text-sm text-slate-500">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
            </div>
            <Link href={selectedCategory.href} className="ml-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-lg">
              Open Page <ExternalLink size={12} />
            </Link>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No articles match your search.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {articles.map((article) => (
                <button type="button"
                  key={article.id}
                  onClick={() => handleSelectArticle(article.id)}
                  className="w-full text-left p-4 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{article.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{article.description}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 mt-0.5 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12 px-4">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 md:p-12 text-center text-white shadow-xl shadow-indigo-100">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
          <div className="absolute -top-24 -left-24 size-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 size-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Support Hub</h1>
          <p className="text-indigo-100 mb-8 text-sm md:text-base">
            {totalArticles} articles across {ARTICLES.length} categories to help you
          </p>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search for articles, guides, and more..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white/95 text-slate-800 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/20 shadow-lg transition-all"
            />
          </div>
        </div>
      </div>

      {!hasResults && searchQuery.trim() && (
        <div className="text-center py-12">
          <LifeBuoy size={40} className="text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-600">No results found</p>
          <p className="text-sm text-slate-400">Try a different search term or browse the categories below.</p>
        </div>
      )}

      {hasResults && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <button type="button" onClick={handleBackToCategories} className="hover:text-indigo-600 transition-colors">All Categories</button>
          {selectedCategory && (
            <>
              <ChevronRight size={12} />
              {selectedArticleId && selectedArticle ? (
                <>
                  <button type="button" onClick={() => setSelectedArticleId(null)} className="hover:text-indigo-600 transition-colors">{selectedCategory.label}</button>
                  <ChevronRight size={12} />
                  <span className="text-slate-600 font-medium">{selectedArticle.title}</span>
                </>
              ) : (
                <span className="text-slate-600 font-medium">{selectedCategory.label}</span>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {selectedArticle ? (
          renderArticleContent()
        ) : selectedCategory ? (
          renderArticleList()
        ) : (
          <>
            {filteredCategories.length > 0 && (
              <div className="lg:col-span-2 space-y-6">
                <CategoriesGrid categories={filteredCategories} onSelect={handleSelectCategory} />
              </div>
            )}
          </>
        )}

        <div className="space-y-6">
          {filteredFaqs.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <HelpCircle className="text-indigo-600 flex-shrink-0" size={18} />
                  <span>FAQs</span>
                </h2>
                <p className="text-xs text-slate-500">Quick answers to common questions.</p>
              </div>
              
              <div className="space-y-2">
                {filteredFaqs.map((faq, idx) => {
                  const realIdx = FAQS.indexOf(faq);
                  return (
                    <div key={faq.question} className="card overflow-hidden border border-slate-100">
                      <button type="button" 
                        onClick={() => setOpenFaq(openFaq === realIdx ? null : realIdx)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-700 pr-2">{faq.question}</span>
                        {openFaq === realIdx ? <ChevronUp size={14} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />}
                      </button>
                      {openFaq === realIdx && (
                        <div className="px-3 pb-3 animate-slide-down">
                          <div className="h-px bg-slate-100 mb-3"></div>
                          <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card p-5 space-y-5">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="size-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="text-blue-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Support</p>
                  <p className="text-xs font-bold text-slate-800">support@unitrack.com</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="size-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Support</p>
                  <p className="text-xs font-bold text-slate-800">+1 (888) UNI-TRACK</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="card p-3 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 mb-1">Live Chat</h4>
              <p className="text-[10px] text-indigo-700 leading-relaxed mb-2">Chat with our specialists in real-time.</p>
              <button type="button" className="w-full bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-bold shadow-sm hover:bg-indigo-700 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="h-px bg-slate-100"></div>

            <Link href="/tickets" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              <FileText size={14} />
              Submit a Support Ticket
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return content.split('\n').map((line, i) => {
    const key = `${i}-${line.slice(0, 20)}`;
    if (line.startsWith('## ')) {
      return <h2 key={key} className="text-lg font-bold text-slate-700 mt-5 mb-2">{line.slice(3)}</h2>;
    }
    if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        return (
          <p key={key} className="text-sm text-slate-600 ml-4 mb-1">
            <strong className="text-slate-700">{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}
          </p>
        );
      }
    }
    if (line.startsWith('- ')) {
      return <li key={key} className="text-sm text-slate-600 ml-4 mb-1 list-disc">{line.slice(2)}</li>;
    }
    if (line.startsWith('   - ')) {
      return <li key={key} className="text-sm text-slate-600 ml-8 mb-1" style={{ listStyle: 'circle' }}>{line.slice(5)}</li>;
    }
    if (line.match(/^\d+\. /)) {
      return <li key={key} className="text-sm text-slate-600 ml-4 mb-1" style={{ listStyle: 'decimal' }}>{line.replace(/^\d+\.\s*/, '')}</li>;
    }
    if (line.trim() === '') {
      return <div key={key} className="h-2"></div>;
    }
    return <p key={key} className="text-sm text-slate-600 leading-relaxed mb-2">{line}</p>;
  });
}

function CategoriesGrid({ categories, onSelect }: { categories: Category[], onSelect: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <button type="button"
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="card p-6 group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer text-left"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{cat.articles.length} Article{cat.articles.length !== 1 ? 's' : ''}</span>
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{cat.label}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{cat.desc}</p>
          <div className="flex items-center text-xs font-bold text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 transition-all">
            Browse Articles <ChevronRight size={14} />
          </div>
        </button>
      ))}
    </div>
  );
}
