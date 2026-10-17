export interface StudentEducationEntry {
  qualification?: string;
  score?: string;
}

export interface EligibilityEnglishTest {
  type?: string;
  overall?: string;
  reading?: string;
  writing?: string;
  listening?: string;
  speaking?: string;
}

export interface EligibilityStudent {
  education?: string | StudentEducationEntry[] | null;
  testType?: string | null;
  overallScore?: string | null;
  readingScore?: string | null;
  writingScore?: string | null;
  listeningScore?: string | null;
  speakingScore?: string | null;
  moi?: string | null;
}

export interface EligibilityCourse {
  level?: string | null;
  prerequisites?: string[] | null;
  requirements?: string[] | null;
  academicRequirement?: string | null;
  percentageRequired?: string | null;
  gpaRequired?: string | null;
  englishOverallScore?: string | null;
  englishLanguageType?: string | null;
  englishTestStage?: string | null;
  englishReadingScore?: string | null;
  englishWritingScore?: string | null;
  englishListeningScore?: string | null;
  englishSpeakingScore?: string | null;
  englishTests?: EligibilityEnglishTest[] | null;
}

export interface EligibilityCheck {
  key: string;
  label: string;
  pass: boolean;
  /** Requirement can be fulfilled later (English score submitted after application). */
  pending?: boolean;
  /** Whether this criterion could be automatically verified against the student record. */
  informational?: boolean;
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

/** Parses a numeric value out of strings like "70%", "6.5", "3.0 / 4.0". */
function toNumber(value?: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

const PLUS2_PATTERNS = ["+2", "grade xii", "grade 12", "higher secondary", "intermediate"];
const BACHELOR_PATTERNS = ["bachelor", "b.tech", "bsc", "b.sc", "undergraduate degree"];
const MASTER_PATTERNS = ["master", "m.tech", "msc", "m.sc", "mba"];

/**
 * Evaluates a student against a course's admission requirements and returns the
 * per-criterion results (matched / unmatched / pending / informational). Used both
 * for filtering the course list by eligibility and for the pre-enrollment review
 * screen.
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

  const relevantEntry = (): StudentEducationEntry | undefined => {
    if (course.level === "Undergraduate")
      return entries.find((e) => matchesQualification(e, PLUS2_PATTERNS));
    if (course.level === "Postgraduate")
      return entries.find((e) => matchesQualification(e, BACHELOR_PATTERNS));
    return entries[0];
  };

  const afterApplication = isEnglishStageAfter(course.englishTestStage);
  const englishType = course.englishLanguageType || "IELTS";

  const evaluateEnglishScore = (
    key: string,
    label: string,
    required: string | null | undefined,
    actual: string | null | undefined
  ): EligibilityCheck => {
    const reqNum = toNumber(required);
    const actualNum = toNumber(actual);
    const sameTest = student.testType === englishType;
    const numeric = reqNum !== null && actualNum !== null;
    const meets =
      sameTest &&
      (numeric
        ? actualNum! >= reqNum!
        : Boolean(actual) &&
          String(actual).trim().toLowerCase() === String(required).trim().toLowerCase());

    if (meets) {
      return {
        key,
        label,
        pass: true,
        detail: `${student.testType} ${actual} — meets requirement`,
      };
    }
    if (afterApplication) {
      return {
        key,
        label,
        pass: true,
        pending: true,
        detail: student.testType
          ? `${student.testType} ${actual || "N/A"} — submit before visa lodgement`
          : "Can be submitted after application, before visa lodgement",
      };
    }
    return {
      key,
      label,
      pass: false,
      detail: sameTest
        ? `${student.testType} ${actual || "N/A"} — below ${required}`
        : `${student.testType || "No test"} — expected ${englishType}`,
    };
  };

  // 1. Academic level
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

  // 2. Percentage requirement
  if (course.percentageRequired) {
    const reqPct = toNumber(course.percentageRequired);
    const relevant = relevantEntry();
    const studentPct = toNumber(relevant?.score);
    const pass = reqPct !== null && studentPct !== null && studentPct >= reqPct;
    checks.push({
      key: "percentage",
      label: `Minimum Percentage: ${course.percentageRequired}`,
      pass,
      detail: pass
        ? `Student: ${relevant?.score} — meets requirement`
        : `Student: ${relevant?.score || "N/A"}${reqPct !== null ? ` — below ${course.percentageRequired}` : ""}`,
    });
  }

  // 3. GPA requirement
  if (course.gpaRequired) {
    const reqGpa = toNumber(course.gpaRequired);
    const studentGpa = toNumber(relevantEntry()?.score);
    const pass = reqGpa !== null && studentGpa !== null && studentGpa >= reqGpa;
    checks.push({
      key: "gpa",
      label: `Minimum GPA: ${course.gpaRequired}`,
      pass,
      detail: pass
        ? `Student: ${relevantEntry()?.score} — meets requirement`
        : `Student: ${relevantEntry()?.score || "N/A"}${reqGpa !== null ? ` — below ${course.gpaRequired}` : ""}`,
    });
  }

  // 4. English proficiency — overall
  if (course.englishOverallScore) {
    checks.push(
      evaluateEnglishScore(
        "english",
        `English ${englishType} Overall: ${course.englishOverallScore}`,
        course.englishOverallScore,
        student.overallScore
      )
    );
  }

  // 5. English proficiency — individual bands
  const englishBands: {
    key: string;
    band: string;
    required?: string | null;
    actual?: string | null;
  }[] = [
    {
      key: "englishReading",
      band: "Reading",
      required: course.englishReadingScore,
      actual: student.readingScore,
    },
    {
      key: "englishWriting",
      band: "Writing",
      required: course.englishWritingScore,
      actual: student.writingScore,
    },
    {
      key: "englishListening",
      band: "Listening",
      required: course.englishListeningScore,
      actual: student.listeningScore,
    },
    {
      key: "englishSpeaking",
      band: "Speaking",
      required: course.englishSpeakingScore,
      actual: student.speakingScore,
    },
  ];
  for (const b of englishBands) {
    if (!b.required) continue;
    checks.push(
      evaluateEnglishScore(
        b.key,
        `English ${englishType} ${b.band}: ${b.required}`,
        b.required,
        b.actual
      )
    );
  }

  // 6. Additional accepted English tests (informational)
  if (course.englishTests && course.englishTests.length > 0) {
    const described = course.englishTests
      .filter((t) => t && (t.type || t.overall))
      .map((t) => {
        const bands = [t.reading, t.writing, t.listening, t.speaking].filter(Boolean);
        const overall = t.overall ? ` overall ${t.overall}` : "";
        const bandText = bands.length ? ` (${bands.join(" / ")})` : "";
        return `${t.type || "Test"}${overall}${bandText}`;
      });
    if (described.length > 0) {
      const studentMatches = course.englishTests.some(
        (t) => t?.type && t.type === student.testType && Boolean(student.overallScore)
      );
      checks.push({
        key: "englishTests",
        label: `Accepted English Tests: ${described.join(", ")}`,
        pass: true,
        informational: !studentMatches,
        detail: studentMatches
          ? `Student's ${student.testType} result recorded`
          : "Verify the student's English test against these accepted tests",
      });
    }
  }

  // 7. Prerequisites (informational — cannot be verified automatically)
  (course.prerequisites || []).filter(Boolean).forEach((req, i) => {
    checks.push({
      key: `prerequisite-${i}`,
      label: `Prerequisite: ${req}`,
      pass: true,
      informational: true,
      detail: "Verify manually",
    });
  });

  // 8. Other requirements (documents etc. — cannot be verified automatically)
  (course.requirements || []).filter(Boolean).forEach((req, i) => {
    checks.push({
      key: `requirement-${i}`,
      label: `Requirement: ${req}`,
      pass: true,
      informational: true,
      detail: "Confirm the student meets this requirement",
    });
  });

  // 9. Free-text academic requirement
  if (course.academicRequirement && course.academicRequirement.trim()) {
    checks.push({
      key: "academicRequirement",
      label: `Academic Requirement: ${course.academicRequirement.trim()}`,
      pass: true,
      informational: true,
      detail: "Verify manually",
    });
  }

  return {
    checks,
    allPass: checks.every((c) => c.pass),
    pending: checks.filter((c) => c.pending).length,
  };
}
