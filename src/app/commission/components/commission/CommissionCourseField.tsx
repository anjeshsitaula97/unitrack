import type { Course } from "./types";

interface CommissionCourseFieldProps {
  courses: Course[];
  value: string;
  onChange: (value: string) => void;
}

export default function CommissionCourseField({
  courses,
  value,
  onChange,
}: CommissionCourseFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor="commission-course"
        className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5"
      >
        Course <span className="text-slate-300 font-medium normal-case">(optional)</span>
      </label>
      <select
        id="commission-course"
        aria-label="Course"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium"
      >
        <option value="">University-level commission (no course)</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {courses.length === 0 && (
        <p className="mt-1 text-[10px] text-slate-400 font-medium">
          No courses found for this university.
        </p>
      )}
    </div>
  );
}
