export interface PartnerFormData {
  institutionName: string;
  country: string;
  institutionType: string;
  website: string;
  contactName: string;
  email: string;
  phone: string;
  programs: string;
  annualEnrolment: string;
  message: string;
}

export default function PartnerApplicationForm({
  formData,
  handleChange,
  handleSubmit,
  loading,
}: {
  formData: PartnerFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6"
    >
      <h3 className="text-lg font-bold text-[#131b31] pb-2 border-b border-slate-100">
        Institution Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="fld-institutionname"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Institution Name *
          </label>
          <input
            id="fld-institutionname"
            name="institutionName"
            required
            value={formData.institutionName}
            onChange={handleChange}
            placeholder="e.g. University of Edinburgh"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="fld-country"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Country *
          </label>
          <input
            id="fld-country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            placeholder="e.g. United Kingdom"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="fld-institutiontype"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Institution Type *
          </label>
          <select
            id="fld-institutiontype"
            name="institutionType"
            required
            value={formData.institutionType}
            onChange={handleChange}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition bg-white"
          >
            <option value="">Select type</option>
            <option>Public University</option>
            <option>Private University</option>
            <option>College or Community College</option>
            <option>Vocational Institute</option>
            <option>Language School</option>
            <option>Online Institution</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="fld-website"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Website
          </label>
          <input
            id="fld-website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://www.example.ac.uk"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="fld-annualenrolment"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Annual Int&apos;l Enrolment
          </label>
          <select
            id="fld-annualenrolment"
            name="annualEnrolment"
            value={formData.annualEnrolment}
            onChange={handleChange}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition bg-white"
          >
            <option value="">Select range</option>
            <option>Under 100 students</option>
            <option>100 to 500 students</option>
            <option>500 to 2000 students</option>
            <option>2000 to 10000 students</option>
            <option>10000+ students</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="fld-programs"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Programs Offered
          </label>
          <input
            id="fld-programs"
            name="programs"
            value={formData.programs}
            onChange={handleChange}
            placeholder="e.g. BSc Computer Science, MBA..."
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
      </div>
      <h3 className="text-lg font-bold text-[#131b31] pb-2 border-b border-slate-100 pt-2">
        Contact Person
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="fld-contactname"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Full Name *
          </label>
          <input
            id="fld-contactname"
            name="contactName"
            required
            value={formData.contactName}
            onChange={handleChange}
            placeholder="Dr. Jane Smith"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="fld-email"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Email Address *
          </label>
          <input
            id="fld-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="partnerships@example.ac.uk"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="fld-phone"
            className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
          >
            Phone Number
          </label>
          <input
            id="fld-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+44 20 1234 5678"
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition"
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="fld-message"
          className="block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2"
        >
          Additional Message
        </label>
        <textarea
          id="fld-message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your institution, recruitment goals, or any questions..."
          className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0055c3] focus:border-transparent transition resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0055c3] text-white py-4 rounded-xl font-extrabold text-base hover:bg-[#0044a0] transition shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting Application...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-xl">send</span>Submit Partnership
            Application
          </>
        )}
      </button>
    </form>
  );
}
