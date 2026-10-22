import * as THREE from "three";

/**
 * Traverses a scene and frees every GPU-bound resource: geometries, all
 * material texture slots, and the materials themselves. `scene.remove()` alone
 * frees nothing on the GPU, so this walk is what prevents VRAM leaks.
 */
export function disposeScene(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    for (const mat of materials) {
      for (const key of Object.keys(mat)) {
        const value = (mat as unknown as Record<string, unknown>)[key];
        if (value && (value as THREE.Texture).isTexture) (value as THREE.Texture).dispose();
      }
      mat.dispose();
    }
  });
}
