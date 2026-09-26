import fs from "fs";
import { storeUploadedFile, deleteStoredFile, getUploadsDir } from "./upload-security";

const MARKETING_DIR = "marketing";

export function ensureUploadDir() {
  fs.mkdirSync(getUploadsDir(MARKETING_DIR), { recursive: true });
}

export async function saveUploadedFile(
  file: File
): Promise<{ fileName: string; fileUrl: string; fileType: string }> {
  const { fileName, fileUrl, mime } = await storeUploadedFile(file, undefined, MARKETING_DIR);
  return { fileName, fileUrl, fileType: mime };
}

export function deleteUploadedFile(fileUrl: string) {
  deleteStoredFile(fileUrl, MARKETING_DIR);
}
