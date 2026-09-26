import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function capitalize(str: string) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const M_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-municipalities.json");
const D_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-districts.json");
let municipalitiesData: { district_id: number; name: string }[] = [];
let districtsData: { id: number; name: string }[] = [];
try {
  if (fs.existsSync(M_FILE_PATH) && fs.existsSync(D_FILE_PATH)) {
    municipalitiesData = JSON.parse(fs.readFileSync(M_FILE_PATH, "utf-8"));
    districtsData = JSON.parse(fs.readFileSync(D_FILE_PATH, "utf-8"));
  }
} catch (_e) {}

const districtMunicipalityMap: Record<string, string[]> = {};
districtsData.forEach((d) => {
  const muniNames = municipalitiesData
    .filter((m) => m.district_id === d.id)
    .map((m) => m.name);
  districtMunicipalityMap[d.name] = muniNames;
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");

    if (!district) {
      const result: Record<string, string[]> = {};
      Object.keys(districtMunicipalityMap).forEach((k) => {
        result[k] = districtMunicipalityMap[k];
      });
      return NextResponse.json(result);
    }

    const matchedDistrict = districtsData.find((d) => d.name.toLowerCase() === district.toLowerCase());
    if (!matchedDistrict) return NextResponse.json([]);

    const list = districtMunicipalityMap[matchedDistrict.name] || [];
    return NextResponse.json(list);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch municipalities" }, { status: 500 });
  }
}
