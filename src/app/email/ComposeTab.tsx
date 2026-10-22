import { Loader2, Mail, Search, Send } from "lucide-react";

export interface EmailStudent {
  id: string;
  name: string;
  email: string;
}

export default function ComposeTab({
  to,
  setTo,
  subject,
  setSubject,
  body,
  setBody,
  sending,
  configured,
  selectedStudent,
  studentSearch,
  setStudentSearch,
  students,
  onSelectStudent,
  onSend,
}: {
  to: string;
  setTo: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  body: string;
  setBody: (value: string) => void;
  sending: boolean;
  configured: boolean;
  selectedStudent: EmailStudent | null;
  studentSearch: string;
  setStudentSearch: (value: string) => void;
  students: EmailStudent[];
  onSelectStudent: (student: EmailStudent) => void;
  onSend: (e: React.FormEvent) => void;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <form
          onSubmit={onSend}
          className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="email-to"
              className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
            >
              To
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="email-to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="recipient@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email-subject"
              className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
            >
              Subject
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="email-message"
              className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
            >
              Message
            </label>
            <textarea
              id="email-message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              placeholder="Write your email message here... (HTML supported)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={sending || !configured}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {sending ? "Sending..." : "Send Email"}
            </button>
            {selectedStudent && (
              <span className="text-xs text-slate-400">
                To: {selectedStudent.name} ({selectedStudent.email})
              </span>
            )}
          </div>
        </form>
      </div>

      <div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Quick Select Student</h3>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              aria-label="Search students"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
            />
          </div>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {studentSearch.length >= 2 &&
              students.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => onSelectStudent(s)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-700">{s.name}</div>
                  <div className="text-xs text-slate-400">{s.email}</div>
                </button>
              ))}
            {studentSearch.length >= 2 && students.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No students found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
