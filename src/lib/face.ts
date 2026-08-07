import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "/models";

let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  } catch (err) {
    modelsLoaded = false;
    throw new Error(
      "Face model loading failed: " + (err instanceof Error ? err.message : String(err))
    );
  }
}

export async function detectSingleFace(
  input: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
) {
  try {
    await loadModels();
    const result = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return result;
  } catch (err) {
    console.error("Face detection error:", err);
    return null;
  }
}

export function computeDescriptor(
  result: faceapi.WithFaceDescriptor<
    faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  >
): number[] {
  return Array.from(result.descriptor);
}

export function compareDescriptors(desc1: number[], desc2: number[]): number {
  return faceapi.euclideanDistance(desc1, desc2);
}

function _isMatch(desc1: number[], desc2: number[], threshold = 0.5): boolean {
  return compareDescriptors(desc1, desc2) <= threshold;
}

export function getFaceCenter(detection: faceapi.FaceDetection): { x: number; y: number } {
  const box = detection.box;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export function movementDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export const MOVEMENT_THRESHOLD = 1.5;
export const MOVEMENT_FRAMES = 5;
export const FALLBACK_FRAMES = 120;
