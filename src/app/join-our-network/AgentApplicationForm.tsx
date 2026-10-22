export interface AgentFormData {
  agencyName: string;
  country: string;
  agencyType: string;
  website: string;
  contactName: string;
  email: string;
  phone: string;
  studentsPerYear: string;
  primaryMarkets: string;
  message: string;
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm text-[#131b31] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#585d75] focus:border-transparent transition";
const selectClass = `${inputClass} bg-white`;
const labelClass = "block text-xs font-bold text-[#434A63] uppercase tracking-wider mb-2";

export default function AgentApplicationForm({
  formData,
  onChange,
  onSubmit,
  loading,
}: {
  formData: AgentFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 space-y-6"
    >
      <h3 className="text-lg font-bold text-[#131b31] pb-2 border-b border-slate-100">
        Agency Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fld-agencyname" className={labelClass}>
            Agency Name *
          </label>
          <input
            id="fld-agencyname"
            name="agencyName"
            required
            value={formData.agencyName}
            onChange={onChange}
            placeholder="e.g. Global Pathways Agency"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="fld-country" className={labelClass}>
            Country *
          </label>
          <input
            id="fld-country"
            name="country"
            required
            value={formData.country}
            onChange={onChange}
            placeholder="e.g. Nepal"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="fld-agencytype" className={labelClass}>
            Agency Type *
          </label>
          <select
            id="fld-agencytype"
            name="agencyType"
            required
            value={formData.agencyType}
            onChange={onChange}
            className={selectClass}
          >
            <option value="">Select type</option>
            <option>Independent Education Agent</option>
            <option>Recruitment Agency</option>
            <option>Study Abroad Consultancy</option>
            <option>School or College Counselor</option>
            <option>Online Counseling Platform</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="fld-website" className={labelClass}>
            Website
          </label>
          <input
            id="fld-website"
            name="website"
            type="url"
            value={formData.website}
            onChange={onChange}
            placeholder="https://www.youragency.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="fld-studentsperyear" className={labelClass}>
            Students Placed Per Year
          </label>
          <select
            id="fld-studentsperyear"
            name="studentsPerYear"
            value={formData.studentsPerYear}
            onChange={onChange}
            className={selectClass}
          >
            <option value="">Select range</option>
            <option>Under 20 students</option>
            <option>20 to 100 students</option>
            <option>100 to 500 students</option>
            <option>500 to 1000 students</option>
            <option>1000+ students</option>
          </select>
        </div>
        <div>
          <label htmlFor="fld-primarymarkets" className={labelClass}>
            Primary Markets
          </label>
          <input
            id="fld-primarymarkets"
            name="primaryMarkets"
            value={formData.primaryMarkets}
            onChange={onChange}
            placeholder="e.g. South Asia, Southeast Asia"
            className={inputClass}
          />
        </div>
      </div>
      <h3 className="text-lg font-bold text-[#131b31] pb-2 border-b border-slate-100 pt-2">
        Contact Person
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fld-contactname" className={labelClass}>
            Full Name *
          </label>
          <input
            id="fld-contactname"
            name="contactName"
            required
            value={formData.contactName}
            onChange={onChange}
            placeholder="John Doe"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="fld-email" className={labelClass}>
            Email Address *
          </label>
          <input
            id="fld-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={onChange}
            placeholder="john@youragency.com"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="fld-phone" className={labelClass}>
            Phone Number
          </label>
          <input
            id="fld-phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onChange}
            placeholder="+977 98XXXXXXXX"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="fld-message" className={labelClass}>
          Tell Us About Your Agency
        </label>
        <textarea
          id="fld-message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={onChange}
          placeholder="Tell us about your agency, where your students are going, or any questions you have about the network..."
          className={`${inputClass} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#585d75] text-white py-4 rounded-xl font-extrabold text-base hover:bg-[#454a5e] transition shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting Application...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-xl">handshake</span>Join Our Network
          </>
        )}
      </button>
    </form>
  );
}
