"use client";

import React, { useState, useMemo } from "react";
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
  ExternalLink,
  Clock,
  BarChart3,
  ArrowLeft,
  FileText,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  UserPlus,
  DollarSign,
  ScrollText,
  Bell,
  Trash2,
  Download,
  Key,
  Upload,
  CheckSquare,
  Ticket,
  BookOpen,
  Puzzle,
  FolderOpen,
  CalendarDays,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    id: "hr",
    label: "HR & Attendance",
    icon: <Clock className="text-cyan-500" />,
    color: "cyan",
    desc: "Face verification check-in/out, geolocation, and attendance reports",
    href: "/hr",
    articles: [
      {
        id: "face-verification",
        title: "Face Verification Check-In & Check-Out",
        description:
          "Learn how face verification works for secure attendance tracking using motion-based liveness detection.",
        steps: [
          {
            title: "Navigate to HR > Attendance",
            instruction:
              'From the sidebar, click "HR" then "Attendance" to open the attendance page. The main table shows all attendance records for the current date.',
            screenshot: "hr-attendance.png",
          },
          {
            title: "Check your current status in Quick Actions",
            instruction:
              'The Quick Actions card on the right shows your check-in status for today. If you are not checked in, you will see a "Face Verification Check In" button. If you are checked in, a "Face Verification Check Out" button is shown.',
            screenshot: "hr-attendance.png",
          },
          {
            title: "Click the face verification button",
            instruction:
              'Click "Face Verification Check In" or "Face Verification Check Out". The system first verifies that your face is enrolled. If not enrolled, you will be prompted to enroll first.',
            screenshot: "hr-attendance.png",
          },
          {
            title: "Complete the liveness detection",
            instruction:
              "A camera modal opens. Look at the camera and keep your face within the detection box. The system tracks subtle head movements across 5 frames to confirm you are a live person (not a photo or video).",
            screenshot: "hr-attendance.png",
          },
          {
            title: "Verification result",
            instruction:
              "If your face matches your enrolled descriptor and liveness is confirmed, the check-in or checkout is recorded. You will see a success toast and the attendance table updates immediately.",
            screenshot: "hr-attendance.png",
          },
        ],
        relatedLinks: [
          { label: "Enrolling Your Face", href: "#enrolling-face" },
          { label: "Geolocation & Geofencing", href: "#geolocation-geofencing" },
        ],
      },
      {
        id: "enrolling-face",
        title: "Enrolling Your Face",
        description: "Step-by-step guide to enroll your face for attendance verification.",
        steps: [
          {
            title: "Go to HR > Employees",
            instruction:
              'Click "HR" from the sidebar, then select "Employees". Find your employee record in the list. Each employee row shows their name, department, and a camera icon on the right.',
            screenshot: "hr-employees.png",
          },
          {
            title: "Click the camera icon",
            instruction:
              "Next to your employee name or avatar, click the camera icon. This opens the face enrollment page in a new tab. If no camera icon is visible, you may need to edit your profile first.",
            screenshot: "hr-employees.png",
          },
          {
            title: "Position your face in the camera",
            instruction:
              "On the enrollment page, ensure your device camera is accessible. Position your face in the center of the detection box. Good lighting and a clear view of your face are important.",
            screenshot: "hr-face-enrollment.png",
          },
          {
            title: "Follow the movement prompts",
            instruction:
              "Once your face is detected, the system prompts you to move your head slightly (left, right, up, down). Move slowly and naturally. The system captures 5 frames from different angles to create a unique face descriptor.",
            screenshot: "hr-face-enrollment.png",
          },
          {
            title: "Confirm enrollment",
            instruction:
              "After all frames are captured, a success message confirms enrollment. Your face descriptor is saved to your profile. You can now use face verification for daily check-in and checkout.",
            screenshot: "hr-face-enrollment.png",
          },
        ],
        relatedLinks: [{ label: "Face Verification Process", href: "#face-verification" }],
      },
      {
        id: "geolocation-geofencing",
        title: "Geolocation & Geofencing",
        description: "Why location is required and how geofence validation works for attendance.",
        steps: [
          {
            title: "Configure office location",
            instruction:
              "Go to Settings > Localization. Enter the Office Latitude and Office Longitude for your main office. Set the Geofence Radius in meters (default: 100m). This is the fallback location used when an employee has no branch assigned.",
            screenshot: "settings-localization.png",
          },
          {
            title: "Set branch locations (optional)",
            instruction:
              "If you have multiple offices, go to Settings > Branches and add or edit a branch. Enter its latitude and longitude coordinates. Employees assigned to this branch will use its location for geofence validation.",
            screenshot: "settings-branches.png",
          },
          {
            title: "Assign employees to branches",
            instruction:
              "Go to HR > Employees, edit an employee profile, and select their branch from the Branch dropdown. If a branch with coordinates is selected, that location takes priority over the main office.",
            screenshot: "hr-employees.png",
          },
          {
            title: "Location is checked on check-in/out",
            instruction:
              "When an employee checks in or out, their device GPS is captured and compared against the reference location. The Haversine formula calculates the distance. If they are outside the radius, the action is blocked.",
            screenshot: "hr-attendance.png",
          },
        ],
        relatedLinks: [
          { label: "Managing Branches & Locations", href: "#managing-branches" },
          { label: "Attendance Reports & Filters", href: "#attendance-reports" },
        ],
      },
      {
        id: "attendance-reports",
        title: "Attendance Reports & Filters",
        description: "How to view, filter, sort, and understand attendance records.",
        steps: [
          {
            title: "Open the Attendance page",
            instruction:
              "Navigate to HR > Attendance. The main panel shows the attendance table with employee names, check-in/check-out times, status, and verification columns.",
            screenshot: "hr-attendance.png",
          },
          {
            title: "Set a date range",
            instruction:
              "Use the from and to date pickers at the top of the Attendance Report card to select a date range. The summary cards and table update automatically to show records for the selected period.",
            screenshot: "hr-attendance.png",
          },
          {
            title: "Use filters to narrow results",
            instruction:
              'Click the "Filters" button to expand the filter bar. Use the Employee Search field to find a specific person by name or employee ID. Use the Status dropdown to filter by Present, Late, Absent, or Half-Day.',
            screenshot: "hr-attendance.png",
          },
          {
            title: "Sort by check-in or check-out",
            instruction:
              'Click the "Check In" or "Check Out" column headers to sort records. Click once for ascending order (earliest first), click again for descending (latest first). The active sort column shows an arrow indicator.',
            screenshot: "hr-attendance.png",
          },
          {
            title: "View location on Google Maps",
            instruction:
              'Each check-in and check-out entry shows GPS coordinates. Click the coordinates or the "Map" link to open the exact location in Google Maps. The Quick Actions card also shows your own coordinates as clickable links.',
            screenshot: "hr-attendance.png",
          },
        ],
        relatedLinks: [{ label: "Geolocation & Geofencing", href: "#geolocation-geofencing" }],
      },
      {
        id: "managing-branches",
        title: "Managing Branches & Office Locations",
        description: "How to set up branches, assign employees, and configure geofence locations.",
        steps: [
          {
            title: "Go to Settings > Localization",
            instruction:
              "Navigate to Settings from the sidebar and click the Localization tab. Here you can set the main office latitude, longitude, and geofence radius. These settings apply as the default for all employees without a branch assignment.",
            screenshot: "settings-localization.png",
          },
          {
            title: "Set the office coordinates",
            instruction:
              "Enter the Office Latitude and Office Longitude for your main office location. Use Google Maps to find the exact coordinates if needed. Set the Geofence Radius (in meters) — 100m is the default.",
            screenshot: "settings-localization.png",
          },
          {
            title: "Add or edit branches",
            instruction:
              'Scroll down to the Branches section. Click "Add Branch" to create a new branch or click an existing branch to edit. Enter the branch name, address, and its latitude/longitude coordinates.',
            screenshot: "settings-branches.png",
          },
          {
            title: "Assign employees to branches",
            instruction:
              "Go to HR > Employees and edit an employee. In the Branch dropdown, select the appropriate branch. Only active branches with coordinates appear in the dropdown. Save the employee profile.",
            screenshot: "hr-employees.png",
          },
        ],
        relatedLinks: [{ label: "Geolocation & Geofencing", href: "#geolocation-geofencing" }],
      },
    ],
  },
  {
    id: "universities",
    label: "University Management",
    icon: <Globe className="text-blue-500" />,
    color: "blue",
    desc: "Managing profiles, contact details, and institutional branding",
    href: "/universities",
    articles: [
      {
        id: "adding-universities",
        title: "Adding & Editing Universities",
        description: "How to create and manage university profiles in the system.",
        steps: [
          {
            title: "Navigate to Universities",
            instruction:
              'Click "Universities" from the sidebar. The universities page shows all registered universities in a card grid or table view.',
            screenshot: "universities.png",
          },
          {
            title: 'Click "Add University"',
            instruction:
              'Click the "Add University" button in the top-right corner. A form opens with fields for university name, country, website, contact information, and description.',
            screenshot: "universities-add.png",
          },
          {
            title: "Fill in the required details",
            instruction:
              "Enter the university name (required), select its country, add the official website URL, and provide contact email and phone number. Optional fields include accreditation, affiliations, and a description.",
            screenshot: "universities-add.png",
          },
          {
            title: "Save the university profile",
            instruction:
              'Click "Save" to create the university. The new university appears in the list. Click on any university card to open its detail view where you can manage programs, partnerships, and documents.',
            screenshot: "universities-add.png",
          },
        ],
        relatedLinks: [
          { label: "Managing Contact Information", href: "#university-contacts" },
          { label: "Configuring Partner Commissions", href: "#university-commissions" },
        ],
      },
      {
        id: "university-contacts",
        title: "Managing Contact Information & Branding",
        description: "How to update university contact details and customize branding.",
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
        relatedLinks: [{ label: "Adding & Editing Universities", href: "#adding-universities" }],
      },
      {
        id: "university-commissions",
        title: "Configuring Partner Commissions",
        description: "How to set up commission structures for university partnerships.",
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
        relatedLinks: [{ label: "Adding & Editing Universities", href: "#adding-universities" }],
      },
      {
        id: "university-search",
        title: "University Search & Filtering",
        description: "How to find universities using search, filters, and sorting.",
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
        relatedLinks: [{ label: "Adding & Editing Universities", href: "#adding-universities" }],
      },
    ],
  },
  {
    id: "courses",
    label: "Program Catalog",
    icon: <Book className="text-amber-500" />,
    color: "amber",
    desc: "Adding courses, faculties, and specific program requirements",
    href: "/courses",
    articles: [
      {
        id: "adding-courses",
        title: "Adding Courses & Programs",
        description: "How to create and manage academic programs in the catalog.",
        steps: [
          {
            title: "Navigate to Courses",
            instruction:
              'Click "Courses" from the sidebar. The Program Catalog shows all courses in a searchable, filterable list.',
            screenshot: "courses.png",
          },
          {
            title: 'Click "Add Course"',
            instruction:
              'Click the "Add Course" button. Fill in the program name, select the university from the dropdown, choose the faculty/department, degree level, duration, and tuition fee.',
            screenshot: "courses-add.png",
          },
          {
            title: "Add program requirements",
            instruction:
              "Add entry requirements, language requirements, and application deadlines. You can also upload supporting documents and brochures.",
            screenshot: "courses-add.png",
          },
          {
            title: "Save the program",
            instruction:
              'Click "Save" to add the program to the catalog. It will appear in search results and be available for student applications.',
            screenshot: "courses-add.png",
          },
        ],
        relatedLinks: [
          { label: "Managing Faculties & Departments", href: "#managing-faculties" },
          { label: "Program Search & Filters", href: "#program-search" },
        ],
      },
      {
        id: "managing-faculties",
        title: "Managing Faculties & Departments",
        description: "How to organize programs by faculty and department structures.",
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
        relatedLinks: [{ label: "Adding Courses & Programs", href: "#adding-courses" }],
      },
      {
        id: "program-requirements",
        title: "Setting Course Requirements",
        description: "How to configure entry requirements, prerequisites, and program details.",
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
        relatedLinks: [{ label: "Adding Courses & Programs", href: "#adding-courses" }],
      },
      {
        id: "program-search",
        title: "Program Search & Filters",
        description: "How to find programs using search, filters, and sorting.",
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
        relatedLinks: [{ label: "Adding Courses & Programs", href: "#adding-courses" }],
      },
    ],
  },
  {
    id: "partners",
    label: "Partners & Commissions",
    icon: <User className="text-purple-500" />,
    color: "purple",
    desc: "Tracking university partners and commission structures",
    href: "/settings",
    articles: [
      {
        id: "registering-partners",
        title: "Registering University Partners",
        description: "How to register and manage partner organizations in the system.",
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
          { label: "Setting Up Commission Structures", href: "#commission-structures" },
        ],
      },
      {
        id: "commission-structures",
        title: "Setting Up Commission Structures",
        description: "How to configure flat and percentage-based commissions.",
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
        relatedLinks: [{ label: "Registering Partners", href: "#registering-partners" }],
      },
      {
        id: "partner-performance",
        title: "Tracking Partner Performance",
        description: "How to monitor partner activity, enrollments, and commission earnings.",
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
        relatedLinks: [{ label: "Registering Partners", href: "#registering-partners" }],
      },
    ],
  },
  {
    id: "finance",
    label: "Forex & Tuition",
    icon: <CreditCard className="text-emerald-500" />,
    color: "emerald",
    desc: "Real-time currency conversion (NPR) and fee management",
    href: "/settings",
    articles: [
      {
        id: "forex-rates",
        title: "Understanding Forex Rate Conversion",
        description: "How real-time currency conversion works for displaying tuition fees.",
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
        relatedLinks: [{ label: "Viewing Tuition Fees in NPR", href: "#tuition-npr" }],
      },
      {
        id: "tuition-npr",
        title: "Viewing Tuition Fees in NPR",
        description: "Step-by-step guide to viewing and understanding fees in NPR.",
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
        relatedLinks: [{ label: "Understanding Forex Rate Conversion", href: "#forex-rates" }],
      },
      {
        id: "fee-management",
        title: "Managing Fee Structures",
        description: "How to configure and update tuition fees for programs.",
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
        relatedLinks: [{ label: "Viewing Tuition Fees in NPR", href: "#tuition-npr" }],
      },
    ],
  },
  {
    id: "applications",
    label: "Student Applications",
    icon: <MessageCircle className="text-rose-500" />,
    color: "rose",
    desc: "Tracking leads and student application lifecycles",
    href: "/applications",
    articles: [
      {
        id: "application-lifecycle",
        title: "Application Lifecycle Overview",
        description: "Understand the complete student application journey from lead to enrollment.",
        steps: [
          {
            title: "Open the Applications page",
            instruction:
              'Click "Applications" from the sidebar. The main view shows all applications in a pipeline or kanban board organized by status.',
            screenshot: "applications.png",
          },
          {
            title: "Understand the application stages",
            instruction:
              "Applications move through: Lead, Applied, Under Review, Offer Made, Offer Accepted, Enrolled, Rejected, or Withdrawn. Each stage has specific actions and document requirements.",
            screenshot: "applications.png",
          },
          {
            title: "Update application statuses",
            instruction:
              'Click on any application to open its detail view. Use the "Update Status" button to move the application to the next stage. Status changes are logged in the activity timeline.',
            screenshot: "applications.png",
          },
          {
            title: "Review documents",
            instruction:
              'In the application detail view, navigate to the Documents tab. Each required document can be verified or rejected. All documents must be verified before an application can reach "Enrolled" status.',
            screenshot: "applications.png",
          },
        ],
        relatedLinks: [
          { label: "Tracking Leads & Applications", href: "#tracking-leads" },
          { label: "Document Verification Process", href: "#document-verification" },
        ],
      },
      {
        id: "tracking-leads",
        title: "Tracking Leads & Applications",
        description: "How to manage prospective students and convert them to applicants.",
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
        relatedLinks: [{ label: "Application Lifecycle Overview", href: "#application-lifecycle" }],
      },
      {
        id: "application-statuses",
        title: "Managing Application Statuses",
        description: "How to update and manage student application statuses.",
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
        relatedLinks: [{ label: "Application Lifecycle Overview", href: "#application-lifecycle" }],
      },
      {
        id: "document-verification",
        title: "Document Verification Process",
        description: "How to upload, verify, and manage student application documents.",
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
        relatedLinks: [{ label: "Application Lifecycle Overview", href: "#application-lifecycle" }],
      },
    ],
  },
  {
    id: "security",
    label: "Access & Roles",
    icon: <Shield className="text-indigo-500" />,
    color: "indigo",
    desc: "Staff permissions and system access management",
    href: "/access",
    articles: [
      {
        id: "roles-permissions",
        title: "Roles & Permissions Overview",
        description: "Understanding how roles and permissions control system access.",
        steps: [
          {
            title: "Navigate to Access & Roles",
            instruction:
              'Click "Access" from the sidebar. The Access page shows a summary of staff accounts, roles, and permissions.',
            screenshot: "access.png",
          },
          {
            title: "View available roles",
            instruction:
              "The Roles section lists all defined roles (Admin, Manager, Staff, Viewer, and any custom roles). Each role shows the number of assigned staff members.",
            screenshot: "access.png",
          },
          {
            title: "Check role permissions",
            instruction:
              "Go to Settings > Roles to view and manage role permissions. Each module (Universities, Courses, Students, etc.) has granular permissions: View, Create, Update, Delete, Export, and Import. The Admin role has full access to all 50+ permissions across 16 modules.",
            screenshot: "settings-roles.png",
          },
          {
            title: "Create custom roles",
            instruction:
              'Click "Add Role" to create a custom role. Name the role and configure module-level permissions. Assign staff members to the role after saving.',
            screenshot: "access.png",
          },
        ],
        relatedLinks: [
          { label: "Managing Staff Accounts", href: "#staff-accounts" },
          { label: "Setting Up Access Control", href: "#access-control" },
        ],
      },
      {
        id: "staff-accounts",
        title: "Managing Staff Accounts",
        description: "How to create, edit, and manage staff user accounts.",
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

## Resetting a User's Password
1. On the Access page, click the "Edit Permissions" icon next to the user.
2. In the Edit User modal, check "Reset password".
3. Enter the new password in the field that appears.
4. Click "Update User" to save. The password is encrypted before storage.

## Deactivating Accounts
- Instead of deleting, you can deactivate a staff account.
- Deactivated users cannot log in but their historical records are preserved.
- Reactivate the account at any time.`,
        relatedLinks: [{ label: "Roles & Permissions Overview", href: "#roles-permissions" }],
      },
      {
        id: "access-control",
        title: "Setting Up Access Control",
        description: "How to configure module-level permissions for each role.",
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
        relatedLinks: [{ label: "Roles & Permissions Overview", href: "#roles-permissions" }],
      },
      {
        id: "security-best-practices",
        title: "Security Best Practices",
        description: "Recommendations for keeping your system and data secure.",
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
        relatedLinks: [{ label: "Roles & Permissions Overview", href: "#roles-permissions" }],
      },
    ],
  },
  {
    id: "student-portal",
    label: "Student Portal",
    icon: <User className="text-sky-500" />,
    color: "sky",
    desc: "Student credentials, portal login, and profile management",
    href: "/students",
    articles: [
      {
        id: "student-credentials",
        title: "Generating Student Credentials",
        description: "How to generate login credentials for student portal access.",
        steps: [
          {
            title: "Open the student profile",
            instruction:
              "Navigate to Students from the sidebar. Find the student in the list and click on their name to open their detail modal.",
            screenshot: "students.png",
          },
          {
            title: "Click the Credentials button",
            instruction:
              'In the student detail modal, click the amber "Credentials" button in the summary card. A confirmation prompt will appear.',
            screenshot: "students.png",
          },
          {
            title: "Confirm credential generation",
            instruction:
              'Click "Generate Credentials" to confirm. The system generates a random 10-character password, hashes it for storage, and creates a User account with the Student role.',
            screenshot: "students.png",
          },
          {
            title: "Copy the credentials",
            instruction:
              "A success modal displays the student's email and the generated password in plaintext. Copy these details and share them with the student securely. The portal URL is also displayed for reference.",
            screenshot: "students.png",
          },
        ],
        relatedLinks: [{ label: "Student Portal Login", href: "#student-portal-login" }],
      },
      {
        id: "student-portal-login",
        title: "Student Portal Login",
        description: "How students log in and navigate the student portal.",
        content: `The student portal provides students with access to their application status, documents, and personal information.

## Logging In
1. Navigate to the portal URL (provided when credentials were generated).
2. Enter the student's email address.
3. Enter the password provided by the administrator.
4. Click "Sign In" to access the portal.

## Portal Features
- **Dashboard**: Overview of application status and recent activity.
- **Applications**: View and track submitted applications.
- **Documents**: Upload required documents for review.
- **Profile**: Update personal information and contact details.

## Password Security
- Students should change their password after first login (if supported).
- If a student forgets their password, contact the administrator to reset it via the Access page.`,
        relatedLinks: [{ label: "Generating Student Credentials", href: "#student-credentials" }],
      },
    ],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="text-emerald-500" />,
    color: "emerald",
    desc: "Real-time overview, key metrics, and performance charts",
    href: "/dashboard",
    articles: [
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        description: "Understanding the main dashboard and its key metrics.",
        steps: [
          {
            title: "Open the Dashboard",
            instruction:
              'Click "Dashboard" from the sidebar. The main dashboard shows summary cards for universities, programs, applications, and students with real-time counts.',
          },
          {
            title: "View charts and trends",
            instruction:
              "Below the summary cards, charts show application trends over time, applications by status, top universities by applications, and recent activity. Each chart can be toggled on/off.",
          },
          {
            title: "Use date range filters",
            instruction:
              "Use the date range selector at the top of the dashboard to view data for specific periods. Charts and summary cards update automatically based on the selected range.",
          },
          {
            title: "Customize your layout",
            instruction:
              "Drag and rearrange dashboard widgets to suit your workflow. Click the layout button to save your custom arrangement. Each user's layout is saved independently.",
          },
        ],
        relatedLinks: [{ label: "Customizing Dashboard Layout", href: "#dashboard-layout" }],
      },
      {
        id: "dashboard-layout",
        title: "Customizing Dashboard Layout",
        description: "How to personalize your dashboard with drag-and-drop widgets.",
        content: `The dashboard supports a fully customizable layout that saves per user.

## Widgets Available
- **Summary Cards**: Total universities, programs, applications, students.
- **Applications Trend**: Line chart of applications over time.
- **Applications by Status**: Pie chart showing distribution across statuses.
- **Top Universities**: Bar chart of universities with the most applications.
- **Recent Activity**: Timeline of recent system actions.
- **Recent Universities**: Cards showing recently updated universities.

## Customizing
1. Hover over any widget to see the drag handle.
2. Click and drag the widget to your desired position.
3. Other widgets reflow to fill the space.
4. Your layout is automatically saved.
5. To reset, click "Reset Layout" in the dashboard settings.

## HR Dashboard
- If you have HR permissions, click "HR" then "Dashboard" for attendance-specific metrics.
- Shows today's attendance count, present/late/absent breakdown, pending leave requests, and recent check-in activity.`,
        relatedLinks: [{ label: "Dashboard Overview", href: "#dashboard-overview" }],
      },
    ],
  },
  {
    id: "leads",
    label: "Leads Management",
    icon: <UserPlus className="text-blue-500" />,
    color: "blue",
    desc: "Track prospective students from initial contact to application conversion",
    href: "/leads",
    articles: [
      {
        id: "managing-leads",
        title: "Managing Leads",
        description: "How to add, track, and manage prospective student leads.",
        steps: [
          {
            title: "Navigate to Leads",
            instruction:
              'Click "Leads" from the sidebar. The Leads page shows all prospective students in a table or kanban view organized by status.',
          },
          {
            title: "Add a new lead",
            instruction:
              'Click "Add Lead". Enter the prospective student\'s name, contact information, interested university and program, lead source (website, referral, walk-in, etc.), and assign a counselor.',
          },
          {
            title: "Track lead status",
            instruction:
              "Leads move through statuses: New, Contacted, Qualified, Converted, or Lost. Update the status as you engage with the lead. Each change is logged in the activity timeline.",
          },
          {
            title: "Set follow-up reminders",
            instruction:
              "Use the reminder feature to schedule follow-ups. You will receive notifications when a follow-up is due. You can also add notes to track conversations.",
          },
        ],
        relatedLinks: [
          { label: "Lead Conversion Process", href: "#lead-conversion" },
          { label: "Application Lifecycle Overview", href: "#application-lifecycle" },
        ],
      },
      {
        id: "lead-conversion",
        title: "Lead Conversion Process",
        description: "How to convert a qualified lead into a full application.",
        content: `When a lead is ready to apply, convert them to an application with all their information pre-populated.

## Converting a Lead
1. Open the lead profile from the Leads page.
2. Click "Convert to Application".
3. The lead's information is pre-populated into a new application form.
4. Complete any missing details (program selection, documents, etc.).
5. Submit the application.

## What Gets Transferred
- Name and contact details.
- Interested university and program.
- Assigned counselor.
- Notes and conversation history.

## After Conversion
- The lead status automatically updates to "Converted".
- The new application appears in the Applications module.
- The original lead record is retained for reference.`,
        relatedLinks: [
          { label: "Managing Leads", href: "#managing-leads" },
          { label: "Application Lifecycle Overview", href: "#application-lifecycle" },
        ],
      },
      {
        id: "lead-sources",
        title: "Lead Sources & Tracking",
        description: "How to configure and analyze lead sources.",
        content: `Lead sources help you understand where your prospective students are coming from.

## Available Sources
- Website: Form submissions from your website.
- Referral: Referred by existing students or partners.
- Walk-in: In-person visits to your office.
- Social Media: Leads from social platforms.
- Email Campaign: From email marketing campaigns.
- Phone Inquiry: Phone call inquiries.
- Partner: Referred by a partner organization.
- Other: Custom source.

## Tracking Performance
- Each lead records its source automatically.
- Filter leads by source to see which channels perform best.
- View conversion rates by source in the analytics section.

## Best Practices
- Always select the most accurate source when adding leads.
- Use custom sources sparingly to maintain clean analytics.
- Review source performance monthly to optimize marketing spend.`,
        relatedLinks: [{ label: "Managing Leads", href: "#managing-leads" }],
      },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    icon: <FileText className="text-amber-500" />,
    color: "amber",
    desc: "Upload, categorize, verify, and manage student documents",
    href: "/documents",
    articles: [
      {
        id: "uploading-documents",
        title: "Uploading Documents",
        description: "How to upload documents for student applications and records.",
        steps: [
          {
            title: "Navigate to Documents",
            instruction:
              'Click "Documents" from the sidebar. The Documents page shows all uploaded files in a searchable, filterable list with thumbnails.',
          },
          {
            title: "Upload a new document",
            instruction:
              'Click "Upload" or drag and drop files into the upload area. Supported formats: PDF, JPG, PNG, DOC, DOCX (max 10MB per file). Multiple files can be uploaded at once.',
          },
          {
            title: "Label and categorize",
            instruction:
              "After uploading, assign a document type (Transcript, Passport, Photo, Offer Letter, etc.) and add optional tags. Documents can be linked to specific students or applications.",
          },
          {
            title: "Document preview",
            instruction:
              "Click on any document to preview it inline. PDFs render with a built-in viewer. Images display in a lightbox. You can download the original file from the preview.",
          },
        ],
        relatedLinks: [
          { label: "Document Categories & Labels", href: "#document-categories" },
          { label: "Document Verification Workflow", href: "#document-verification-workflow" },
        ],
      },
      {
        id: "document-categories",
        title: "Document Categories & Labels",
        description: "How to organize documents with categories and tags.",
        content: `Documents can be organized using categories and labels for easy retrieval.

## Default Categories
- Academic Transcripts
- English Language Tests (IELTS, TOEFL, PTE)
- Passport & ID
- Statement of Purpose
- Recommendation Letters
- Financial Documents
- Offer Letters
- Visa Documents
- Other

## Using Categories
1. When uploading, select a category from the dropdown.
2. Filter documents by category using the filter bar.
3. Categories are color-coded for quick visual scanning.

## Tags
- Add custom tags to documents for additional organization.
- Tags are searchable from the search bar.
- Multiple tags can be applied to a single document.

## Best Practices
- Always categorize documents at upload time.
- Use consistent naming conventions for files.
- Remove or archive obsolete documents.`,
        relatedLinks: [{ label: "Uploading Documents", href: "#uploading-documents" }],
      },
      {
        id: "document-verification-workflow",
        title: "Document Verification Workflow",
        description: "How to verify, approve, or reject student documents.",
        content: `Document verification ensures all required materials are authentic and complete.

## Verification Statuses
- **Pending**: Awaiting review.
- **Verified**: Approved by staff.
- **Rejected**: Does not meet requirements.
- **Needs Review**: Requires further inspection.

## Verification Process
1. Open the document list or an application detail view.
2. Navigate to the Documents tab.
3. Click on a document to preview it.
4. Review the document carefully.
5. Click "Verify" to approve, "Reject" to decline, or "Needs Review" to flag.
6. Add verification notes when rejecting or flagging.

## Requirements
- Some applications require all documents to be verified before reaching "Enrolled" status.
- Missing documents are highlighted on the application detail page.
- Automatic reminders are sent for pending verifications after 48 hours.`,
        relatedLinks: [
          { label: "Uploading Documents", href: "#uploading-documents" },
          { label: "Application Lifecycle Overview", href: "#application-lifecycle" },
        ],
      },
    ],
  },
  {
    id: "payments",
    label: "Payments",
    icon: <CreditCard className="text-green-500" />,
    color: "green",
    desc: "Record student payments, manage invoices, and track financial transactions",
    href: "/payments",
    articles: [
      {
        id: "recording-payments",
        title: "Recording Payments",
        description: "How to record and manage student payments.",
        steps: [
          {
            title: "Go to Payments",
            instruction:
              'Click "Payments" from the sidebar. The Payments page shows all transactions with date, student, amount, method, and status columns.',
          },
          {
            title: "Record a new payment",
            instruction:
              'Click "Record Payment". Select the student, enter the amount, choose the payment method (Cash, Bank Transfer, Card, Online), and optionally add a reference number.',
          },
          {
            title: "Payment statuses",
            instruction:
              "Payments can be Pending, Completed, Failed, or Refunded. Update the status as the payment processes. Completed payments are reflected in financial reports.",
          },
          {
            title: "Generate receipts",
            instruction:
              'After recording a payment, click "Generate Receipt" to create a printable receipt for the student. Receipts include transaction details and your organization\'s information.',
          },
        ],
        relatedLinks: [{ label: "Payment Methods & Currencies", href: "#payment-methods" }],
      },
      {
        id: "payment-methods",
        title: "Payment Methods & Currencies",
        description: "Supported payment methods and multi-currency handling.",
        content: `The system supports multiple payment methods and currencies.

## Payment Methods
- **Cash**: Physical currency transactions.
- **Bank Transfer**: Direct bank deposits and wire transfers.
- **Credit/Debit Card**: Card payments processed through integrated gateways.
- **Online Payment**: Digital wallets and online payment platforms.
- **Cheque**: Cheque payments with clearing status tracking.

## Multi-Currency Support
- Payments can be recorded in any currency.
- Exchange rates are applied for reporting in your base currency.
- Student fees can be paid in their local currency.

## Reconciliation
- Match payments against invoices and fee schedules.
- Use the reconciliation report to identify unmatched transactions.
- Export payment data for accounting software integration.`,
        relatedLinks: [{ label: "Recording Payments", href: "#recording-payments" }],
      },
    ],
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: <DollarSign className="text-red-500" />,
    color: "red",
    desc: "Track operational expenses, categorize spending, and manage budgets",
    href: "/expenses",
    articles: [
      {
        id: "adding-expenses",
        title: "Adding & Categorizing Expenses",
        description: "How to record and organize business expenses.",
        steps: [
          {
            title: "Navigate to Expenses",
            instruction:
              'Click "Expenses" from the sidebar. The Expenses page shows all recorded expenses with amount, category, date, and description.',
          },
          {
            title: "Add an expense",
            instruction:
              'Click "Add Expense". Enter the amount, select a category (Office Supplies, Travel, Utilities, Marketing, etc.), add a description, and set the expense date.',
          },
          {
            title: "Attach receipts",
            instruction:
              "Upload receipt images or PDFs when recording an expense. Receipts are stored securely and can be viewed from the expense detail page.",
          },
          {
            title: "Categorize for reporting",
            instruction:
              "Assign each expense to the appropriate category. Consistent categorization ensures accurate financial reports and budget tracking.",
          },
        ],
        relatedLinks: [{ label: "Expense Reports", href: "#expense-reports" }],
      },
      {
        id: "expense-reports",
        title: "Expense Reports",
        description: "Generate and export expense reports for accounting.",
        content: `Expense reports help you track spending patterns and prepare financial statements.

## Generating Reports
1. Go to Expenses and set your date range.
2. Use filters to narrow by category, amount range, or staff member.
3. Click "Generate Report" to view a summary.
4. Export to CSV or PDF for accounting purposes.

## Report Contents
- Total expenses by category.
- Monthly spending trends.
- Comparison to budget (if configured).
- Largest individual expenses.

## Budget Tracking
- Set monthly or annual budgets per category.
- The dashboard shows budget utilization percentage.
- Alerts are triggered when spending exceeds 80% of budget.`,
        relatedLinks: [{ label: "Adding & Categorizing Expenses", href: "#adding-expenses" }],
      },
    ],
  },
  {
    id: "visa",
    label: "Visa Services",
    icon: <ScrollText className="text-indigo-500" />,
    color: "indigo",
    desc: "Visa checklists, application timelines, and student visa tracking",
    href: "/visa-timeline",
    articles: [
      {
        id: "visa-timeline",
        title: "Visa Timeline Overview",
        description: "Understand the student visa application process and timeline.",
        steps: [
          {
            title: "Navigate to Visa Timeline",
            instruction:
              'Click "Visa Timeline" from the sidebar. The page shows all visa applications with their current stage and progress.',
          },
          {
            title: "Visa application stages",
            instruction:
              "Applications move through: Document Collection, Application Submitted, Biometrics, Under Processing, Approved, Visa Issued, or Rejected. Each stage has specific requirements.",
          },
          {
            title: "Update visa status",
            instruction:
              'Click on a student\'s visa record to open details. Use "Update Stage" to move to the next stage. Add notes about embassy communications or document submissions.',
          },
          {
            title: "Track deadlines",
            instruction:
              "The timeline view shows expected processing times and deadlines. Color-coded indicators highlight urgent items requiring immediate attention.",
          },
        ],
        relatedLinks: [{ label: "Visa Checklists", href: "#visa-checklists" }],
      },
      {
        id: "visa-checklists",
        title: "Visa Checklists",
        description: "Manage visa requirement checklists for different countries.",
        content: `Visa checklists ensure all required documents are prepared for each country\'s embassy.

## Creating Checklists
1. Go to Settings or the Visa section.
2. Click "Manage Checklists".
3. Select the destination country.
4. Add required items with descriptions.
5. Mark items as mandatory or optional.

## Using Checklists
- Assign a checklist to a student\'s visa application.
- Track completion progress with checkboxes.
- View checklist status on the visa timeline.

## Country-Specific Requirements
- Each country has different visa requirements.
- Pre-configured templates are available for common destinations.
- Customize templates to match specific embassy requirements.`,
        relatedLinks: [{ label: "Visa Timeline Overview", href: "#visa-timeline" }],
      },
      {
        id: "visa-types",
        title: "Visa Types & Configuration",
        description: "Configure different visa types and their processing parameters.",
        content: `The system supports multiple visa types for different study destinations.

## Visa Types
- Student Visa (subclass 500) — Australia
- Tier 4 Student Visa — UK
- F-1 Student Visa — USA
- Study Permit — Canada
- Student Pass — Singapore
- And more...

## Configuration
1. Go to Settings > Visa Types.
2. Add or edit visa types with:
   - Name and description.
   - Default processing time.
   - Required documents checklist.
   - Fee information.
3. Assign visa types to specific countries and universities.

## Per-Student Tracking
- Each student\'s visa application is tracked individually.
- Notes and document uploads are stored per application stage.
- Staff can add internal comments about embassy interactions.`,
        relatedLinks: [
          { label: "Visa Timeline Overview", href: "#visa-timeline" },
          { label: "Visa Checklists", href: "#visa-checklists" },
        ],
      },
    ],
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: <CalendarDays className="text-rose-500" />,
    color: "rose",
    desc: "Manage events, deadlines, academic schedules, and appointments",
    href: "/calendar",
    articles: [
      {
        id: "using-calendar",
        title: "Using the Calendar",
        description: "How to view, create, and manage calendar events.",
        steps: [
          {
            title: "Open the Calendar",
            instruction:
              'Click "Calendar" from the sidebar. The calendar opens in month view by default, showing all events and deadlines.',
          },
          {
            title: "Switch views",
            instruction:
              "Toggle between Month, Week, and Day views using the buttons at the top. Each view provides a different level of detail for your schedule.",
          },
          {
            title: "Create an event",
            instruction:
              'Click on a date or click "Add Event". Enter the event title, set start and end times, choose a color category, and optionally add a description or location.',
          },
          {
            title: "Manage events",
            instruction:
              "Click on any existing event to view details, edit, or delete it. Events can be moved by dragging to a different date or time slot.",
          },
        ],
        relatedLinks: [{ label: "Calendar Filters & Views", href: "#calendar-filters" }],
      },
      {
        id: "calendar-filters",
        title: "Calendar Filters & Views",
        description: "How to filter calendar events by type, status, and visibility.",
        content: `The calendar supports multiple filters to help you focus on specific event types.

## Filter Categories
- **Applications**: Application deadlines and review dates.
- **Visa**: Visa appointment dates and document deadlines.
- **Tasks**: Task due dates and milestones.
- **Meetings**: Staff meetings and appointments.
- **Holidays**: Public holidays and office closures.
- **Reminders**: Custom reminders and follow-ups.

## Using Filters
- Toggle categories on/off using the filter panel on the right.
- Filter by assigned staff member.
- Search for specific events by keyword.

## Visibility
- Events can be set as Public (visible to all) or Private (visible only to you).
- Staff events are visible to all team members.
- Personal reminders are only visible to the creator.`,
        relatedLinks: [{ label: "Using the Calendar", href: "#using-calendar" }],
      },
    ],
  },
  {
    id: "chat",
    label: "Chat & Messaging",
    icon: <MessageSquare className="text-violet-500" />,
    color: "violet",
    desc: "Real-time team communication, direct messages, and group chats",
    href: "/chat",
    articles: [
      {
        id: "getting-started-chat",
        title: "Getting Started with Chat",
        description: "How to use the real-time messaging system.",
        steps: [
          {
            title: "Open Chat",
            instruction:
              'Click "Chat" from the sidebar. The chat interface shows your conversations on the left and the active chat on the right.',
          },
          {
            title: "Start a conversation",
            instruction:
              'Click "New Chat" or search for a team member to start a direct message. Type your message and press Enter to send.',
          },
          {
            title: "Group chats",
            instruction:
              'Click "New Group" to create a group conversation. Name the group and add multiple participants. Group chats support @mentions to notify specific members.',
          },
          {
            title: "Share files",
            instruction:
              "Click the attachment icon to share files, images, or documents in any chat. Supported files are previewed inline in the conversation.",
          },
        ],
        relatedLinks: [{ label: "Chat Settings & Notifications", href: "#chat-settings" }],
      },
      {
        id: "chat-settings",
        title: "Chat Settings & Notifications",
        description: "Configure chat preferences and notification settings.",
        content: `Customize your chat experience with personal preferences.

## Notification Preferences
- Enable/disable sound notifications for new messages.
- Choose to receive notifications for all messages or only direct mentions.
- Set quiet hours when notifications are muted.

## Message Features
- **Reactions**: React to messages with emoji.
- **Reply**: Reply to specific messages in a thread.
- **Edit**: Edit your sent messages within 5 minutes.
- **Delete**: Delete messages you\'ve sent.
- **Search**: Search through chat history by keyword.

## Online Status
- Your online status is shown to other team members.
- Status options: Online, Away, Busy, Offline.
- Set a custom status message (e.g., "In a meeting").`,
        relatedLinks: [{ label: "Getting Started with Chat", href: "#getting-started-chat" }],
      },
    ],
  },
  {
    id: "tasks",
    label: "Tasks & Staff Tasks",
    icon: <CheckSquare className="text-lime-500" />,
    color: "lime",
    desc: "Create, assign, and track tasks across your team",
    href: "/tasks",
    articles: [
      {
        id: "creating-tasks",
        title: "Creating & Assigning Tasks",
        description: "How to create tasks and assign them to team members.",
        steps: [
          {
            title: "Go to Tasks",
            instruction:
              'Click "Tasks" from the sidebar. The Tasks page shows all tasks grouped by status: To Do, In Progress, and Done.',
          },
          {
            title: "Create a task",
            instruction:
              'Click "Add Task". Enter a title, description, set priority (Low, Medium, High, Urgent), and choose a due date.',
          },
          {
            title: "Assign to staff",
            instruction:
              'Use the "Assign To" dropdown to assign the task to a team member. Tasks can also be left unassigned for the general task pool.',
          },
          {
            title: "Track progress",
            instruction:
              "Tasks move through statuses: To Do, In Progress, Review, Done. The assignee can update the status as work progresses. Comments can be added for collaboration.",
          },
        ],
        relatedLinks: [{ label: "Task Statuses & Priorities", href: "#task-statuses" }],
      },
      {
        id: "task-statuses",
        title: "Task Statuses & Priorities",
        description: "Understanding task workflow, statuses, and priority levels.",
        content: `Tasks follow a structured workflow with clear statuses and priorities.

## Task Statuses
- **To Do**: Task is created but not started.
- **In Progress**: Work is actively being done.
- **Review**: Work is complete, pending review.
- **Done**: Task is completed and approved.
- **Cancelled**: Task is no longer needed.

## Priority Levels
- **Low**: No immediate deadline, can be done when available.
- **Medium**: Standard priority with a reasonable deadline.
- **High**: Important task requiring prompt attention.
- **Urgent**: Critical task requiring immediate action.

## Staff Task View
- Staff members see their assigned tasks in the Staff Tasks section.
- A personalized task dashboard shows upcoming deadlines.
- Task notifications are sent for new assignments and approaching due dates.

## Notifications
- Email and in-app notifications for task assignments.
- Reminder notifications 24 hours before due date.
- Overdue task alerts for managers.`,
        relatedLinks: [{ label: "Creating & Assigning Tasks", href: "#creating-tasks" }],
      },
    ],
  },
  {
    id: "tickets",
    label: "Support Tickets",
    icon: <Ticket className="text-pink-500" />,
    color: "pink",
    desc: "Submit, track, and resolve support requests",
    href: "/tickets",
    articles: [
      {
        id: "submitting-tickets",
        title: "Submitting Support Tickets",
        description: "How to create and submit support tickets.",
        steps: [
          {
            title: "Go to Tickets",
            instruction:
              'Click "Tickets" from the sidebar. The Tickets page shows all submitted tickets with their status and priority.',
          },
          {
            title: "Create a ticket",
            instruction:
              'Click "New Ticket". Select the category (Technical, Account, Feature Request, Bug Report, Other), set a subject, and describe the issue in detail.',
          },
          {
            title: "Attach screenshots",
            instruction:
              "Attach relevant screenshots or files to help describe the issue. Supported formats include PNG, JPG, and GIF.",
          },
          {
            title: "Submit and track",
            instruction:
              "After submission, the ticket receives a unique ID. You can track its status and add follow-up comments. Notifications are sent when the ticket is updated.",
          },
        ],
        relatedLinks: [{ label: "Ticket Statuses & Priority", href: "#ticket-statuses" }],
      },
      {
        id: "ticket-statuses",
        title: "Ticket Statuses & Priority",
        description: "Understanding ticket lifecycle and priority levels.",
        content: `Support tickets follow a structured lifecycle from submission to resolution.

## Ticket Statuses
- **New**: Recently submitted, not yet reviewed.
- **Open**: Being investigated by support staff.
- **In Progress**: Active work is being done.
- **Waiting on Customer**: Additional information needed from you.
- **Resolved**: Issue has been addressed.
- **Closed**: Ticket is complete and confirmed.

## Priority Levels
- **Low**: General inquiry, no urgency.
- **Medium**: Standard issue, respond within 48 hours.
- **High**: Important issue, respond within 24 hours.
- **Urgent**: System-critical issue, respond within 4 hours.

## Staff Response
- Support staff can assign tickets to specific team members.
- Internal notes are visible only to staff, not the requester.
- Ticket responses can include links to knowledge base articles.`,
        relatedLinks: [{ label: "Submitting Support Tickets", href: "#submitting-tickets" }],
      },
    ],
  },
  {
    id: "files",
    label: "Files & Storage",
    icon: <FolderOpen className="text-amber-600" />,
    color: "amber",
    desc: "Centralized file storage with folder organization and sharing",
    href: "/files",
    articles: [
      {
        id: "uploading-files",
        title: "Uploading & Organizing Files",
        description: "How to upload, organize, and manage files in the system.",
        steps: [
          {
            title: "Open Files",
            instruction:
              'Click "Files" from the sidebar. The Files page shows your folders and files in a familiar file-browser layout.',
          },
          {
            title: "Upload files",
            instruction:
              'Click "Upload" or drag and drop files into the current folder. Multiple files can be uploaded simultaneously. Progress indicators show upload status.',
          },
          {
            title: "Organize with folders",
            instruction:
              "Create folders to organize files by category, project, or department. Files can be moved between folders by dragging or using the move option.",
          },
          {
            title: "Search and filter",
            instruction:
              "Use the search bar to find files by name. Filter by file type, upload date, or uploader. Recent files are shown in a quick-access section.",
          },
        ],
        relatedLinks: [{ label: "Folder Management", href: "#folder-management" }],
      },
      {
        id: "folder-management",
        title: "Folder Management",
        description: "How to create, rename, and manage file folders.",
        content: `Folders help keep your files organized and accessible.

## Creating Folders
1. Navigate to the parent location.
2. Click "New Folder".
3. Enter a descriptive name.
4. Press Enter or click Create.

## Folder Operations
- **Rename**: Right-click a folder and select Rename.
- **Move**: Drag a folder to a new parent location.
- **Delete**: Move a folder to trash. All contents are moved with it.
- **Share**: Generate a share link for external access (with permissions).

## File Permissions
- Files inherit permissions from their parent folder.
- Folders can be set as Private or Shared with specific team members.
- External sharing generates a time-limited link with optional password protection.

## Storage Limits
- View storage usage in the sidebar or Files header.
- File size limits are configurable in Settings.
- Expired or obsolete files should be archived regularly.`,
        relatedLinks: [{ label: "Uploading & Organizing Files", href: "#uploading-files" }],
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="text-yellow-500" />,
    color: "yellow",
    desc: "System alerts, reminders, and activity notifications",
    href: "/notifications",
    articles: [
      {
        id: "understanding-notifications",
        title: "Understanding Notifications",
        description: "Types of notifications and how they work.",
        steps: [
          {
            title: "View notifications",
            instruction:
              "Click the bell icon in the top bar to open the notification panel. Unread notifications are shown with a blue dot.",
          },
          {
            title: "Notification types",
            instruction:
              "Notifications include: Task assignments, Ticket updates, Application status changes, Document verification requests, Leave request updates, System alerts, and Reminders.",
          },
          {
            title: "Take action",
            instruction:
              "Click on a notification to navigate directly to the relevant page. For example, clicking a task notification opens the task detail view.",
          },
          {
            title: "Mark as read",
            instruction:
              'Notifications are automatically marked as read when clicked. Use "Mark All as Read" to clear all unread notifications at once.',
          },
        ],
        relatedLinks: [{ label: "Notification Preferences", href: "#notification-preferences" }],
      },
      {
        id: "notification-preferences",
        title: "Notification Preferences",
        description: "Configure which notifications you receive and how.",
        content: `Customize your notification experience to reduce noise and stay focused.

## Notification Channels
- **In-App**: Notifications appear in the bell icon panel.
- **Email**: Notifications sent to your registered email address.
- **Both**: Receive notifications in both channels.

## Configuring Preferences
1. Click your avatar in the top bar.
2. Select "Notification Settings".
3. Toggle notification types on/off:
   - Task Assignments
   - Ticket Updates
   - Application Changes
   - Document Verifications
   - Leave Requests
   - System Announcements
   - Reminders
4. Choose your preferred channel for each type.

## Quiet Hours
- Set quiet hours to suppress non-urgent notifications.
- Urgent notifications (system alerts, @mentions) are never suppressed.
- Quiet hours apply to both in-app and email notifications.`,
        relatedLinks: [
          { label: "Understanding Notifications", href: "#understanding-notifications" },
        ],
      },
    ],
  },
  {
    id: "search-module",
    label: "Global Search",
    icon: <Search className="text-sky-500" />,
    color: "sky",
    desc: "Search across all modules, records, and files from one place",
    href: "/search",
    articles: [
      {
        id: "using-global-search",
        title: "Using Global Search",
        description: "How to search across the entire system.",
        steps: [
          {
            title: "Open Search",
            instruction:
              "Click the search icon in the sidebar or press Ctrl+K (Cmd+K on Mac) to open the global search modal.",
          },
          {
            title: "Enter your query",
            instruction:
              "Type keywords to search across universities, courses, students, applications, leads, documents, and more. Results appear in real-time as you type.",
          },
          {
            title: "Filter by module",
            instruction:
              "Use the module filter to narrow results to a specific area (e.g., only Students or only Universities). Recent searches are shown for quick access.",
          },
          {
            title: "Navigate to results",
            instruction:
              "Click any result to navigate directly to that record. Use arrow keys to navigate through results without using the mouse.",
          },
        ],
        relatedLinks: [{ label: "Search Filters & Advanced Queries", href: "#search-filters" }],
      },
      {
        id: "search-filters",
        title: "Search Filters & Advanced Queries",
        description: "Advanced search techniques for precise results.",
        content: `Global search supports advanced filters and query syntax.

## Searchable Modules
- Universities, Courses, Students, Applications, Leads.
- Staff, Partners, Documents, Files, Tasks.
- Tickets, Payments, Expenses, Calendar events.

## Filter Options
- Module type dropdown to search within a specific module.
- Date range filter for time-sensitive searches.
- Status filter for records with status fields.
- Assigned to filter for tasks and tickets.

## Advanced Tips
- Use quotes for exact phrase matching: "Master of Science".
- Combine terms for narrow results: "engineering australia 2024".
- Search by reference numbers: application IDs, ticket IDs.

## Search History
- Recent searches are saved for quick replay.
- Clear search history from the settings panel.
- Frequently accessed records appear in suggestions.`,
        relatedLinks: [{ label: "Using Global Search", href: "#using-global-search" }],
      },
    ],
  },
  {
    id: "audit",
    label: "Audit Log",
    icon: <Eye className="text-slate-500" />,
    color: "slate",
    desc: "Track all user actions, system changes, and security events",
    href: "/audit",
    articles: [
      {
        id: "audit-overview",
        title: "Audit Log Overview",
        description: "Understanding the audit trail and its contents.",
        steps: [
          {
            title: "Open Audit Log",
            instruction:
              'Click "Audit" from the sidebar. The Audit Log shows a chronological list of all actions performed in the system.',
          },
          {
            title: "Read log entries",
            instruction:
              "Each entry shows: timestamp, user who performed the action, action type (create, update, delete, login), target module, and target record details.",
          },
          {
            title: "Filter logs",
            instruction:
              "Use filters to narrow by user, action type, module, or date range. This makes it easy to investigate specific events or user activity.",
          },
          {
            title: "Export logs",
            instruction:
              'Click "Export" to download filtered audit logs as CSV for external analysis or compliance reporting.',
          },
        ],
        relatedLinks: [{ label: "Security Monitoring", href: "#security-monitoring" }],
      },
      {
        id: "security-monitoring",
        title: "Security Monitoring",
        description: "Using audit logs for security monitoring and compliance.",
        content: `Audit logs are essential for security monitoring and regulatory compliance.

## What Gets Logged
- User logins and logouts (with IP address and user agent).
- All create, update, and delete operations on records.
- Permission and role changes.
- Failed login attempts.
- API key usage.
- Password changes.
- Settings modifications.

## Monitoring Best Practices
- Review audit logs daily for unusual activity.
- Set up alerts for specific events (e.g., multiple failed logins).
- Investigate actions performed outside normal working hours.
- Keep audit logs for compliance periods (configurable in Settings).

## Retention
- Audit logs are retained according to your organization\'s policy.
- Configure retention period in Settings > System.
- Older logs are automatically archived or purged based on configuration.`,
        relatedLinks: [{ label: "Audit Log Overview", href: "#audit-overview" }],
      },
    ],
  },
  {
    id: "trash",
    label: "Trash & Restore",
    icon: <Trash2 className="text-gray-500" />,
    color: "gray",
    desc: "Recover deleted records and manage soft-deleted items",
    href: "/trash",
    articles: [
      {
        id: "viewing-trash",
        title: "Viewing Deleted Items",
        description: "How to view and manage items in the trash.",
        steps: [
          {
            title: "Open Trash",
            instruction:
              'Click "Trash" from the sidebar. The Trash page shows all soft-deleted records grouped by module type.',
          },
          {
            title: "Browse deleted items",
            instruction:
              "Items are shown with their original name, deletion date, and the user who deleted them. Filter by module to find specific types of records.",
          },
          {
            title: "View item details",
            instruction:
              "Click on a deleted item to see its original details before deletion. This helps you confirm you are restoring the correct record.",
          },
          {
            title: "Permanent deletion",
            instruction:
              "Items can be permanently deleted from the trash. Warning: permanently deleted items cannot be recovered. Use this option only when certain the item is no longer needed.",
          },
        ],
        relatedLinks: [{ label: "Restoring Deleted Records", href: "#restoring-records" }],
      },
      {
        id: "restoring-records",
        title: "Restoring Deleted Records",
        description: "How to restore soft-deleted records.",
        content: `Accidentally deleted records can be restored from the trash.

## Restoration Process
1. Go to Trash from the sidebar.
2. Find the deleted item using filters or search.
3. Click the "Restore" button.
4. The item is restored to its original location and module.
5. Associated data (if any) is also restored.

## What Can Be Restored
- Universities, Courses, Students, Applications.
- Leads, Documents, Staff records.
- Tasks, Tickets, Expenses.
- Most other record types with soft-delete support.

## Limitations
- Items permanently deleted from trash cannot be recovered.
- If a parent record was also deleted, it must be restored first.
- Some related data may have been cleaned up during deletion.

## Auto-Purge
- Items in trash are automatically purged after 30 days (configurable).
- You will receive a notification before auto-purge occurs.`,
        relatedLinks: [{ label: "Viewing Deleted Items", href: "#viewing-trash" }],
      },
    ],
  },
  {
    id: "backup",
    label: "Backup & Restore",
    icon: <Download className="text-purple-500" />,
    color: "purple",
    desc: "Database backups, automated schedules, and data restoration",
    href: "/settings/backups",
    articles: [
      {
        id: "creating-backups",
        title: "Creating Manual Backups",
        description: "How to create on-demand database backups.",
        steps: [
          {
            title: "Go to Backup Settings",
            instruction:
              'Click "Settings" then "Backups" from the sidebar. The Backups page shows existing backup files and schedule configuration.',
          },
          {
            title: "Create a backup",
            instruction:
              'Click "Backup Now" to create an immediate backup. The system compresses the database into a downloadable file. Large databases may take a few minutes.',
          },
          {
            title: "Download backup",
            instruction:
              "Once created, click the download icon next to the backup entry. Backup files are encrypted and include a timestamp in the filename.",
          },
          {
            title: "Backup details",
            instruction:
              "Each backup entry shows the file size, creation date, and whether it was manual or automatic. Old backups can be deleted to free storage space.",
          },
        ],
        relatedLinks: [{ label: "Automated Backup Schedule", href: "#backup-schedule" }],
      },
      {
        id: "backup-schedule",
        title: "Automated Backup Schedule",
        description: "Configure automatic recurring backups.",
        content: `Automated backups ensure your data is protected without manual intervention.

## Schedule Configuration
1. Go to Settings > Backups.
2. Toggle "Enable Automated Backups" on.
3. Choose frequency: Daily, Weekly, or Monthly.
4. Set the preferred time for backup execution.
5. Configure retention: how many backups to keep.
6. Save the configuration.

## Storage
- Backups are stored on the server\'s local storage by default.
- Optionally configure cloud storage (S3, Google Cloud, etc.) in advanced settings.
- Backup files are encrypted for security.

## Notifications
- Receive email notifications for backup completion or failure.
- Alerts are sent when storage is running low.
- Weekly backup status summary is sent to administrators.

## Restore
- Use the "Restore" button next to a backup to restore your database.
- Restoration overwrites current data with the backup snapshot.
- A confirmation step prevents accidental restores.
- A new backup is automatically created before restoration as a safety measure.`,
        relatedLinks: [{ label: "Creating Manual Backups", href: "#creating-backups" }],
      },
    ],
  },
  {
    id: "api-keys",
    label: "API Keys",
    icon: <Key className="text-orange-500" />,
    color: "orange",
    desc: "Generate and manage API keys for system integrations",
    href: "/api-keys",
    articles: [
      {
        id: "generating-api-keys",
        title: "Generating API Keys",
        description: "How to create API keys for external integrations.",
        steps: [
          {
            title: "Open API Keys",
            instruction:
              'Click "API Keys" from the sidebar. The page shows all existing API keys with their permissions and last used date.',
          },
          {
            title: "Generate a new key",
            instruction:
              'Click "Generate API Key". Optionally enter a label to identify the key\'s purpose (e.g., "Integration with CRM").',
          },
          {
            title: "Copy the key",
            instruction:
              "The generated key is shown once. Copy it immediately and store it securely. For security reasons, the full key cannot be viewed again after closing the dialog.",
          },
          {
            title: "Test the key",
            instruction:
              "Use the test endpoint to verify your API key works. The API returns a confirmation with your key's label and permissions.",
          },
        ],
        relatedLinks: [{ label: "API Key Permissions", href: "#api-key-permissions" }],
      },
      {
        id: "api-key-permissions",
        title: "API Key Permissions",
        description: "Configure what each API key can access and do.",
        content: `API keys can be restricted to specific modules and actions for security.

## Permission Levels
- **Read Only**: Can only fetch data, no modifications.
- **Read & Write**: Can fetch and modify data.
- **Full Access**: All operations including administrative actions.

## Scope Restriction
- Limit keys to specific modules (e.g., Students only, Applications only).
- Restrict by specific actions (GET, POST, PUT, DELETE).
- Set rate limits per key to prevent abuse.

## Best Practices
- Create separate keys for different integrations.
- Use the minimum permissions needed for each integration.
- Rotate keys periodically (every 90 days recommended).
- Revoke unused or compromised keys immediately.

## Monitoring
- View API usage statistics for each key.
- See last used timestamp and IP address.
- Monitor rate limit utilization.
- Receive alerts for unusual usage patterns.`,
        relatedLinks: [{ label: "Generating API Keys", href: "#generating-api-keys" }],
      },
    ],
  },
  {
    id: "bulk-import",
    label: "Bulk Import",
    icon: <Upload className="text-teal-500" />,
    color: "teal",
    desc: "Import large datasets from CSV and Excel files",
    href: "/bulk-import",
    articles: [
      {
        id: "preparing-imports",
        title: "Preparing Import Files",
        description: "How to format your data files for import.",
        steps: [
          {
            title: "Download template",
            instruction:
              'Go to Bulk Import and click "Download Template" for the module you want to import (Students, Courses, Universities, etc.). The template includes the required columns.',
          },
          {
            title: "Fill in your data",
            instruction:
              "Open the template in Excel, Google Sheets, or a text editor. Fill in your data following the column headers. Required fields are marked with an asterisk.",
          },
          {
            title: "Format requirements",
            instruction:
              "Save your file as CSV (Comma Separated Values) or XLSX. Ensure dates are in YYYY-MM-DD format. Use the exact values from the template for dropdown fields.",
          },
          {
            title: "Validate before import",
            instruction:
              "Check for common issues: empty required fields, duplicate entries, incorrect date formats, and special characters that may cause parsing errors.",
          },
        ],
        relatedLinks: [{ label: "Importing Data", href: "#importing-data" }],
      },
      {
        id: "importing-data",
        title: "Importing Data",
        description: "The import process and what to expect.",
        content: `Import large datasets efficiently with the bulk import tool.

## Supported Modules
- Students, Universities, Courses, Applications.
- Leads, Staff, Partners, Documents.
- Branches, Faculties, Departments.

## Import Process
1. Go to Bulk Import from the sidebar.
2. Select the target module.
3. Upload your prepared CSV or XLSX file.
4. Map columns if your headers differ from the template.
5. Preview the first 10 rows to verify mapping.
6. Click "Import" to start the process.

## During Import
- Progress is shown with a percentage bar.
- Large imports run in the background.
- You can navigate away and check back later.
- A notification is sent when the import completes.

## Validation & Error Handling
- Rows with errors are skipped and listed in the error report.
- The error report shows the row number and specific error for each issue.
- Fix the errors and re-import only the failed rows.
- Partial imports are supported — valid rows are imported even if some fail.`,
        relatedLinks: [{ label: "Preparing Import Files", href: "#preparing-imports" }],
      },
    ],
  },
  {
    id: "email-settings",
    label: "Email & Communication",
    icon: <Mail className="text-blue-600" />,
    color: "blue",
    desc: "Configure SMTP, email templates, and send communications",
    href: "/email",
    articles: [
      {
        id: "smtp-configuration",
        title: "SMTP Configuration",
        description: "How to set up email server settings.",
        steps: [
          {
            title: "Open Email Settings",
            instruction:
              "Go to Settings > Email from the sidebar. The Email Settings page shows the SMTP configuration form.",
          },
          {
            title: "Enter SMTP details",
            instruction:
              "Enter your SMTP host, port (587 for TLS, 465 for SSL), username, and password. Select the encryption method: TLS, SSL, or None.",
          },
          {
            title: "Test connection",
            instruction:
              'Click "Test Connection" to verify the settings. A test email is sent to your address. If the test fails, check your credentials and firewall settings.',
          },
          {
            title: "Save configuration",
            instruction:
              "Once the test passes, save the configuration. All system emails will use these settings going forward.",
          },
        ],
        relatedLinks: [{ label: "Email Templates", href: "#email-templates" }],
      },
      {
        id: "email-templates",
        title: "Email Templates",
        description: "Customize and manage email notification templates.",
        content: `Email templates control the content of system-generated emails.

## Available Templates
- Welcome emails for new users.
- Password reset emails.
- Application status notifications.
- Document verification notifications.
- Task and ticket assignments.
- Leave request updates.
- Ticket updates and responses.

## Customizing Templates
1. Go to Settings > Email > Templates.
2. Select the template to edit.
3. Use the rich text editor to customize the content.
4. Insert dynamic variables using the {{variable}} syntax:
   - {{userName}}, {{userEmail}}, {{appName}}.
   - {{status}}, {{dueDate}}, {{link}}.
5. Preview the template to see how it renders.
6. Save your changes.

## Sending Bulk Emails
- Use the Email page to compose and send bulk emails.
- Select recipients from Students, Staff, or custom lists.
- Upload attachments if needed.
- Track delivery status and opens (if configured).`,
        relatedLinks: [{ label: "SMTP Configuration", href: "#smtp-configuration" }],
      },
    ],
  },
  {
    id: "learning-hub",
    label: "Learning Hub",
    icon: <BookOpen className="text-cyan-500" />,
    color: "cyan",
    desc: "Educational resources, guides, and training materials",
    href: "/learning-hub",
    articles: [
      {
        id: "browsing-learning",
        title: "Browsing Learning Resources",
        description: "How to find and use learning materials.",
        steps: [
          {
            title: "Open Learning Hub",
            instruction:
              'Click "Learning Hub" from the sidebar. The page shows available resources categorized by type and topic.',
          },
          {
            title: "Browse categories",
            instruction:
              "Resources are organized into categories: Study Destinations, Application Guides, Visa Information, Country Profiles, and more.",
          },
          {
            title: "Search resources",
            instruction:
              "Use the search bar to find specific resources by keyword. Filter by country, category, or resource type.",
          },
          {
            title: "View resource details",
            instruction:
              "Click on a resource to view its full content. Resources may include text, images, downloadable PDFs, and external links.",
          },
        ],
        relatedLinks: [{ label: "Categories & Filters", href: "#learning-categories" }],
      },
      {
        id: "learning-categories",
        title: "Categories & Filters",
        description: "How resources are organized and filtered.",
        content: `The Learning Hub organizes resources to help you find relevant information quickly.

## Resource Categories
- **Country Profiles**: Detailed information about study destinations.
- **Application Guides**: Step-by-step application instructions.
- **Visa Information**: Visa requirements and processes by country.
- **Scholarships**: Available scholarship opportunities.
- **Test Preparation**: IELTS, TOEFL, PTE preparation materials.
- **FAQs**: Frequently asked questions about studying abroad.

## Adding Resources
- Administrators can add new resources from the Learning Hub.
- Resources can include rich text, images, and file attachments.
- Set visibility: Public or Staff Only.
- Resources can be linked to specific countries or universities.

## Filters
- Filter by country.
- Filter by category.
- Filter by resource type (Article, PDF, Video, Link).
- Sort by date added or title.`,
        relatedLinks: [{ label: "Browsing Learning Resources", href: "#browsing-learning" }],
      },
    ],
  },
  {
    id: "settings",
    label: "Settings & Configuration",
    icon: <Settings className="text-slate-600" />,
    color: "slate",
    desc: "System configuration, localization, branches, roles, and preferences",
    href: "/settings",
    articles: [
      {
        id: "localization-settings",
        title: "Localization Settings",
        description: "Configure office location, geofence, and regional preferences.",
        steps: [
          {
            title: "Open Localization Settings",
            instruction:
              "Go to Settings > Localization from the sidebar. This page contains location-related configuration.",
          },
          {
            title: "Set office coordinates",
            instruction:
              "Enter the Office Latitude and Office Longitude for your main office. Use Google Maps to find the exact coordinates. These are used as the default geofence location.",
          },
          {
            title: "Configure geofence radius",
            instruction:
              "Set the Geofence Radius in meters (default: 100m). This determines how far from the office location employees can check in/out.",
          },
          {
            title: "Set timezone and currency",
            instruction:
              "Select your timezone for accurate attendance timestamps. Set the default currency for financial reporting.",
          },
        ],
        relatedLinks: [{ label: "Managing Branches", href: "#managing-branches-config" }],
      },
      {
        id: "managing-branches-config",
        title: "Managing Branches",
        description: "How to set up and manage branch office locations.",
        content: `Branches allow you to manage multiple office locations with independent settings.

## Adding a Branch
1. Go to Settings > Localization.
2. Scroll to the Branches section.
3. Click "Add Branch".
4. Enter the branch name, address, and coordinates.
5. Save the branch.

## Branch Geofencing
- Each branch can have its own latitude/longitude.
- When an employee is assigned to a branch, that branch\'s location is used for geofence validation.
- If no branch is assigned, the main office location is used.

## Assigning Employees to Branches
- Go to HR > Employees.
- Edit an employee profile.
- Select their branch from the Branch dropdown.
- Only branches with coordinates appear in the dropdown.

## Editing Branches
- Click on an existing branch to edit its details.
- Deactivate branches that are no longer in use.
- Deactivated branches retain historical data.`,
        relatedLinks: [{ label: "Localization Settings", href: "#localization-settings" }],
      },
      {
        id: "roles-permissions-settings",
        title: "Roles & Permissions Configuration",
        description: "Configure system roles and granular module permissions.",
        content: `The system supports granular permissions across 16 modules with 50+ individual permissions.

## Accessing Role Settings
1. Go to Settings > Roles.
2. The Roles tab shows all existing roles and their assigned permissions.
3. Click a role to view its permission set.

## Creating a Role
1. Click "Add Role" on the Roles page.
2. Enter a role name (e.g., "Admissions Officer").
3. Configure permissions per module:
   - Each module (Universities, Courses, Students, etc.) has View, Create, Update, Delete, Export, Import permissions.
   - Check the boxes for each permission you want to grant.
4. Save the role.

## Editing Roles
- Click the edit icon next to any role.
- Modify permissions as needed.
- Changes apply to all users assigned to that role.
- Built-in roles (Admin, Editor, Viewer) can be customized but not deleted.

## Best Practices
- Follow the principle of least privilege.
- Group staff with similar responsibilities into roles.
- Review role assignments periodically.
- Use the Access page to manage individual user role assignments.`,
        relatedLinks: [{ label: "Managing Staff Accounts", href: "#staff-accounts" }],
      },
      {
        id: "system-preferences",
        title: "System Preferences",
        description: "Configure general system settings and preferences.",
        content: `System preferences control general application behavior.

## Available Settings
- **Application Name**: Change the system name displayed in the header and emails.
- **Logo**: Upload your organization\'s logo for branding.
- **Language**: Set the default system language.
- **Date Format**: Choose date display format (MM/DD/YYYY, DD/MM/YYYY, etc.).
- **Pagination**: Set default items per page for tables.
- **Session Timeout**: Configure automatic logout after inactivity.

## Academic Settings
- Default intake seasons and deadlines.
- Degree types and qualification levels.
- Application fee configuration.

## Feature Toggles
- Enable/disable specific modules.
- Control feature availability per user role.
- Manage integrations with external services.

## Accessing Preferences
- Go to Settings > System or Settings > General.
- Configure each option as needed.
- Changes take effect immediately.`,
        relatedLinks: [
          { label: "Roles & Permissions Configuration", href: "#roles-permissions-settings" },
        ],
      },
    ],
  },
  {
    id: "extras",
    label: "Additional Tools",
    icon: <Puzzle className="text-indigo-400" />,
    color: "indigo",
    desc: "Compare, automations, featured items, guided tour, and analytics",
    href: "/compare",
    articles: [
      {
        id: "compare-tool",
        title: "Compare Tool",
        description: "Compare universities, programs, and other entities side by side.",
        steps: [
          {
            title: "Open Compare",
            instruction:
              'Click "Compare" from the sidebar. Select the type of items you want to compare (Universities, Programs, etc.).',
          },
          {
            title: "Select items to compare",
            instruction:
              "Search and select 2-4 items to compare. Selected items appear in a side-by-side comparison table.",
          },
          {
            title: "View comparison",
            instruction:
              "The comparison table shows attributes side by side: tuition fees, location, rankings, programs offered, and more. Differences are highlighted for easy scanning.",
          },
          {
            title: "Share or export",
            instruction:
              "Share a comparison link with colleagues or export the comparison as a PDF for client presentations.",
          },
        ],
        relatedLinks: [{ label: "Automations", href: "#automations" }],
      },
      {
        id: "automations",
        title: "Automations",
        description: "Set up automated workflows and triggers.",
        content: `Automations help reduce manual work by triggering actions based on events.

## Available Automations
- **Status Change**: Automatically update related records when a status changes.
- **Notifications**: Send automated notifications based on triggers.
- **Email Alerts**: Trigger email alerts for specific events.
- **Task Creation**: Auto-create tasks when conditions are met.

## Creating an Automation
1. Go to Automations from the sidebar.
2. Click "Add Automation".
3. Define the trigger:
   - When: Select an event type (application submitted, document verified, etc.).
   - Condition: Optional conditions to narrow the trigger.
4. Define the action:
   - What should happen when triggered.
5. Save and enable the automation.

## Examples
- Send a welcome email when a new student is created.
- Create a follow-up task when a lead is marked as "Contacted".
- Notify the admissions team when an application reaches "Offer Made" status.
- Auto-assign a counselor based on the student\'s country of interest.

## Monitoring
- View automation run history and success/failure rates.
- Disable automations temporarily without deleting them.`,
        relatedLinks: [{ label: "Compare Tool", href: "#compare-tool" }],
      },
      {
        id: "guided-tour",
        title: "Guided Tour & Onboarding",
        description: "Interactive walkthroughs for new users.",
        content: `The guided tour helps new users learn the system through interactive walkthroughs.

## Starting a Tour
1. Click the help icon (?) in the bottom-left corner.
2. Select "Take a Tour".
3. Choose from available tours:
   - Getting Started Overview
   - Dashboard Walkthrough
   - Student Management
   - Application Process
   - HR & Attendance

## Tour Features
- Step-by-step highlights with tooltip explanations.
- Next/Previous navigation at your own pace.
- Progress indicator showing completion status.
- Skip option to exit at any time.

## Re-taking Tours
- Tours can be replayed anytime from the help menu.
- New features may include dedicated mini-tours.
- Tour progress resets when you restart.

## Featured Items
- The Featured section highlights important or frequently accessed items.
- Administrators can pin items to the Featured page for quick access.
- Featured items appear as cards with quick-action buttons.`,
        relatedLinks: [{ label: "Compare Tool", href: "#compare-tool" }],
      },
    ],
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    icon: <BarChart3 className="text-pink-500" />,
    color: "pink",
    desc: "Dashboard insights, attendance summaries, and exportable reports",
    href: "/reports",
    articles: [
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        description: "Understanding the main dashboard and its key metrics.",
        steps: [
          {
            title: "Open the Dashboard",
            instruction:
              'Click "Dashboard" from the sidebar. The main dashboard shows summary cards for universities, programs, applications, and students.',
            screenshot: "dashboard.png",
          },
          {
            title: "View charts and trends",
            instruction:
              "Below the summary cards, charts show application trends over time, applications by status, top universities by applications, and recent activity.",
            screenshot: "dashboard.png",
          },
          {
            title: "Use date range filters",
            instruction:
              "Use the date range selector at the top of the dashboard to view data for specific periods. Charts and summary cards update automatically.",
            screenshot: "dashboard.png",
          },
          {
            title: "Access the HR Dashboard",
            instruction:
              'If you have HR permissions, click "HR" then "Dashboard" to view today\'s attendance count, present/late/absent breakdown, pending leave requests, and recent check-in activity.',
            screenshot: "hr-dashboard.png",
          },
        ],
        relatedLinks: [
          { label: "Attendance Summaries", href: "#attendance-summaries" },
          { label: "Exporting Reports", href: "#exporting-reports" },
        ],
      },
      {
        id: "attendance-summaries",
        title: "Attendance Summaries",
        description: "How to view and understand attendance summary reports.",
        steps: [
          {
            title: "Go to HR > Attendance",
            instruction:
              "Navigate to HR > Attendance. The top of the table shows summary cards: Present (green), Late (amber), and Absent (rose) counts for the selected date range.",
            screenshot: "hr-attendance.png",
          },
          {
            title: "Filter by date range",
            instruction:
              "Use the from/to date pickers to view summaries over any period. The summary counts update automatically based on the filtered records.",
            screenshot: "hr-attendance.png",
          },
          {
            title: "Drill down into records",
            instruction:
              "The table below the summaries shows individual attendance records with employee names, check-in/check-out times, statuses, and verification details.",
            screenshot: "hr-attendance.png",
          },
        ],
        relatedLinks: [
          { label: "Dashboard Overview", href: "#dashboard-overview" },
          { label: "Attendance Reports & Filters", href: "#attendance-reports" },
        ],
      },
      {
        id: "exporting-reports",
        title: "Exporting & Custom Reports",
        description: "How to generate and export custom reports from the system.",
        steps: [
          {
            title: "Navigate to Reports",
            instruction:
              'Click "Reports" from the sidebar. The Reports page shows available report types and generation options.',
            screenshot: "reports.png",
          },
          {
            title: "Select a report type",
            instruction:
              "Choose from Application Reports, University Reports, Financial Reports, Attendance Reports, or Activity Reports. Each report type has specific filters and fields.",
            screenshot: "reports.png",
          },
          {
            title: "Set filters and date range",
            instruction:
              "Configure the date range and apply filters relevant to the report type. For attendance reports, you can filter by employee, department, and status.",
            screenshot: "reports.png",
          },
          {
            title: "Generate and export",
            instruction:
              'Click "Generate" to preview the report. Review the data and click "Export" to download in CSV format for spreadsheet analysis or PDF for formatted, printable reports.',
            screenshot: "reports.png",
          },
        ],
        relatedLinks: [
          { label: "Dashboard Overview", href: "#dashboard-overview" },
          { label: "Attendance Summaries", href: "#attendance-summaries" },
        ],
      },
    ],
  },
];

const FAQS = [
  {
    question: "How do I add university contact details?",
    answer:
      "Open the university detail view and click 'Edit Profile'. You can now add comprehensive contact information including official email, phone number, and physical address in the updated contact section.",
  },
  {
    question: "Can I view tuition fees in NPR?",
    answer:
      "Yes. On any university detail page, click the 'Show in NPR' button. The system fetches real-time forex rates to automatically convert and display all tuition fees in Nepalese Rupees.",
  },
  {
    question: "How are commission types handled?",
    answer:
      "The system supports both 'Flat' and 'Percentage' based commissions. You can configure these in the Partnership section when adding or editing a university profile.",
  },
  {
    question: "How do I manage university partners?",
    answer:
      "Navigate to Settings > Partners to register and manage your global partners. These partners can then be linked to specific universities in the Partnership section.",
  },
  {
    question: "How do I search for specific programs?",
    answer:
      "Use the global Search module or the search bar within a university profile to filter programs by name, faculty, or degree level.",
  },
  {
    question: "How does face verification work for attendance?",
    answer:
      "Face verification uses motion-based liveness detection to confirm you are physically present. When checking in or out, the system captures your photo and verifies it against your enrolled face descriptor. The process runs entirely in your browser — no face data is sent to external servers.",
  },
  {
    question: "How do I enroll my face for check-in/checkout?",
    answer:
      "Go to HR > Employees, open your profile, and click the camera icon next to your name. On the enrollment page, look at the camera and follow the on-screen prompt to move your head slightly. The system captures 5 frames of your face to create a unique descriptor. Once enrolled, you can use face verification for daily check-in and checkout.",
  },
  {
    question: "Why do I need to enable location for attendance?",
    answer:
      "Location is compulsory for both check-in and checkout to verify you are at the office or branch. The system checks your GPS coordinates against the configured geofence radius. If you are outside the allowed area, check-in/checkout will be blocked. This ensures accurate attendance tracking for all employees.",
  },
  {
    question: "How do I set up office and branch locations?",
    answer:
      "Go to Settings > Localization to set the main office latitude, longitude, and geofence radius (default 10m). For branch-specific locations, edit a Branch record and enter its latitude/longitude. If an employee is assigned to a branch with coordinates, that branch location is used for geofence validation instead of the main office.",
  },
  {
    question: "How do I filter and sort attendance records?",
    answer:
      "Open HR > Attendance. Use the date range pickers to view attendance over a period, click the 'Filters' button to search by employee name or filter by status (Present, Late, Absent, Half-Day). Click the Check In or Check Out column headers to sort records in ascending or descending order.",
  },
  {
    question: "Can I view check-in location in Google Maps?",
    answer:
      "Yes. The attendance table shows GPS coordinates for each check-in and check-out. Click the coordinates or the 'Map' link in the Verify column to open the exact location in Google Maps. The Quick Actions card also displays your own coordinates as clickable map links.",
  },
  {
    question: "What is the application lifecycle?",
    answer:
      "Applications move through stages: Lead, Applied, Under Review, Offer Made, Offer Accepted, Enrolled, Rejected, or Withdrawn. Each stage has specific actions and document requirements. You can track and update statuses from the Applications module.",
  },
  {
    question: "How do I export attendance reports?",
    answer:
      "Go to HR > Attendance, set your desired date range and filters, then use the Reports section to generate and export attendance data in CSV format for payroll processing.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "On the login page, click 'Forgot Password'. Enter your email address to receive a password reset link. If you don't receive the email, contact your system administrator.",
  },
  {
    question: "How do I reset another user's password?",
    answer:
      "Go to the Access page from the sidebar. Find the user in the list, click the 'Edit Permissions' icon (checkmark button). In the Edit User modal, check 'Reset password', enter the new password, and click 'Update User'. The password is encrypted before being saved.",
  },
  {
    question: "How do students get their portal login credentials?",
    answer:
      "Navigate to Students, open a student's detail modal, and click the amber 'Credentials' button. Confirm to generate credentials — the system creates a random password and a User account with the Student role. Copy the displayed email and password to share with the student.",
  },
  {
    question: "How do I customize my dashboard layout?",
    answer:
      "On the Dashboard, hover over any widget to see the drag handle. Click and drag widgets to rearrange them. Your layout is automatically saved per user. Use the layout button to reset to default if needed.",
  },
  {
    question: "How do I convert a lead to an application?",
    answer:
      "Open the lead profile from the Leads page and click 'Convert to Application'. The lead's information is pre-populated into a new application form. Complete any missing details and submit to create the application.",
  },
  {
    question: "How do I upload documents for a student?",
    answer:
      "Go to Documents and click 'Upload'. Select the file, choose a document type (Transcript, Passport, Photo, etc.), and link it to the student. Supported formats include PDF, JPG, and PNG up to 10MB.",
  },
  {
    question: "How do I verify student documents?",
    answer:
      "Open the document from the Documents page or within an application. Preview the file, then click 'Verify' to approve, 'Reject' to decline, or 'Needs Review' to flag for further inspection. Add optional verification notes.",
  },
  {
    question: "How do I record a student payment?",
    answer:
      "Go to Payments and click 'Record Payment'. Select the student, enter the amount, choose the payment method (Cash, Bank Transfer, Card, Online), and optionally add a reference number. Generate a receipt after recording.",
  },
  {
    question: "How do I track visa applications?",
    answer:
      "Go to Visa Timeline from the sidebar. The page shows all visa applications with their current stage. Click on a record to update the stage, add notes, and track document submissions. Use Visa Checklists to ensure all requirements are met.",
  },
  {
    question: "How do I create calendar events?",
    answer:
      "Open Calendar and click on a date or click 'Add Event'. Enter a title, set start/end times, choose a color category, and optionally add a description or location. Events can be dragged to different dates.",
  },
  {
    question: "How do I use the chat system?",
    answer:
      "Click 'Chat' from the sidebar. Start a new conversation by clicking 'New Chat' or searching for a team member. Type your message and press Enter. Create group chats for team discussions with @mentions.",
  },
  {
    question: "How do I create and assign tasks?",
    answer:
      "Go to Tasks and click 'Add Task'. Enter a title, description, set priority (Low/Medium/High/Urgent), choose a due date, and assign a team member. Tasks move through To Do, In Progress, Review, and Done statuses.",
  },
  {
    question: "How do I submit a support ticket?",
    answer:
      "Go to Tickets and click 'New Ticket'. Select a category (Technical, Account, Feature Request, Bug Report), enter a subject, describe the issue, and optionally attach screenshots. Track your ticket's status as it's resolved.",
  },
  {
    question: "How do I generate API keys?",
    answer:
      "Go to API Keys and click 'Generate API Key'. Add an optional label to identify the key's purpose. Copy the key immediately as it cannot be viewed again. Configure permissions to restrict what the key can access.",
  },
  {
    question: "How do I import data in bulk?",
    answer:
      "Go to Bulk Import, select the target module, and download the template. Fill in your data following the column headers, save as CSV or XLSX, upload the file, map the columns, preview, and click 'Import'.",
  },
  {
    question: "How do I configure email settings?",
    answer:
      "Go to Settings > Email. Enter your SMTP host, port, username, and password. Select the encryption method (TLS/SSL). Click 'Test Connection' to verify, then save. Customize email templates under Settings > Email > Templates.",
  },
  {
    question: "How do I restore deleted records?",
    answer:
      "Go to Trash from the sidebar. Find the deleted item using filters, and click 'Restore'. The item is restored to its original location. Items are auto-purged after 30 days, so restore promptly.",
  },
  {
    question: "How do I view audit logs?",
    answer:
      "Click 'Audit' from the sidebar. The Audit Log shows a chronological list of all system actions. Filter by user, action type, module, or date range. Export logs as CSV for external analysis or compliance.",
  },
  {
    question: "How do I configure roles and permissions?",
    answer:
      "Go to Settings > Roles. View existing roles or click 'Add Role' to create a new one. For each module, check the permissions you want to grant (View, Create, Update, Delete, Export, Import). Save the role and assign it to users.",
  },
  {
    question: "How do I set up branches?",
    answer:
      "Go to Settings > Localization and scroll to the Branches section. Click 'Add Branch', enter the name, address, and GPS coordinates. Assign employees to branches from HR > Employees. Branch locations override the main office for geofence validation.",
  },
  {
    question: "How do I create automated workflows?",
    answer:
      "Go to Automations and click 'Add Automation'. Define a trigger (e.g., application submitted, document verified) and an action (e.g., send email, create task). Enable the automation once configured. Monitor run history on the Automations page.",
  },
  {
    question: "How do I use the compare tool?",
    answer:
      "Go to Compare and select the type of items to compare (Universities, Programs, etc.). Search and select 2-4 items. The comparison table shows attributes side by side with highlighted differences. Share or export the comparison as PDF.",
  },
  {
    question: "How do I manage files and folders?",
    answer:
      "Go to Files. Upload files by clicking 'Upload' or dragging and dropping. Create folders to organize by category or project. Move files between folders by dragging. Generate share links for external access with optional password protection.",
  },
];

const totalArticles = ARTICLES.reduce((acc, cat) => acc + cat.articles.length, 0);

export default function SupportContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);

  const selectedCategory = selectedCategoryId
    ? ARTICLES.find((c) => c.id === selectedCategoryId) || null
    : null;

  const selectedArticle =
    selectedArticleId && selectedCategory
      ? selectedCategory.articles.find((a) => a.id === selectedArticleId) || null
      : null;

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return ARTICLES;
    const q = searchQuery.toLowerCase();
    return ARTICLES.filter((cat) => {
      if (cat.label.toLowerCase().includes(q) || cat.desc.toLowerCase().includes(q)) return true;
      return cat.articles.some(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.content && a.content.toLowerCase().includes(q)) ||
          (a.steps &&
            a.steps.some(
              (s) => s.instruction.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
            ))
      );
    });
  }, [searchQuery]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(
      (faq) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const searchedArticles = (() => {
    if (!searchQuery.trim() || !selectedCategory) return selectedCategory?.articles || [];
    const q = searchQuery.toLowerCase();
    return selectedCategory.articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.steps &&
          a.steps.some(
            (s) => s.instruction.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
          ))
    );
  })();

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <button
              type="button"
              onClick={() => setSelectedArticleId(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-400" />
            </button>
            <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center">
              {selectedCategory.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedCategory.label}
              </p>
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
                {selectedArticle.relatedLinks.map((link, _i) => (
                  <button
                    type="button"
                    key={link.href}
                    onClick={() => {
                      const targetId = link.href.replace("#", "");
                      const foundCat = ARTICLES.find((c) =>
                        c.articles.some((a) => a.id === targetId)
                      );
                      if (foundCat) {
                        setSelectedCategoryId(foundCat.id);
                        setSelectedArticleId(targetId);
                        window.scrollTo({ top: 0, behavior: "smooth" });
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
            <Link
              href={selectedCategory.href}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
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
            <button
              type="button"
              onClick={handleBackToCategories}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Previous"
            >
              {" "}
              <ArrowLeft size={16} className="text-slate-400" />
            </button>
            <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center">
              {selectedCategory.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCategory.label}</h2>
              <p className="text-sm text-slate-500">
                {articles.length} article{articles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href={selectedCategory.href}
              className="ml-auto text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-lg"
            >
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
                <button
                  type="button"
                  key={article.id}
                  onClick={() => handleSelectArticle(article.id)}
                  className="w-full text-left p-4 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{article.description}</p>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-indigo-400 mt-0.5 flex-shrink-0"
                    />
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
    <div className="animate-fade-in space-y-8">
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
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors"
              size={20}
            />
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
          <p className="text-sm text-slate-400">
            Try a different search term or browse the categories below.
          </p>
        </div>
      )}

      {hasResults && (
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
          <button
            type="button"
            onClick={handleBackToCategories}
            className="hover:text-indigo-600 transition-colors"
          >
            All Categories
          </button>
          {selectedCategory && (
            <>
              <ChevronRight size={12} />
              {selectedArticleId && selectedArticle ? (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedArticleId(null)}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {selectedCategory.label}
                  </button>
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
                {filteredFaqs.map((faq, _idx) => {
                  const realIdx = FAQS.indexOf(faq);
                  return (
                    <div
                      key={faq.question}
                      className="card overflow-hidden border border-slate-100"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === realIdx ? null : realIdx)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-700 pr-2">
                          {faq.question}
                        </span>
                        {openFaq === realIdx ? (
                          <ChevronUp size={14} className="text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                        )}
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
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Email Support
                  </p>
                  <p className="text-xs font-bold text-slate-800">support@unitrack.com</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="size-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="text-purple-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    Phone Support
                  </p>
                  <p className="text-xs font-bold text-slate-800">+1 (888) UNI-TRACK</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100"></div>

            <div className="card p-3 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <h4 className="text-xs font-bold text-indigo-900 mb-1">Live Chat</h4>
              <p className="text-[10px] text-indigo-700 leading-relaxed mb-2">
                Chat with our specialists in real-time.
              </p>
              <button
                type="button"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-bold shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Start Chat
              </button>
            </div>

            <div className="h-px bg-slate-100"></div>

            <Link
              href="/tickets"
              className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
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
  return content.split("\n").map((line, i) => {
    const key = `${i}-${line.slice(0, 20)}`;
    if (line.startsWith("## ")) {
      return (
        <h2 key={key} className="text-lg font-bold text-slate-700 mt-5 mb-2">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("- **")) {
      const match = line.match(/- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) {
        return (
          <p key={key} className="text-sm text-slate-600 ml-4 mb-1">
            <strong className="text-slate-700">{match[1]}</strong>
            {match[2] ? `: ${match[2]}` : ""}
          </p>
        );
      }
    }
    if (line.startsWith("- ")) {
      return (
        <li key={key} className="text-sm text-slate-600 ml-4 mb-1 list-disc">
          {line.slice(2)}
        </li>
      );
    }
    if (line.startsWith("   - ")) {
      return (
        <li key={key} className="text-sm text-slate-600 ml-8 mb-1" style={{ listStyle: "circle" }}>
          {line.slice(5)}
        </li>
      );
    }
    if (line.match(/^\d+\. /)) {
      return (
        <li key={key} className="text-sm text-slate-600 ml-4 mb-1" style={{ listStyle: "decimal" }}>
          {line.replace(/^\d+\.\s*/, "")}
        </li>
      );
    }
    if (line.trim() === "") {
      return <div key={key} className="h-2"></div>;
    }
    return (
      <p key={key} className="text-sm text-slate-600 leading-relaxed mb-2">
        {line}
      </p>
    );
  });
}

function CategoriesGrid({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => (
        <button
          type="button"
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className="card p-6 group hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer text-left"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              {cat.icon}
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {cat.articles.length} Article{cat.articles.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
            {cat.label}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{cat.desc}</p>
          <div className="flex items-center text-xs font-bold text-indigo-600 gap-1 opacity-0 group-hover:opacity-100 transition-all">
            Browse Articles <ChevronRight size={14} />
          </div>
        </button>
      ))}
    </div>
  );
}
