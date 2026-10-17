export interface Designation {
  id: number;
  title: string;
  description: string | null;
  _count: { members: number };
  createdAt: string;
  updatedAt: string;
}

export async function fetchDesignations(): Promise<Designation[]> {
  const res = await fetch("/api/hr/designations");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
