import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkPermission, getSession } from "@/lib/api-utils";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

interface DistrictRecord {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface MunicipalityRecord {
  district_id: number;
  name: string;
  wards: string | number;
  [key: string]: unknown;
}

const M_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-municipalities.json");
const D_FILE_PATH = path.join(process.cwd(), "data", "nepal", "lsn-districts.json");
let municipalitiesData: MunicipalityRecord[];
let districtsData: DistrictRecord[];
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
    const session = await getSession();
    const deniedGET = checkPermission(session, "nepal:read");
    if (deniedGET) return deniedGET;
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");
    const municipality = searchParams.get("municipality");

    if (!district || !municipality) {
      return NextResponse.json([]);
    }

    const matchedDistrict = districtsData.find((d) => norm(d.name) === norm(district));
    if (!matchedDistrict) return NextResponse.json([]);

    const matchedMunicipality = municipalitiesData.find(
      (m) => m.district_id === matchedDistrict.id && norm(m.name) === norm(municipality)
    );

    if (!matchedMunicipality) return NextResponse.json([]);

    const wardCount = parseInt(String(matchedMunicipality.wards)) || 0;
    const wards = Array.from({ length: wardCount }, (_, i) => (i + 1).toString());

    return NextResponse.json(wards);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to fetch wards" }, { status: 500 });
  }
}
