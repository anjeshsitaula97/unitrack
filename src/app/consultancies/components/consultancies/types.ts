export interface Consultancy {
  id: number;
  code: string;
  name: string;
  status: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logoUrl: string | null;
  packageName: string | null;
  packageStartDate: string | null;
  packageExpiryDate: string | null;
  maxUsers: number | null;
  createdAt: string;
  userCount?: number;
}

export interface FormState {
  name: string;
  status: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logoUrl: string;
  packageName: string;
  packageStartDate: string;
  packageExpiryDate: string;
  maxUsers: string;
}

export const EMPTY_FORM: FormState = {
  name: "",
  status: "Active",
  email: "",
  phone: "",
  website: "",
  address: "",
  logoUrl: "",
  packageName: "",
  packageStartDate: "",
  packageExpiryDate: "",
  maxUsers: "",
};

export const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition";

export const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5";
