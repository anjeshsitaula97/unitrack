import { NextResponse } from "next/server";
import { checkPermission, getSession } from "@/lib/api-utils";

const PROVINCES = [
  { id: 1, name: "Koshi Province" },
  { id: 2, name: "Madhesh Province" },
  { id: 3, name: "Bagmati Province" },
  { id: 4, name: "Gandaki Province" },
  { id: 5, name: "Lumbini Province" },
  { id: 6, name: "Karnali Province" },
  { id: 7, name: "Sudurpashchim Province" },
];

export async function GET() {
  const session = await getSession();
  const deniedGET = checkPermission(session, "nepal:read");
  if (deniedGET) return deniedGET;
  return NextResponse.json(PROVINCES);
}
