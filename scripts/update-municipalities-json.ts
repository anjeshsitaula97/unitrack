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
} catch (e) {
  console.error("Error reading data files:", e);
  process.exit(1);
}

const districtMunicipalityMap: Record<string, string[]> = {};
districtsData.forEach((d) => {
  const muniNames = municipalitiesData
    .filter((m) => m.district_id === d.id)
    .map((m) => capitalize(m.name));
  districtMunicipalityMap[d.name] = muniNames;
});

const outputPath = path.join(process.cwd(), "data", "nepal", "municipalities-by-district.json");
fs.writeFileSync(outputPath, JSON.stringify(districtMunicipalityMap, null, 2));
console.log("Updated municipalities-by-district.json with proper case formatting");
console.log("Districts:", Object.keys(districtMunicipalityMap).length);