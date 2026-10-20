"use client";

import { useMemo } from "react";
import * as THREE from "three";
import SceneCanvas, { type SceneInit } from "./SceneCanvas";

/**
 * Abstract "platform core": three orbits of glowing nodes circling a central
 * data core, one orbit per system tier (Admissions / Visa / Back-Office). Reads
 * as a live, connected operating system sitting behind the dashboard frame.
 */
export default function CoreScene({ className }: { className?: string }) {
  const init = useMemo<SceneInit>(
    () => (ctx) => {
      const { scene, camera } = ctx;
      camera.position.set(0, 0.4, 6.2);
      camera.lookAt(0, 0, 0);

      const root = new THREE.Group();
      scene.add(root);

      const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      root.add(core);

      const innerGeo = new THREE.IcosahedronGeometry(0.7, 0);
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      root.add(inner);

      const tierColors = [0x818cf8, 0x38bdf8, 0x22d3ee];
      const orbits: { group: THREE.Group; speed: number }[] = [];

      tierColors.forEach((color, tier) => {
        const ring = new THREE.Group();
        const radius = 1.9 + tier * 0.7;

        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= 128; i++) {
          const a = (i / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.22 });
        ring.add(new THREE.Line(lineGeo, lineMat));

        const count = 8 - tier * 2;
        const nodeGeo = new THREE.SphereGeometry(0.07, 14, 14);
        const nodeMat = new THREE.MeshBasicMaterial({ color });
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          const node = new THREE.Mesh(nodeGeo, nodeMat);
          node.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
          ring.add(node);
        }

        ring.rotation.x = THREE.MathUtils.degToRad(68 + tier * 12);
        ring.rotation.z = THREE.MathUtils.degToRad(tier * 18 - 12);
        root.add(ring);
        orbits.push({ group: ring, speed: 0.16 - tier * 0.035 });
      });

      return {
        frame: (dt, elapsed) => {
          core.rotation.y += dt * 0.2;
          core.rotation.x += dt * 0.07;
          inner.rotation.y -= dt * 0.32;
          for (const orbit of orbits) orbit.group.rotation.y += dt * orbit.speed * 4;
          core.scale.setScalar(1 + Math.sin(elapsed * 1.1) * 0.035);

          camera.position.x += (ctx.pointer.x * 0.7 - camera.position.x) * 0.03;
          camera.position.y += (0.4 + ctx.pointer.y * 0.4 - camera.position.y) * 0.03;
          camera.lookAt(0, 0, 0);
        },
        dispose: () => {
          coreGeo.dispose();
          coreMat.dispose();
          innerGeo.dispose();
          innerMat.dispose();
          root.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (mesh.geometry) mesh.geometry.dispose();
            const mat = mesh.material as THREE.Material | undefined;
            if (mat) mat.dispose();
          });
        },
      };
    },
    []
  );

  return <SceneCanvas className={className} init={init} maxPixelRatio={1.6} />;
}
