---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### Master API
- Definition：An external catalog service that provides master lists of universities and courses consumed by Unitrack via HTTP. It is configured through MASTER_API_URL and MASTER_API_KEY environment variables and is optional — when not configured, master data endpoints return null and the UI falls back to local data.
- Aliases：master-catalog、catalog API

### ApplicationWorkflowStage
- Definition：A stage in the student application pipeline, each carrying a name, order, description, and a JSON array of subtasks (id, title, done). Applications move through these stages as part of the admission workflow.
- Aliases：application stage、workflow stage

### StudentConversation
- Definition：A one-to-one messaging thread between a staff member (User) and a Student, storing subject, last message metadata, and associated messages. Used for student support communication within the platform.
- Aliases：student chat、staff-student conversation

### ScannedDocument
- Definition：A record of a document scanned by a user, capturing filename, url, file size, DPI, and page count. Distinct from FileItem which represents uploaded files; ScannedDocument is tied to the scanning workflow.
- Aliases：scan、scanned file

### OnboardingProgress
- Definition：Per-student onboarding state tracking the current step and completion flag during the student onboarding flow, along with any step-specific data.
- Aliases：onboarding step、student onboarding

### ComparisonList
- Definition：A per-user saved list of items (stored as JSON string) used to compare entities such as universities or courses side-by-side.
- Aliases：my comparison、comparison list

### RateLimitLog
- Definition：A log table recording rate-limited requests keyed by a string identifier and timestamp, used to enforce request throttling on API endpoints.
- Aliases：rate limit log、throttle log
