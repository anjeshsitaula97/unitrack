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

export type FilterState = {
  status: string;
  type: string;
  priority: string;
  search: string;
};

export type CreateFormState = {
  title: string;
  description: string;
  type: string;
  priority: string;
  dueDate: string;
  assignedTo: string;
};

export type MarketingUser = {
  id: number;
  name: string;
  email: string;
};
