import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const M_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-municipalities.json");
const D_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-districts.json");
let municipalitiesData: any[];
let districtsData: any[];
try {
  if (fs.existsSync(M_FILE_PATH) && fs.existsSync(D_FILE_PATH)) {
    municipalitiesData = JSON.parse(fs.readFileSync(M_FILE_PATH, "utf-8"));
    districtsData = JSON.parse(fs.readFileSync(D_FILE_PATH, "utf-8"));
  } else {
    municipalitiesData = [];
    districtsData = [];
  }
} catch {
  municipalitiesData = [];
  districtsData = [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const municipality = searchParams.get("municipality");

    if (!district || !municipality) {
      return NextResponse.json([]);
    }

    const matchedDistrict = districtsData.find((d: any) => norm(d.name) === norm(district));
    if (!matchedDistrict) return NextResponse.json([]);

    const matchedMunicipality = municipalitiesData.find(
      (m: any) => m.district_id === matchedDistrict.id && norm(m.name) === norm(municipality)
    );

    if (!matchedMunicipality) return NextResponse.json([]);

    const wardCount = parseInt(matchedMunicipality.wards) || 0;
    const wards = Array.from({ length: wardCount }, (_, i) => (i + 1).toString());

    return NextResponse.json(wards);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch wards" }, { status: 500 });
  }
}
