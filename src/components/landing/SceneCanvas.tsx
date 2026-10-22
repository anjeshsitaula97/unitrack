"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion, useShouldRenderScene } from "./useScene";
import { disposeScene } from "./disposeScene";

export type SceneContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  /** Pointer position in NDC (-1..1), smoothed target for camera parallax. */
  pointer: THREE.Vector2;
  width: number;
  height: number;
};

export type SceneInit = (ctx: SceneContext) => {
  /** Advance + draw one frame. `dt` is seconds, `elapsed` is total seconds. */
  frame: (dt: number, elapsed: number) => void;
  /** Optional: intercept pointer move (e.g. raycasting). */
  onPointerMove?: (ndc: THREE.Vector2) => void;
  /** Optional: release GPU resources created imperatively by the scene. */
  dispose?: () => void;
};

/**
 * Mounts a single WebGL scene and owns its whole lifecycle:
 *  - SSR-safe gating (no context on the server / no-WebGL / small screens),
 *  - capped device pixel ratio for retina performance,
 *  - pause when off-screen or the tab is hidden (saves battery),
 *  - freeze on the first frame for `prefers-reduced-motion`,
 *  - full GPU disposal on unmount (geometries, materials, textures, renderer).
 *
 * Scenes are written imperatively (`new THREE.X()`) so disposal is explicit
 * rather than relying on the garbage collector, which never frees VRAM.
 */
export default function SceneCanvas({
  init,
  className,
  fallback,
  maxPixelRatio = 1.75,
  camera: cameraProps,
  clearColor = 0x05060b,
  alpha = true,
}: {
  init: SceneInit;
  className?: string;
  fallback?: ReactNode;
  maxPixelRatio?: number;
  camera?: { fov?: number; near?: number; far?: number; position?: [number, number, number] };
  clearColor?: number;
  alpha?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shouldRender = useShouldRenderScene();
  const reduced = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  // Keep reduced-motion current inside the imperative loop without remounting.
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    if (!shouldRender || failed) return;
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => setFailed(true));
      return;
    }

    renderer.setClearColor(clearColor, alpha ? 0 : 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    let width = Math.max(1, host.clientWidth);
    let height = Math.max(1, host.clientHeight);

    const camera = new THREE.PerspectiveCamera(
      cameraProps?.fov ?? 42,
      width / height,
      cameraProps?.near ?? 0.1,
      cameraProps?.far ?? 100
    );
    if (cameraProps?.position) camera.position.set(...cameraProps.position);

    const pointer = new THREE.Vector2(0, 0);
    const ctx: SceneContext = { scene, camera, renderer, pointer, width, height };

    let controls: ReturnType<SceneInit>;
    try {
      controls = init(ctx);
    } catch {
      renderer.dispose();
      host.removeChild(renderer.domElement);
      queueMicrotask(() => setFailed(true));
      return;
    }

    const resize = () => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      ctx.width = width;
      ctx.height = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const onPointerMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -(((e.clientY - rect.top) / rect.height) * 2 - 1)
      );
      controls.onPointerMove?.(pointer);
    };
    host.addEventListener("pointermove", onPointerMove);

    const timer = new THREE.Timer();
    timer.connect(document);
    let raf = 0;
    let running = true;
    let frozen = false;

    const tick = (timestamp: number) => {
      timer.update(timestamp);
      const dt = Math.min(timer.getDelta(), 0.05);
      const elapsed = timer.getElapsed();
      // With reduced motion we advance to a pleasing still frame once, then idle.
      if (reducedRef.current && frozen) return;
      controls.frame(reducedRef.current ? 0 : dt, reducedRef.current ? 0.75 : elapsed);
      renderer.render(scene, camera);
      if (reducedRef.current) frozen = true;
      if (running) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Pause rendering while scrolled away or the tab is in the background.
    const setRunning = (on: boolean) => {
      if (on === running) return;
      running = on;
      if (on) {
        timer.reset(); // discard the gap so dt doesn't jump on resume
        raf = requestAnimationFrame(tick);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    const io = new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(host);
    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      timer.disconnect();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      host.removeEventListener("pointermove", onPointerMove);
      try {
        controls.dispose?.();
      } catch {
        /* scene teardown is best-effort */
      }
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [shouldRender, failed, init, alpha, clearColor, maxPixelRatio, cameraProps]);

  return (
    <div ref={hostRef} className={className} aria-hidden="true">
      {(!shouldRender || failed) && fallback}
    </div>
  );
}
