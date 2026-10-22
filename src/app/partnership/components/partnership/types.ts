export interface Partner {
  id: string;
  name: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  countries?: string | null;
  _count?: { students: number };
}

export interface Univ {
  id: string;
  name: string;
  country: string;
  color?: string;
  logo?: string;
  status: string;
  partnerId?: string | null;
  partner?: { id: string; name: string } | null;
  partnershipAmount?: string | number | null;
}

export type Tab = "partnerships" | "partners";

export interface NewPartner {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  countries: string[];
}

export interface PartnershipHeaderProps {
  partnerCount: number;
  partneredUniversityCount: number;
  showAddPartner: boolean;
  onToggleAddPartner: () => void;
}

export interface AddPartnerFormProps {
  partner: NewPartner;
  onChange: (next: NewPartner) => void;
  onClose: () => void;
  onCreate: () => void;
}

export interface PartnershipStatsProps {
  partnerCount: number;
  partneredUniversityCount: number;
  studentCount: number;
  totalAmount: number;
}

export interface PartnershipToolbarProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export interface PartnershipsTableProps {
  universities: Univ[];
}

export interface PartnersGridProps {
  partners: Partner[];
  universityCountByPartner: Record<string, number>;
}

export interface PartnerCardProps {
  partner: Partner;
  universityCount: number;
}
