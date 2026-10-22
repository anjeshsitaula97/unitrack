export interface Univ {
  id: string;
  name: string;
  country: string;
  color?: string;
  logo?: string;
  status: string;
  type?: string;
  founded?: string | number | null;
  partnerId?: string | null;
  partner?: { id: string; name: string } | null;
  partnershipAmount?: string | number | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}

export interface Course {
  id: string;
  name: string;
  universityId: string;
  university?: string;
  universityLogo?: string | null;
  status?: string;
  courseCode?: string | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
}

export interface CommissionRow {
  key: string;
  kind: "university" | "course";
  univId: string;
  courseId: string | null;
  name: string;
  subtitle: string;
  color?: string;
  logo?: string;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
  partnershipAmount?: string | number | null;
  country: string;
}

export interface ModalInitial {
  kind: "university" | "course";
  univId: string;
  courseId: string | null;
  commissionType?: string | null;
  commissionValue?: string | number | null;
  commissionCurrency?: string | null;
  partnershipAmount?: string | number | null;
}

export interface CommissionModalProps {
  universities: Univ[];
  courses: Course[];
  initial: ModalInitial | null;
  saving: boolean;
  onClose: () => void;
  onSave: (
    univId: string,
    courseId: string,
    commissionType: string,
    commissionValue: string,
    commissionCurrency: string,
    partnershipAmount: string
  ) => Promise<void>;
}
