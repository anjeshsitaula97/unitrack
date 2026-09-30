import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkPermission, getSession } from "@/lib/api-utils";

function capitalize(str: string) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const D_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-districts.json");
let districtsData: { id: number; name: string; province_id: number }[] = [];
try {
  if (fs.existsSync(D_FILE_PATH)) {
    districtsData = JSON.parse(fs.readFileSync(D_FILE_PATH, "utf-8"));
  }
} catch (_e) {}

const provinceDistrictMap: Record<number, string[]> = {};
districtsData.forEach((d) => {
  if (!provinceDistrictMap[d.province_id]) provinceDistrictMap[d.province_id] = [];
  provinceDistrictMap[d.province_id].push(d.name);
});

const provinceNames: Record<number, string> = {
  1: "Pradesh 1",
  2: "Madhesh",
  3: "Bagmati",
  4: "Gandaki",
  5: "Lumbini",
  6: "Karnali",
  7: "Sudurpaschim",
};

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const deniedGET = checkPermission(session, "nepal:read");
    if (deniedGET) return deniedGET;
    const { searchParams } = new URL(req.url);
    const province = searchParams.get("province");

    if (!province) {
      const result: Record<string, string[]> = {};
      Object.entries(provinceNames).forEach(([id, name]) => {
        result[name] = provinceDistrictMap[Number(id)] || [];
      });
      return NextResponse.json(result);
    }

    const provinceId = Number(province);
    const list = provinceDistrictMap[provinceId] || [];

    return NextResponse.json(list);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 });
  }
}
