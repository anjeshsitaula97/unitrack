import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function capitalize(str: string) {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

const FILE_PATH = path.join(process.cwd(), 'data', 'nepal', 'provinces.json');
let provincesData: string[];
try {
  if (fs.existsSync(FILE_PATH)) {
    provincesData = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));
  } else {
    provincesData = ["Koshi Province", "Madhesh Province", "Bagmati Province", "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province"];
  }
} catch {
  provincesData = ["Koshi Province", "Madhesh Province", "Bagmati Province", "Gandaki Province", "Lumbini Province", "Karnali Province", "Sudurpashchim Province"];
}

export async function GET() {
  return NextResponse.json(provincesData.map((p: string) => capitalize(p)));
}
