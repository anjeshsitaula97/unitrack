/**
 * Shared marketing footer. `base` prefixes the in-page section links so the same
 * footer works on the landing page (base "", plain anchors) and on standalone
 * marketing pages (base "/", anchors that resolve back to the landing page).
 */
export default function SiteFooter({ base = "" }: { base?: string }) {
  const anchor = (id: string) => `${base}#${id}`;

  return (
    <footer className="w-full bg-slate-50 text-slate-500 pt-16 pb-10 border-t border-slate-200/70">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 ring-1 ring-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">hub</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-slate-900 font-bold">
                UniTrack
              </span>
            </div>
            <p className="font-body-md text-body-md text-slate-500 max-w-sm">
              One platform for education consultancies and study abroad agencies &mdash; from the
              first student enquiry all the way to the visa.
            </p>
            <div className="pt-2 flex items-center gap-2 font-label-pill text-label-pill text-indigo-600">
              <span className="motion-pulse w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span>99.98% Uptime</span>
            </div>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-slate-900 mb-4">Product</div>
            <ul className="space-y-2.5 font-body-sm text-body-sm text-slate-500">
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("overview")}>
                  Overview
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("journey")}>
                  Student Journey
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("features")}>
                  Features
                </a>
              </li>
              <li>
                <a
                  className="hover:text-indigo-600 transition-colors"
                  href={anchor("crm-showcase")}
                >
                  Student CRM
                </a>
              </li>
              <li>
                <a
                  className="hover:text-indigo-600 transition-colors"
                  href={anchor("university-network")}
                >
                  Visa Workflows
                </a>
              </li>
              <li>
                <a
                  className="hover:text-indigo-600 transition-colors"
                  href={anchor("university-network")}
                >
                  Universities
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("pricing")}>
                  Pricing
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("operations")}>
                  Leads
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("operations")}>
                  HR &amp; Payroll
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("operations")}>
                  Attendance &amp; Payslips
                </a>
              </li>
              <li>
                <a className="hover:text-indigo-600 transition-colors" href={anchor("operations")}>
                  Payments &amp; Expenses
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-slate-900 mb-4">Contact us</div>
            <ul className="space-y-3 font-body-sm text-body-sm text-slate-500">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">
                  location_on
                </span>
                <span>
                  <span className="block text-slate-700">Office</span>
                  Buddhnagar-10, Kathmandu 44600, Nepal
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">mail</span>
                <span>
                  <span className="block text-slate-700">Email</span>
                  <a
                    className="hover:text-indigo-600 transition-colors"
                    href="mailto:support@unitrackcrm.com"
                  >
                    support@unitrackcrm.com
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">call</span>
                <span>
                  <span className="block text-slate-700">Phone</span>
                  <a className="hover:text-indigo-600 transition-colors" href="tel:+9779717111363">
                    +977 9717111363
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-indigo-500 text-[18px]">
                  schedule
                </span>
                <span>
                  <span className="block text-slate-700">Hours</span>
                  Sunday – Friday: 9:00 AM – 6:30 PM (NPT)
                </span>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-headline-sm text-headline-sm text-slate-900 mb-4">
              Trust &amp; Compliance
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white ring-1 ring-slate-200 shadow-sm">
                <div className="font-label-pill text-label-pill uppercase text-indigo-600 mb-1">
                  FERPA Compliant
                </div>
                <div className="font-body-sm text-body-sm text-slate-500">
                  Protects student education records.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white ring-1 ring-slate-200 shadow-sm">
                <div className="font-label-pill text-label-pill uppercase text-indigo-600 mb-1">
                  GDPR Audited
                </div>
                <div className="font-body-sm text-body-sm text-slate-500">
                  End-to-end encrypted data standards.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-white ring-1 ring-slate-200 shadow-sm">
                <div className="font-label-pill text-label-pill uppercase text-indigo-600 mb-1">
                  ISO 27001 Ready
                </div>
                <div className="font-body-sm text-body-sm text-slate-500">
                  Enterprise-grade cloud security.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-8 mt-2 border-t border-slate-200/70 flex flex-col md:flex-row items-center justify-between gap-4 font-body-sm text-body-sm text-slate-400">
          <p>&copy; 2026 UniTrack by Avenlixx Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a className="hover:text-indigo-600 transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-indigo-600 transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-indigo-600 transition-colors" href="#">
              Security Center
            </a>
            <a className="hover:text-indigo-600 transition-colors" href="#">
              Status Portal
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
