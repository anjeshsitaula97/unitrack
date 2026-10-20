"use client";

import { useMemo } from "react";
import * as THREE from "three";
import SceneCanvas, { type SceneContext, type SceneInit } from "./SceneCanvas";

/* Destination hubs pulled from the Destinations section (AU / UK / US / CA). */
const HUBS: { name: string; lat: number; lon: number; color: number }[] = [
  { name: "Australia", lat: -33.87, lon: 151.21, color: 0x38bdf8 },
  { name: "United Kingdom", lat: 51.51, lon: -0.13, color: 0x818cf8 },
  { name: "United States", lat: 38.9, lon: -77.04, color: 0xa78bfa },
  { name: "Canada", lat: 45.42, lon: -75.7, color: 0x22d3ee },
];

const ORIGIN = { lat: 27.72, lon: 85.32 }; // Kathmandu intake hub

/** lat/lon (degrees) → point on a sphere of the given radius. */
function toVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Great-circle arc between two lat/lon points, lifted off the surface so it
 * reads as a flight path rather than a line through the globe.
 */
function arcCurve(from: THREE.Vector3, to: THREE.Vector3, radius: number) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  const lift = 1 + from.distanceTo(to) / (radius * 2.6);
  mid.normalize().multiplyScalar(radius * lift);
  return new THREE.QuadraticBezierCurve3(from, mid, to);
}

function buildScene(ctx: SceneContext) {
  const { scene, camera } = ctx;
  const RADIUS = 2;

  camera.position.set(0, 0.35, 6.4);
  camera.lookAt(0, 0, 0);

  const globe = new THREE.Group();
  globe.rotation.z = THREE.MathUtils.degToRad(-12); // axial tilt
  scene.add(globe);

  /* ── Wireframe atmosphere shell ─────────────────────────────────────────── */
  const shellGeo = new THREE.IcosahedronGeometry(RADIUS, 4);
  const shellMat = new THREE.MeshBasicMaterial({
    color: 0x3b4a6b,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  globe.add(shell);

  /* ── Inner core: a soft opaque sphere so back-side wireframe reads as depth */
  const coreGeo = new THREE.SphereGeometry(RADIUS * 0.985, 48, 48);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x070912 });
  const core = new THREE.Mesh(coreGeo, coreMat);
  globe.add(core);

  /* ── Latitude/longitude grid lines for a technical read ─────────────────── */
  const gridPoints: number[] = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    const count = 96;
    for (let i = 0; i < count; i++) {
      const a = toVec3(lat, (i / count) * 360 - 180, RADIUS * 1.001);
      const b = toVec3(lat, ((i + 1) / count) * 360 - 180, RADIUS * 1.001);
      gridPoints.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  const gridGeo = new THREE.BufferGeometry();
  gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPoints, 3));
  const gridMat = new THREE.LineBasicMaterial({
    color: 0x4f46e5,
    transparent: true,
    opacity: 0.14,
  });
  globe.add(new THREE.LineSegments(gridGeo, gridMat));

  /* ── Destination nodes ──────────────────────────────────────────────────── */
  const nodeGeo = new THREE.SphereGeometry(0.045, 16, 16);
  const originVec = toVec3(ORIGIN.lat, ORIGIN.lon, RADIUS * 1.01);
  const hubVecs: { vec: THREE.Vector3; color: number }[] = [];

  for (const hub of HUBS) {
    const vec = toVec3(hub.lat, hub.lon, RADIUS * 1.01);
    hubVecs.push({ vec, color: hub.color });

    const nodeMat = new THREE.MeshBasicMaterial({ color: hub.color });
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.copy(vec);
    globe.add(node);

    // Halo ring around each hub for a "signal" look.
    const ringGeo = new THREE.RingGeometry(0.075, 0.095, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hub.color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(vec).multiplyScalar(1.002);
    ring.lookAt(0, 0, 0);
    globe.add(ring);
  }

  // Origin marker (Kathmandu) pulses via emissive-ish color in the loop.
  const originMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const originNode = new THREE.Mesh(nodeGeo, originMat);
  originNode.scale.setScalar(1.25);
  originNode.position.copy(originVec);
  globe.add(originNode);

  /* ── Flight-path arcs from the origin hub to each destination ───────────── */
  const arcLines: { line: THREE.Line; progress: number; speed: number }[] = [];
  const pulses: THREE.Mesh[] = [];

  hubVecs.forEach((hub, i) => {
    const curve = arcCurve(originVec.clone(), hub.vec.clone(), RADIUS);
    const pts = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const color = new THREE.Color(hub.color);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
    });
    const line = new THREE.Line(geo, mat);
    globe.add(line);
    arcLines.push({ line, progress: i * 0.18, speed: 0.14 + i * 0.03 });

    // Travelling pulse dot along each arc.
    const pulseMat = new THREE.MeshBasicMaterial({ color });
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), pulseMat);
    globe.add(pulse);
    pulse.userData.curve = curve;
    pulses.push(pulse);
  });

  const frame = (dt: number, elapsed: number): void => {
    globe.rotation.y += dt * 0.12;

    // Gentle pointer-driven parallax on the whole scene.
    camera.position.x += (ctx.pointer.x * 0.6 - camera.position.x) * 0.03;
    camera.position.y += (0.35 + ctx.pointer.y * 0.35 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    // Brighten the origin marker in a slow breath.
    const breath = 0.5 + 0.5 * Math.sin(elapsed * 1.6);
    originMat.color.setRGB(0.88 + breath * 0.12, 0.9, 0.95);

    // Animate each pulse travelling along its arc.
    pulses.forEach((pulse, i) => {
      const curve = pulse.userData.curve as THREE.QuadraticBezierCurve3;
      const t = (elapsed * 0.24 + i * 0.2) % 1;
      pulse.position.copy(curve.getPointAt(t));
    });
  };

  const dispose = () => {
    shellGeo.dispose();
    shellMat.dispose();
    coreGeo.dispose();
    coreMat.dispose();
    gridGeo.dispose();
    gridMat.dispose();
    nodeGeo.dispose();
    originMat.dispose();
    for (const arc of arcLines) {
      arc.line.geometry.dispose();
      (arc.line.material as THREE.Material).dispose();
    }
    for (const pulse of pulses) {
      pulse.geometry.dispose();
      (pulse.material as THREE.Material).dispose();
    }
  };

  return { frame, dispose };
}

export default function GlobeScene({ className }: { className?: string }) {
  const init = useMemo<SceneInit>(() => (ctx) => buildScene(ctx), []);
  return <SceneCanvas className={className} init={init} maxPixelRatio={1.75} />;
}
