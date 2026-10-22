export interface Note {
  id: string;
  studentId: string;
  content: string;
  authorType: "staff" | "student";
  authorName: string;
  authorRole: string | null;
  authorId: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
