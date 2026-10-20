"use client";

import { useMemo } from "react";
import * as THREE from "three";
import SceneCanvas, { type SceneInit } from "./SceneCanvas";

/**
 * 3D flow field: a drifting field of points pushed along a smooth curl-like
 * vector field, with faint connective lines between close neighbours. Evokes
 * the back-office "leads, people and money moving through one system" idea.
 * One BufferGeometry, one draw call, animated entirely on the CPU per frame.
 */
const COUNT = 900;
const SPREAD = 9;
const BOUND = 6.5;

/** Cheap deterministic pseudo-noise field → smooth, looping attraction. */
function field(x: number, y: number, z: number, t: number, out: THREE.Vector3) {
  const s = 0.35;
  out.set(
    Math.sin(y * s + t * 0.5) * Math.cos(z * s - t * 0.3),
    Math.sin(z * s + t * 0.4) * Math.cos(x * s + t * 0.2),
    Math.sin(x * s - t * 0.35) * Math.cos(y * s + t * 0.45)
  );
  return out;
}

export default function ParticleFlow({ className }: { className?: string }) {
  const init = useMemo<SceneInit>(
    () => (ctx) => {
      const { scene, camera } = ctx;
      camera.position.set(0, 0, 9);
      camera.lookAt(0, 0, 0);

      // Seed positions from a fixed LCG so every load reproduces the same field.
      let seed = 1337;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };

      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const palette = [
        new THREE.Color(0x818cf8),
        new THREE.Color(0x38bdf8),
        new THREE.Color(0xa78bfa),
      ];

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (rand() - 0.5) * SPREAD;
        positions[i * 3 + 1] = (rand() - 0.5) * SPREAD;
        positions[i * 3 + 2] = (rand() - 0.5) * SPREAD * 0.6;
        const c = palette[i % palette.length];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      // Soft round sprite so points don't read as harsh squares.
      const sprite = (() => {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        const g = canvas.getContext("2d")!;
        const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, "rgba(255,255,255,1)");
        grad.addColorStop(0.4, "rgba(255,255,255,0.7)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = grad;
        g.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
      })();

      const mat = new THREE.PointsMaterial({
        size: 0.12,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geo, mat);
      scene.add(points);

      const force = new THREE.Vector3();
      const attr = geo.getAttribute("position") as THREE.BufferAttribute;

      const frame = (dt: number, elapsed: number): void => {
        const arr = attr.array as Float32Array;
        for (let i = 0; i < COUNT; i++) {
          const ix = i * 3;
          field(arr[ix], arr[ix + 1], arr[ix + 2], elapsed, force);
          arr[ix] += force.x * dt * 0.6;
          arr[ix + 1] += force.y * dt * 0.6;
          arr[ix + 2] += force.z * dt * 0.6;

          // Wrap within the box so the field never depletes.
          for (let k = 0; k < 3; k++) {
            if (arr[ix + k] > BOUND) arr[ix + k] = -BOUND;
            else if (arr[ix + k] < -BOUND) arr[ix + k] = BOUND;
          }
        }
        attr.needsUpdate = true;

        points.rotation.y += dt * 0.05;
        camera.position.x += (ctx.pointer.x * 0.9 - camera.position.x) * 0.02;
        camera.position.y += (ctx.pointer.y * 0.6 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      };

      return {
        frame,
        dispose: () => {
          geo.dispose();
          mat.dispose();
          sprite.dispose();
        },
      };
    },
    []
  );

  return <SceneCanvas className={className} init={init} maxPixelRatio={1.5} />;
}
