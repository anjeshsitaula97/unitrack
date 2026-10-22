export interface DashboardPartner {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  _count?: { students?: number };
}

export interface DashboardUniversity {
  id: string;
  name: string;
  partnerId?: string | null;
  country?: string | null;
  partner?: { name?: string } | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}

export interface DashboardStudent {
  id: string;
  name: string;
  email?: string | null;
  partnerId?: string | null;
  partner?: { name?: string } | null;
  interestedCountry?: string | null;
  status?: string | null;
}
