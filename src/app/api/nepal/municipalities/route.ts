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

const filePath = path.join(process.cwd(), "data", "nepal", "municipalities-by-district.json");
let cachedData: any = null;
try {
  if (fs.existsSync(filePath)) {
    cachedData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
} catch (e) {}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district");

    if (!cachedData) {
      return NextResponse.json([]);
    }

    const data = cachedData;

    if (district) {
      const list = data[district] || [];
      if (list.length === 0) {
        const key = Object.keys(data).find((k) => k.toLowerCase() === district.toLowerCase());
        const result = key ? data[key] : [];
        return NextResponse.json(result.map((m: string) => capitalize(m)));
      }
      return NextResponse.json(list.map((m: string) => capitalize(m)));
    }

    const result: any = {};
    Object.keys(data).forEach((k) => {
      result[capitalize(k)] = data[k].map((m: string) => capitalize(m));
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch municipalities" }, { status: 500 });
  }
}
