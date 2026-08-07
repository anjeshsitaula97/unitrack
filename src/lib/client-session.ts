"use client";

let sessionActive = false;

export function activateSession() {
  sessionActive = true;
}

export function deactivateSession() {
  sessionActive = false;
}

export function isSessionActive(): boolean {
  return sessionActive;
}
