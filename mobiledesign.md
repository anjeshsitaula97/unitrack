# UniTrack — Android App Design Document

> A mobile companion app for the UniTrack university management platform.
> Use this document to generate an Android (Kotlin/Jetpack Compose) app.

---

## 1. App Overview

**App Name:** UniTrack  
**Package:** com.unitrack.mobile  
**API Base URL:** `https://<server>/api`  
**Auth:** JWT-based (token stored in SharedPreferences / EncryptedSharedPreferences)  
**File Upload:** `POST /api/upload` (multipart/form-data), returns `{ url: "/uploads/uuid.ext" }`  
**Images Base URL:** `<server>` (prepend to relative URLs like `/uploads/uuid.jpg`)

---

## 2. Navigation Structure

### 2.1 Bottom Navigation Bar (5 tabs)

| Tab | Icon | Label | Screens |
|---|---|---|---|
| Home | Home | Dashboard | Dashboard |
| Catalog | BookOpen | Catalog | Universities, Courses, Search |
| HR | Users | HR | HR Dashboard, Employees, Attendance, Leave, Payroll |
| More | Menu | More | All other screens in a drawer/list |
| Profile | User | Profile | Profile, Settings, Logout |

### 2.2 Drawer / Overflow Menu (from "More" tab)

Access Control, API Keys, Payments, Expenses, Leads, Students, Applications,
Files, Documents, Tasks, Visa Workflow, Tickets, Reports, Analytics, Notifications,
Featured, Learning Hub, Automations, Chat, Support, Backups

---

## 3. Authentication

### 3.1 Login Screen

- **Route:** `POST /api/auth/login`
- **Fields:** email (EditText), password (EditText, password toggle)
- **Validation:** Email format, password non-empty
- **On success:** Store `auth_token` from cookie/response in EncryptedSharedPreferences
- **On error:** Show inline error message
- **On success navigation:** Dashboard
- **Check auth:** `GET /api/auth/me` on app launch to validate stored token
- **Logout:** `POST /api/auth/logout` + clear token + navigate to Login

### 3.2 Session Verification

- All API calls include `auth_token` cookie
- On 401 response → clear token → redirect to Login
- Use OkHttp interceptor or Retrofit interceptor for automatic 401 handling

---

## 4. Screens

### 4.1 Dashboard

**Screen:** `DashboardScreen`  
**API Calls:** `GET /api/dashboard/stats`, `GET /api/dashboard/charts`, `GET /api/activity`  
**Layout:**

```
┌──────────────────────────────┐
│  Good morning, [Name]        │
│  Welcome back!               │
├──────────────────────────────┤
│  ┌──────┐ ┌──────┐          │
│  │42    │ │128   │  KPI Grid │
│  │Univs │ │Courses│          │
│  └──────┘ └──────┘          │
│  ┌──────┐ ┌──────┐          │
│  │1,024 │ │56    │          │
│  │Students│Apps   │          │
│  └──────┘ └──────┘          │
├──────────────────────────────┤
│  Recent Activity Feed        │
│  • [time] [action]           │
│  • [time] [action]           │
│  • [time] [action]           │
├──────────────────────────────┤
│  Recent Universities         │
│  ┌────┬────────────┬───┐    │
│  │Logo│ MIT        │US │    │
│  │    │ Cambridge   │   │    │
│  └────┴────────────┴───┘    │
│  ┌────┬────────────┬───┐    │
│  │Logo│ Oxford     │UK │    │
│  └────┴────────────┴───┘    │
└──────────────────────────────┘
```

**Components:**
- Greeting header with user name from `GET /api/auth/me`
- 4 KPI cards in a 2×2 grid: Total Universities, Active Courses, Total Students, New Applications
- Recent activity feed (vertical list, timestamp + action text)
- Recent universities list (horizontal or vertical card list with logo, name, country)

---

### 4.2 Universities List

**Screen:** `UniversitiesListScreen`  
**API:** `GET /api/universities`  
**Layout:**

```
┌──────────────────────────────┐
│  < Back    Universities  [+] │
├──────────────────────────────┤
│  [Search universities...    ]│
├──────────────────────────────┤
│  Filters: [Status ▼] [Type ▼]│
├──────────────────────────────┤
│  ┌────────────────────────┐ │
│  │ Logo  MIT                  │ │
│  │       Cambridge, USA       │ │
│  │       Active · Public      │ │
│  │       ⭐ 4.2    >          │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │ Logo  Oxford               │ │
│  │       Oxford, UK           │ │
│  │       Active · Public      │ │
│  │       ⭐ 4.5    >          │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

**Actions:**
- Search by name
- Filter by Status (Active/Pending/Suspended) and Type (Public/Private)
- Tap card → University Detail screen
- FAB (+) → Add University screen

---

### 4.3 University Detail

**Screen:** `UniversityDetailScreen`  
**API:** `GET /api/universities/[id]`  
**Layout:** Scrollable

```
┌──────────────────────────────┐
│  < Back           [Edit] [⋮] │
├──────────────────────────────┤
│  [Banner Image - full width] │
│  ┌────────┐                  │
│  │  Logo  │ University Name  │
│  │        │ Country          │
│  └────────┘ Status Badge     │
├──────────────────────────────┤
│  Basic Information           │
│  Type: Public                │
│  Founded: 1861               │
│  Ranking: #1                 │
│  Website: mit.edu            │
├──────────────────────────────┤
│  Accreditation               │
│  NECHE, WSCUC                │
├──────────────────────────────┤
│  Contact                     │
│  Email, Phone, Address       │
├──────────────────────────────┤
│  Partnership & Commission    │
│  Partner: Name               │
├──────────────────────────────┤
│  Requirements                │
│  IELTS, TOEFL, SAT badges    │
├──────────────────────────────┤
│  Courses                     │
│  ┌────────────────────────┐ │
│  │ Course Name  Fees $   >│ │
│  │ Faculty · Level · Intake│ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

**Sections (collapsible):** Basic Info, Accreditation, Contact, Media (gallery grid), Partnership, Requirements (chips/tags), Courses (list)

---

### 4.4 Add/Edit University

**Screen:** `UniversityFormScreen`  
**API:** `POST /api/universities` (create), `PATCH /api/universities/[id]` (edit)  
**Layout:** Scrollable form with sections

```
┌──────────────────────────────┐
│  < Cancel  Add University ✓ │
├──────────────────────────────┤
│  BASIC INFORMATION           │
│  ┌────────────────────────┐ │
│  │ University Full Name * │ │
│  └────────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ │
│  │Short Name│ │Type ▼    │ │
│  └──────────┘ └──────────┘ │
│  ┌────────────────────────┐ │
│  │ Country * ▼            │ │
│  └────────────────────────┘ │
│  ┌──────────┐ ┌──────────┐ │
│  │Founded   │ │Ranking   │ │
│  └──────────┘ └──────────┘ │
│  ┌────────────────────────┐ │
│  │ Description (textarea) │ │
│  └────────────────────────┘ │
├──────────────────────────────┤
│  ACCREDITATION              │
│  ┌────────────────────┬──┐ │
│  │ Add body...        │Add│ │
│  └────────────────────┴──┘ │
│  [NECHE ×] [WSCUC ×]      │
├──────────────────────────────┤
│  CONTACT & WEB              │
│  ┌──────────┐ ┌──────────┐ │
│  │Website   │ │Email     │ │
│  └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ │
│  │Phone     │ │Status ▼  │ │
│  └──────────┘ └──────────┘ │
├──────────────────────────────┤
│  MEDIA & ASSETS             │
│  [Logo Upload] [Banner Upld]│
│  Gallery: [+] grid          │
├──────────────────────────────┤
│  PARTNERSHIP                │
│  ☐ Not Applicable           │
│  Partner ▼, Amount, Comm   │
├──────────────────────────────┤
│  REQUIREMENTS               │
│  [IELTS] [TOEFL] [SAT] grid │
├──────────────────────────────┤
│  [Cancel]    [Save]         │
└──────────────────────────────┘
```

**File upload:** Use multipart `POST /api/upload` for logo, banner, gallery images. Returned URL is stored in form state, submitted as part of JSON payload.

---

### 4.5 Courses List

**Screen:** `CoursesListScreen`  
**API:** `GET /api/courses`  
**Layout:**

```
┌──────────────────────────────┐
│  < Back         Courses  [+] │
├──────────────────────────────┤
│  [Search courses...        ]│
├──────────────────────────────┤
│  Filters: [Faculty ▼] [Level]│
├──────────────────────────────┤
│  ┌────────────────────────┐ │
│  │ College Logo            │ │
│  │ Course Name             │ │
│  │ University · Faculty    │ │
│  │ $12,000/yr  ⏳ 3 years  │ │
│  │ 🟢 Open Intake          │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

**Actions:** Search, filter, tap → Course Detail modal. FAB → Add Course.

---

### 4.6 Leads

**Screen:** `LeadsScreen`  
**API:** `GET /api/leads`, `POST /api/leads`, `PUT /api/leads/[id]`, `DELETE /api/leads/[id]`  
**Layout:**

```
┌──────────────────────────────┐
│  < Back         Leads    [+] │
├──────────────────────────────┤
│  [Search leads...          ]│
├──────────────────────────────┤
│  Filters: [Status ▼] [Staff]│
├──────────────────────────────┤
│  ┌────────────────────────┐ │
│  │ Name                   │ │
│  │ email@example.com      │ │
│  │ Phone: +977 98...      │ │
│  │ Status: [New]          │ │
│  │ Counselor: [Name]      │ │
│  │ 📅 Follow-up: 2026-06-10│ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

**Status chips:** New, Contacted, Qualified, Converted, Lost  
**FAB (+):** Add lead form modal/sheet

### 4.6.1 Lead Form (Bottom Sheet)

```
┌──────────────────────────────┐
│  ✕  Add Lead                │
├──────────────────────────────┤
│  Name * | Email * | Phone   │
│  Source ▼ | Counselor ▼     │
│  Interested Country ▼       │
│  Marital Status ▼ | Children│
│  Reference Name             │
│  Next Follow-up 📅          │
│  Notes (textarea)           │
│  [Cancel]    [Save]         │
└──────────────────────────────┘
```

---

### 4.7 Students

**Screen:** `StudentsScreen`  
**API:** `GET /api/students`  
**Layout:**

```
┌──────────────────────────────┐
│  < Back        Students [+]#│
├──────────────────────────────┤
│  [Search students...       ]│
├──────────────────────────────┤
│  Filters: [Status] [Country]│
├──────────────────────────────┤
│  ┌────────────────────────┐ │
│  │ 📷 Student Name        │ │
│  │ email@example.com      │ │
│  │ 🇳🇵 Nepal · Bachelor's │ │
│  │ Status: [Applied]      │ │
│  │ Last activity: 2d ago  │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

**Tap → Student Detail (tabs):**
- Tab 1: Profile (all fields in sections)
- Tab 2: Documents (list with upload)
- Tab 3: Payments (list with add)
- Tab 4: Status history

### 4.7.1 Student Form (Add/Edit)

Long scrollable form with sections:
1. **Personal:** First/Last name, Email, Password, Phone, WhatsApp, Gender, DOB, Nationality
2. **Address:** Permanent (Province/District/Municipality/Ward), Temporary
3. **Passport:** Number, Nationality, Issue/Expiry, Place
4. **Education:** Qualifications (list)
5. **Test Scores:** Type, Overall, Reading, Writing, Listening, Speaking, Test date
6. **Guardian:** Name, Phone, Email, Relation, Address
7. **Spouse/Children:** Name, Children details
8. **Target:** Study Level, Intake, Country, Universities

---

### 4.8 Search Courses

**Screen:** `SearchScreen`  
**API:** `GET /api/search`  
**Layout:**

```
┌──────────────────────────────┐
│  < Back     Search Courses   │
├──────────────────────────────┤
│  [🔍 Search courses...     ]│
├──────────────────────────────┤
│  Filters (expandable)       │
│  Faculty: [All ▼]          │
│  Level: [Bachelor ▼]       │
│  Country: [All ▼]          │
│  Intake: [All ▼]           │
│  Fees: [Slider 0-50000]    │
│  Requirements: [IELTS][TOEFL]│
├──────────────────────────────┤
│  Results                     │
│  ┌────────────────────────┐ │
│  │ 🏛️ University Name    │ │
│  │  Course Name           │ │
│  │  📍 Country            │ │
│  │  $12,000/yr  🇳🇵 NPR    │ │
│  │  🟢 Open · 🏫 On-Campus│ │
│  │  [IELTS 6.0][TOEFL 80] │ │
│  │         [Enroll]       │ │
│  └────────────────────────┘ │
└──────────────────────────────┘
```

---

### 4.9 Applications

**Screen:** `ApplicationsScreen`  
**API:** `GET /api/applications`  
**Layout:** Filterable table list with status chips, student name, university, course

---

### 4.10 Payments

**Screen:** `PaymentsScreen`  
**API:** `GET /api/payments`  
**Layout:** List with student, amount with currency, status badge, date. FAB to add.

### 4.11 Payment Form

Student selector, Amount, Currency, Status (Paid/Pending/Partially/Refunded), Method, Date

---

### 4.12 Expenses

**Screen:** `ExpensesScreen`  
**API:** `GET /api/expenses`  
**Layout:** List with category icon, amount, date, paid-to. FAB to add.

### 4.12.1 Expense Form

Category dropdown, Amount, Currency, Date, Description, Paid To, Method, Bill/Transaction No, Screenshot upload (file picker → `POST /api/upload`)

---

### 4.13 Staff

**Screen:** `StaffScreen`  
**API:** `GET /api/staff`  
**Layout:** List of staff with name, email, role badge, status. FAB to add.

### 4.14 Staff Form

Name, Email, Password, Role dropdown (from `GET /api/roles`)

---

### 4.15 Staff Tasks

**Screen:** `StaffTasksScreen`  
**API:** `GET /api/tasks`  
**Layout:** Tab layout: Todo | In Progress | Review | Done (Kanban-style columns). Each card shows title, priority badge, assignee, due date. FAB to add.

### 4.16 Task Form

Title, Description, Status dropdown, Priority (Low/Medium/High/Urgent), Assignee selector, Due date picker

---

### 4.17 Visa Workflow

**Screen:** `VisaWorkflowScreen`  
**API:** `GET /api/visa-types`, `GET /api/workflow-stages`, `GET /api/tasks`  
**Layout:** Drill-down navigation: Countries → Visa Types → Stages → Tasks

---

### 4.18 Tickets (Support)

**Screen:** `TicketsScreen`  
**API:** `GET /api/tickets`  
**Layout:** List with title, type badge, priority, status. FAB to create.

### 4.18.1 Ticket Form

Title, Description, Type (Technical/Feature Request), Priority, Screenshot upload

---

### 4.19 Files

**Screen:** `FilesScreen`  
**API:** `GET /api/files/folders`, `GET /api/files`  
**Layout:** Folder grid/list → tap folder → file list. Upload FAB. Breadcrumb navigation.

---

### 4.20 Documents (Scanner)

**Screen:** `DocumentScannerScreen`  
**API:** `GET /api/documents`  
**Features:** Camera capture (CameraX), DPI selector, flash toggle, preview, upload scanned document

---

### 4.21 Access Control

**Screen:** `AccessControlScreen`  
**API:** `GET /api/access`  
**Layout:** List of users with name, email, role, online status (green dot). Search bar. Tap → detail/edit dialog. FAB → invite user.

---

### 4.22 API Keys

**Screen:** `ApiKeysScreen`  
**API:** `GET /api/api-keys`  
**Layout:** List of keys with name, created date, last used. Copy, reveal/hide, revoke actions. FAB to generate.

---

### 4.23 Settings

**Screen:** `SettingsScreen`  
**API:** Multiple endpoints  
**Layout:** Tabbed/sectioned layout:
1. Profile (avatar upload, name, email)
2. Roles & Permissions
3. Localization (country, currency, phone code, language)
4. Branches (CRUD)
5. Qualifications (CRUD)
6. Partners (CRUD)
7. Academics (Faculties, Degree Types, Intakes)
8. Email/SMTP Settings
9. Security (password change)

### 4.23.1 Profile

Avatar image upload → `POST /api/upload`, then `PUT /api/profile`. Name field.

### 4.23.2 Password Change

Current password, New password, Confirm new password → `PUT /api/profile` (includes password field)

---

### 4.24 Notifications

**Screen:** `NotificationsScreen`  
**API:** `GET /api/notifications`, `PUT /api/notifications` (mark read)  
**Layout:** List with icon per type (Success/Error/Warning/Info), title, message, time, read/unread dot. Swipe to mark read. "Mark all read" button.

---

### 4.25 Reports

**Screen:** `ReportsScreen`  
**API:** `GET /api/reports`  
**Layout:** Report type selector (5 types), date range picker, preview table, download XLSX button.

---

### 4.26 Analytics

**Screen:** `AnalyticsScreen`  
**API:** Static/mock data  
**Layout:** KPI cards and chart placeholders.

---

### 4.27 Featured

**Screen:** `FeaturedScreen`  
**API:** `GET /api/featured`  
**Layout:** Two sections: Featured Universities (cards with logo, name, ranking, star toggle), Featured Courses (cards)

---

### 4.28 Learning Hub

**Screen:** `LearningHubScreen`  
**API:** `GET /api/learning-resources`  
**Layout:** Drill-down: Countries → Categories → Resources. Each resource card: title, type badge, description. FAB to add resource.

### 4.28.1 Resource Form

Title, Description, Type (document/video/link), URL or file upload, Country, Category

---

### 4.29 Automations

**Screen:** `AutomationsScreen`  
**API:** Mock data  
**Layout:** List of automation cards with name, description, active/paused toggle switch.

---

### 4.30 Support (Help Center)

**Screen:** `SupportScreen`  
**Layout:** Expandable category list with articles. Search bar. Article detail with steps and screenshots. Static content only.

---

### 4.31 Chat

**Screen:** `ChatScreen`  
**API:** `GET /api/chat/rooms`, `POST /api/chat/rooms`, `GET /api/chat/messages`  
**Layout:** Room list → Message thread. Currently a placeholder in web app — implement as real-time chat with polling or WebSocket.

---

### 4.32 Backup & Restore

**Screen:** `BackupScreen`  
**API:** `GET /api/backup`, `POST /api/restore`  
**Layout:** Two sections:
1. **Create Backup:** Checkboxes for 14 data sections, optional encryption password, "Generate Backup" button → downloads JSON
2. **Restore:** File picker for backup JSON, section selection checkboxes, optional decryption password, "Restore" button

---

## 5. HR Module Screens

### 5.1 HR Dashboard

**Screen:** `HRDashboardScreen`  
**API:** `GET /api/hr/dashboard`  
**Layout:** KPI cards grid (Total Employees, Departments, Designations, Pending Leaves, Present Today, Payrolls This Month), quick navigation links to sub-modules.

---

### 5.2 Employees

**Screen:** `EmployeesScreen`  
**API:** `GET /api/hr/employees`  
**Layout:** Searchable list with employee ID, name, department, designation, phone, salary. FAB to add.

### 5.2.1 Employee Form

Long form with sections:
1. **Identity:** User selector, Employee ID, Phone, Gender, Hire date, Employment type
2. **Compensation:** Basic salary, Bank details (name, account, IFSC), PAN
3. **Organization:** Department, Designation, Branch selectors
4. **Contact:** Emergency contact name/phone, Address

---

### 5.3 Departments

**Screen:** `DepartmentsScreen`  
**API:** `GET /api/hr/departments`  
**Layout:** List with name, description, head. FAB to add/edit.

---

### 5.4 Designations

**Screen:** `DesignationsScreen`  
**API:** `GET /api/hr/designations`  
**Layout:** List with title, description. FAB to add/edit.

---

### 5.5 Attendance

**Screen:** `AttendanceScreen`  
**API:** `GET /api/hr/attendance`, `POST /api/hr/attendance`  
**Layout:** Date navigation (prev/next day), stats cards (Present/Late/Absent), quick check-in/out button (with face verification), attendance list.

### 5.5.1 Check-in/out

Face verification flow:
1. Camera preview
2. Detect face (`face-api.js` equivalent)
3. Compare with enrolled face descriptor
4. On match → record attendance with GPS coordinates, photo, timestamp

---

### 5.6 Leave Management

**Screen:** `LeaveScreen`  
**API:** `GET /api/hr/leave/requests`, `GET /api/hr/leave/types`  
**Layout:** Two tabs: Requests (status filter, apply FAB) and Leave Types (CRUD list).

### 5.6.1 Leave Request Form

Leave type selector, Start/End date pickers, Reason textarea. For managers: Approve/Reject buttons with notes.

---

### 5.7 Payroll

**Screen:** `PayrollScreen`  
**API:** `GET /api/hr/payroll`  
**Layout:** Month/Year picker at top. List of payroll records per employee: basic salary, allowances, deductions, bonus, net salary, status (Draft/Paid). Actions: Pay, View details.

### 5.7.1 Payroll Form (Add)

Employee selector, Basic salary auto-filled from employee record, Add/remove allowance/deduction/bonus items with label and amount.

---

## 6. API Endpoints Summary

### 6.1 Auth
| Method | Path | Body/Params | Response |
|---|---|---|---|
| POST | /api/auth/login | `{ email, password }` | `{ success: true }` + Set-Cookie |
| POST | /api/auth/logout | — | Clear-Cookie |
| GET | /api/auth/me | Cookie | `{ id, name, email, role, avatar }` |

### 6.2 Core Entities
| Method | Path | Purpose |
|---|---|---|
| GET/POST | /api/universities | List / Create |
| GET/PUT/DELETE | /api/universities/[id] | Detail / Update / Delete |
| GET/POST | /api/courses | List / Create |
| GET/PUT/DELETE | /api/courses/[id] | Detail / Update / Delete |
| GET/POST | /api/students | List / Create |
| GET/PUT/DELETE | /api/students/[id] | Detail / Update / Delete |
| GET/POST | /api/students/[id]/documents | List / Upload document |
| GET/POST | /api/applications | List / Create |
| GET/POST | /api/leads | List / Create |
| PUT/DELETE | /api/leads/[id] | Update / Delete |

### 6.3 Financial
| Method | Path | Purpose |
|---|---|---|
| GET/POST | /api/payments | List / Create |
| GET/POST | /api/expenses | List / Create |

### 6.4 HR
| Method | Path | Purpose |
|---|---|---|
| GET | /api/hr/dashboard | HR summary stats |
| GET/POST | /api/hr/employees | List / Create |
| GET/PUT/DELETE | /api/hr/employees/[id] | Detail / Update / Delete |
| GET/POST | /api/hr/departments | List / Create |
| GET/POST | /api/hr/designations | List / Create |
| GET/POST | /api/hr/attendance | List / Create |
| GET/POST | /api/hr/leave/types | List / Create |
| GET/POST | /api/hr/leave/requests | List / Create |
| PUT | /api/hr/leave/requests/[id] | Approve/Reject |
| GET | /api/hr/leave/balances | Leave balances |
| GET/POST | /api/hr/payroll | List / Create |
| PUT | /api/hr/payroll/[id] | Update status |

### 6.5 File Upload
| Method | Path | Purpose |
|---|---|---|
| POST | /api/upload | Upload any file (multipart) → `{ url: "/uploads/uuid.ext" }` |

> **Note:** All file uploads return a relative URL path. Prepend server base URL to display images.

### 6.6 Access & Security
| Method | Path | Purpose |
|---|---|---|
| GET | /api/access | User access list |
| PUT | /api/access/[id] | Update role/status |
| GET/POST | /api/api-keys | List / Generate |
| DELETE | /api/api-keys/[id] | Revoke |
| GET/POST | /api/roles | List / Create |
| GET/POST | /api/users | List users |

### 6.7 Settings & Config
| Method | Path | Purpose |
|---|---|---|
| PUT | /api/profile | Update profile/avatar |
| GET/PUT | /api/settings/localization | Localization settings |
| GET/PUT | /api/settings/email | Email/SMTP settings |
| GET/POST | /api/branches | List / Create branches |
| GET/POST | /api/partners | List / Create partners |
| GET/POST | /api/faculties | List / Create faculties |
| GET/POST | /api/degree-types | List / Create degree types |
| GET/POST | /api/intakes | List / Create intakes |

### 6.8 Learning Hub
| Method | Path | Purpose |
|---|---|---|
| GET/POST | /api/learning-resources | List / Create |
| GET/POST | /api/learning-hub/countries | List / Create |
| GET/POST | /api/learning-hub/categories | List / Create |

### 6.9 Visa & Workflow
| Method | Path | Purpose |
|---|---|---|
| GET | /api/visa-types | List visa types |
| GET/POST | /api/workflow-stages | List / Create stages |
| GET | /api/nepal/provinces | Nepal provinces |
| GET | /api/nepal/districts | Nepal districts |
| GET | /api/nepal/municipalities | Nepal municipalities |

### 6.10 Reports & Data
| Method | Path | Purpose |
|---|---|---|
| GET | /api/dashboard/stats | Dashboard KPIs |
| GET | /api/activity | Activity feed |
| GET | /api/search | Course search |
| GET | /api/reports | Report data |
| GET | /api/featured | Featured items |
| GET | /api/backup | Download backup JSON |
| POST | /api/restore | Restore from backup |

---

## 7. Database Models (Mobile SQLite / Room)

Mobile stores a local cache using Room with these simplified entities:

### 7.1 User (local)
```kotlin
@Entity
data class User(
    @PrimaryKey val id: String,
    val name: String,
    val email: String,
    val role: String,
    val avatar: String?,
    val token: String  // stored encrypted
)
```

### 7.2 University (cached)
```kotlin
@Entity
data class University(
    @PrimaryKey val id: String,
    val name: String,
    val shortName: String?,
    val country: String,
    val type: String,
    val status: String,
    val logo: String?,
    val banner: String?,
    val ranking: Int?,
    val website: String?,
    val email: String?,
    val phone: String?,
    val description: String?,
    val accreditation: String?,
    val requirements: String?,
    val partnerId: String?,
    val isFeatured: Boolean,
    val courses: Int,
    val createdAt: String,
    val updatedAt: String
)
```

### 7.3 Course (cached)
```kotlin
@Entity
data class Course(
    @PrimaryKey val id: String,
    val name: String,
    val universityId: String,
    val faculty: String,
    val degreeType: String,
    val level: String,
    val tuitionFee: String?,
    val currency: String?,
    val duration: String?,
    val status: String,
    val intake: String?,
    val language: String,
    val mode: String,
    val englishTests: String?
)
```

### 7.4 Other cached entities (same structure as Prisma models)

Student, Lead, Payment, Expense, Application, Employee, Task, Ticket, Notification, FileItem, FileFolder, Partner, Branch, Department, Designation, LeaveType, LeaveRequest, Payroll, Attendance, LearningResource, Role, ApiKey

---

## 8. Navigation & Architecture

### 8.1 Architecture Pattern
- **MVVM** with Repository pattern
- Jetpack Compose for UI
- Retrofit + OkHttp for networking
- Room for local caching
- Hilt for dependency injection
- Navigation Compose for routing

### 8.2 Navigation Graph

```
NavHost(startDestination = "login") {
    // Auth
    composable("login") { LoginScreen() }
    
    // Main shell with bottom nav
    composable("main") { MainShell() }
    
    // Detail screens (pushed on top of MainShell)
    composable("universities/{id}") { UniversityDetailScreen(it.arguments?.getString("id")) }
    composable("universities/add") { UniversityFormScreen() }
    composable("universities/{id}/edit") { UniversityFormScreen(it.arguments?.getString("id")) }
    composable("courses/{id}") { CourseDetailScreen(it.arguments?.getString("id")) }
    composable("students/{id}") { StudentDetailScreen(it.arguments?.getString("id")) }
    // ... etc for all detail routes
}
```

### 8.3 Main Shell

```kotlin
@Composable
fun MainShell() {
    Scaffold(
        bottomBar = { BottomNavigationBar(selectedTab, onTabSelected) }
    ) { padding ->
        NavHost(
            startDestination = "dashboard",
            modifier = Modifier.padding(padding)
        ) {
            composable("dashboard") { DashboardScreen() }
            composable("catalog") { CatalogScreen() }  // Sub-nav for Univ/Courses/Search
            composable("hr") { HRScreen() }             // Sub-nav for HR modules
            composable("more") { MoreDrawerScreen() }   // Grid/list of all other modules
            composable("profile") { ProfileScreen() }
        }
    }
}
```

---

## 9. File Upload Pattern

All file uploads follow the same pattern:

```kotlin
// In a ViewModel or Repository
suspend fun uploadFile(uri: Uri): String {
    val file = contentResolver.resolveToFile(uri) // Helper to convert Uri to File
    val requestBody = file.asRequestBody("image/*".toMediaType())
    val part = MultipartBody.Part.createFormData("file", file.name, requestBody)
    val response = api.uploadFile(part)
    return response.url // e.g. "/uploads/uuid.jpg"
}

// Then submit the returned URL as part of form JSON
```

**Retrofit interface:**
```kotlin
@Multipart
@POST("/api/upload")
suspend fun uploadFile(@Part file: MultipartBody.Part): Response<UploadResponse>

data class UploadResponse(
    val url: String,
    val name: String,
    val size: String
)
```

---

## 10. Push Notifications

The web app uses a polling approach (`/api/notifications` every 10s). For Android:
- Use Firebase Cloud Messaging (FCM)
- Server would need to send FCM tokens and send push notifications
- Alternatively, keep the polling approach with WorkManager periodic task

---

## 11. Camera Features

Two camera use cases:

### 11.1 Document Scanner (Section 4.20)
- Use CameraX with ImageCapture
- DPI settings affect image quality
- Flash toggle
- Save to `public/uploads/` via `POST /api/upload`

### 11.2 Face Enrollment & Verification (Section 5.5.1)
- CameraX preview
- Use ML Kit Face Detection (equivalent to `face-api.js`)
- Detect face, extract face descriptor/embedding
- Movement detection (turn left, turn right, etc.)
- Match against stored descriptor during check-in

---

## 12. Offline Strategy

- Cache entity lists (Universities, Courses, etc.) in Room
- Show cached data when offline with "offline" indicator
- Queue write operations (create/update) for sync when online
- Use WorkManager for background sync

---

## 13. Theme & Design Tokens

### Colors (from Tailwind config)
```kotlin
// Primary: Indigo (#6366f1, #4f46e5)
// Success: Emerald (#10b981)
// Warning: Amber (#f59e0b)
// Error: Red/rose (#ef4444, #e11d48)
// Slate grays: #f8fafc → #0f172a
// Cards: White bg, slate-200 border, shadow-sm
```

### Typography
- Headings: Bold, 18-24sp
- Body: Regular, 14sp
- Labels/captions: Semibold, 11-12sp
- Use font family: Plus Jakarta Sans (download from Google Fonts)

### Components (from web app)
- `.card` → `Card(modifier = Modifier.background(White).rounded(12.dp).border(1.dp, Slate200).shadow(4.dp))`
- `.btn-primary` → `Button(colors = Indigo600)`
- `.btn-secondary` → `OutlinedButton`
- Badges/chips → `Surface(shape = RoundedCornerShape(8.dp), color = ...)`
- Status badges → Colored background with text (e.g., green for Active, amber for Pending)
- Modals → Bottom sheets for forms
- Tables → LazyColumn with rows

---

## 14. Implementation Priority

| Phase | Screens | Effort |
|---|---|---|
| **P1: Core** | Login, Dashboard, Universities (list/detail/form), Courses, Students | High |
| **P2: Operations** | Leads, Applications, Payments, Expenses, Search | Medium |
| **P3: HR** | HR Dashboard, Employees, Departments, Designations, Attendance, Leave, Payroll | High |
| **P4: Support** | Tickets, Notifications, Reports, Analytics | Medium |
| **P5: Extras** | Files, Documents, Learning Hub, Featured, Automations, Chat, Backup | Low |
| **P6: Admin** | Settings, Access Control, API Keys, Staff, Tasks, Visa Workflow | Medium |
