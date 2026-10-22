export interface AttendanceUser {
  id: number;
  name: string;
  email: string;
  employeeId: string | null;
  avatar: string | null;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: string;
  notes: string | null;
  checkInPhoto: string | null;
  checkOutPhoto: string | null;
  checkInLat: number | null;
  checkInLng: number | null;
  checkOutLat: number | null;
  checkOutLng: number | null;
  createdAt: string;
  updatedAt: string;
  user: AttendanceUser;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

export type AttendanceAction = "checkin" | "checkout";
