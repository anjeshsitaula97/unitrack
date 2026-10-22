export type MarketingRequest = {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  requestedBy: number;
  assignedTo: number | null;
  requester: { id: number; name: string; email: string; avatar: string | null };
  assignee: { id: number; name: string; email: string; avatar: string | null } | null;
  materials: MarketingMaterial[];
};

export type MarketingMaterial = {
  id: number;
  requestId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: number;
  description: string | null;
  isFinal: boolean;
  createdAt: string;
  uploader: { id: number; name: string; avatar: string | null };
};

export const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export const PRIORITY_COLORS: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

export const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];

export interface RequestHeaderProps {
  request: MarketingRequest;
  isSaving: boolean;
  onSaveStatus: (status: string) => void;
  onBack: () => void;
}

export interface UploadSectionProps {
  uploading: boolean;
  dragActive: boolean;
  selectedFile: File | null;
  materialDescription: string;
  isFinal: boolean;
  setDragActive: (value: boolean) => void;
  setSelectedFile: (file: File | null) => void;
  setMaterialDescription: (value: string) => void;
  setIsFinal: (value: boolean) => void;
  handleUpload: () => void;
}

export interface DeliveredMaterialsProps {
  materials: MarketingMaterial[];
  onDownload: (url: string, fileName: string) => void;
  onDelete: (materialId: number) => void;
}
