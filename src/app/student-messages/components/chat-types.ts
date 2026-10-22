export interface Conversation {
  id: string;
  studentId: string;
  staffId: string;
  subject: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
  student: { id: string; name: string; email: string; photoUrl: string | null };
  staff: { id: string; name: string; email: string; role: string };
  messages: { content: string; createdAt: string }[];
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  photoUrl: string | null;
  status: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
