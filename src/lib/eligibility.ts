export interface StudentEducationEntry {
  qualification?: string;
  score?: string;
}

export interface EligibilityStudent {
  education?: string | StudentEducationEntry[] | null;
  testType?: string | null;
  overallScore?: string | null;
}

export interface EligibilityCourse {
  level?: string | null;
  prerequisites?: string[] | null;
  gpaRequired?: string | null;
  englishOverallScore?: string | null;
  englishLanguageType?: string | null;
  englishTestStage?: string | null;
}

export interface EligibilityCheck {
  key: string;
  label: string;
  pass: boolean;
  /** Requirement can be fulfilled later (English score submitted after application). */
  pending?: boolean;
  /** Human-readable note explaining the evaluation. */
  detail?: string;
}

export interface EligibilityResult {
  checks: EligibilityCheck[];
  /** True when every hard requirement is met (pending requirements do not block). */
  allPass: boolean;
  pending: number;
}

export const ENGLISH_STAGE_BEFORE = "Before Application";
export const ENGLISH_STAGE_AFTER = "After Application";

export function isEnglishStageAfter(stage?: string | null): boolean {
  return stage === ENGLISH_STAGE_AFTER;
}

export function parseEducation(
  education: EligibilityStudent["education"]
): StudentEducationEntry[] {
  if (!education) return [];
  if (typeof education === "string") {
    try {
      const parsed = JSON.parse(education);
      return Array.isArray(parsed) ? (parsed as StudentEducationEntry[]) : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(education) ? education : [];
}

function matchesQualification(entry: StudentEducationEntry, patterns: string[]): boolean {
  const q = (entry.qualification || "").toLowerCase();
  return patterns.some((p) => q.includes(p));
}

const PLUS2_PATTERNS = ["+2", "grade xii", "grade 12", "higher secondary", "intermediate"];
const BACHELOR_PATTERNS = ["bachelor", "b.tech", "bsc", "b.sc", "undergraduate degree"];
const MASTER_PATTERNS = ["master", "m.tech", "msc", "m.sc", "mba"];

/**
 * Evaluates a student against a course's admission requirements and returns the
 * per-criterion results (matched / unmatched / pending). Used both for filtering
 * the course list by eligibility and for the pre-enrollment review screen.
 */
export function evaluateCourseEligibility(
  course: EligibilityCourse,
  student: EligibilityStudent
): EligibilityResult {
  const entries = parseEducation(student.education);
  const checks: EligibilityCheck[] = [];

  const hasPlus2 = entries.some((e) => matchesQualification(e, PLUS2_PATTERNS));
  const hasBachelor = entries.some((e) => matchesQualification(e, BACHELOR_PATTERNS));
  const hasMaster = entries.some((e) => matchesQualification(e, MASTER_PATTERNS));

  // 1. Prerequisites (informational — cannot be verified automatically)
  if (course.prerequisites && course.prerequisites.length > 0) {
    checks.push({
      key: "prerequisites",
      label: `Prerequisites: ${course.prerequisites.join(", ")}`,
      pass: true,
      detail: "Verify manually",
    });
  }

  // 2. Academic level
  if (course.level === "Undergraduate") {
    checks.push({
      key: "level",
      label: "Undergraduate — +2 / Grade XII",
      pass: hasPlus2,
      detail: hasPlus2 ? "+2 completed" : "+2 required",
    });
  } else if (course.level === "Postgraduate") {
    checks.push({
      key: "level",
      label: "Postgraduate — Bachelor's degree",
      pass: hasBachelor,
      detail: hasBachelor ? "Bachelor completed" : "Bachelor required",
    });
  } else if (course.level === "PhD") {
    const ok = hasMaster || hasBachelor;
    checks.push({
      key: "level",
      label: "PhD — Master's / Bachelor's degree",
      pass: ok,
      detail: ok ? "Degree completed" : "Master's or Bachelor's required",
    });
  }

  // 3. GPA / percentage requirement
  if (course.gpaRequired) {
    const reqGpa = parseFloat(course.gpaRequired);
    if (!isNaN(reqGpa)) {
      const relevant =
        course.level === "Undergraduate"
          ? entries.find((e) => matchesQualification(e, PLUS2_PATTERNS))
          : course.level === "Postgraduate"
            ? entries.find((e) => matchesQualification(e, BACHELOR_PATTERNS))
            : entries[0];
      const studentGpa = parseFloat(relevant?.score || "");
      const pass = !isNaN(studentGpa) && studentGpa >= reqGpa;
      checks.push({
        key: "gpa",
        label: `Minimum GPA: ${course.gpaRequired}`,
        pass,
        detail: pass
          ? `Student: ${studentGpa}`
          : `Student: ${isNaN(studentGpa) ? "N/A" : studentGpa}`,
      });
    }
  }

  // 4. English proficiency (respecting when the score must be submitted)
  if (course.englishOverallScore) {
    const reqScore = parseFloat(course.englishOverallScore);
    if (!isNaN(reqScore)) {
      const testType = course.englishLanguageType || "IELTS";
      const afterApplication = isEnglishStageAfter(course.englishTestStage);
      const sameTest = student.testType === testType;
      const studentScore = parseFloat(student.overallScore || "");
      const meets = sameTest && !isNaN(studentScore) && studentScore >= reqScore;

      if (meets) {
        checks.push({
          key: "english",
          label: `English: ${testType} ${course.englishOverallScore}`,
          pass: true,
          detail: `${student.testType} ${student.overallScore} — meets requirement`,
        });
      } else if (afterApplication) {
        checks.push({
          key: "english",
          label: `English: ${testType} ${course.englishOverallScore}`,
          pass: true,
          pending: true,
          detail: student.testType
            ? `${student.testType} ${student.overallScore || "N/A"} — submit before visa lodgement`
            : "Can be submitted after application, before visa lodgement",
        });
      } else {
        checks.push({
          key: "english",
          label: `English: ${testType} ${course.englishOverallScore}`,
          pass: false,
          detail: sameTest
            ? `${student.testType} ${student.overallScore || "N/A"} — below ${course.englishOverallScore}`
            : `${student.testType || "No test"} — expected ${testType}`,
        });
      }
    }
  }

  return {
    checks,
    allPass: checks.every((c) => c.pass),
    pending: checks.filter((c) => c.pending).length,
  };
}
