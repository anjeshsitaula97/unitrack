"use client";

import { useCallback, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Cached WebGL probe — created once, never during SSR. */
let webglProbe: boolean | null = null;
function probeWebGL(): boolean {
  if (webglProbe !== null) return webglProbe;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    webglProbe = Boolean(gl);
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

/** Subscribe to a media query; emits the current match immediately. */
function subscribeToMediaQuery(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Detects whether the browser can create a WebGL context. Reads through
 * `useSyncExternalStore` so the server snapshot is always `false` and there is
 * no post-mount setState cascade — scenes simply appear once hydrated.
 */
export function useWebGLSupport(): boolean {
  const getSnapshot = useCallback(() => probeWebGL(), []);
  return useSyncExternalStore(noopSubscribe, getSnapshot, () => false);
}

/** True when the visitor asks for reduced motion; reacts to live OS changes. */
export function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToMediaQuery("(prefers-reduced-motion: reduce)", onChange),
    []
  );
  const getSnapshot = useCallback(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Coarse capability gate: scenes stay off on small screens and without WebGL. */
export function useShouldRenderScene({ minWidth = 768 }: { minWidth?: number } = {}): boolean {
  const webgl = useWebGLSupport();
  const subscribe = useCallback(
    (onChange: () => void) => subscribeToMediaQuery(`(min-width: ${minWidth}px)`, onChange),
    [minWidth]
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(`(min-width: ${minWidth}px)`).matches,
    [minWidth]
  );
  const sizeOk = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return webgl && sizeOk;
}
