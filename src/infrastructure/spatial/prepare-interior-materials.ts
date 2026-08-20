import * as THREE from "three";

/**
 * Phone scans and photogrammetry exports do not consistently agree on whether a
 * room shell faces inward or outward. A planning camera must remain able to see
 * the captured surfaces from inside either convention.
 */
export function prepareInteriorMaterials(root: THREE.Object3D): number {
  let updated = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (material.side === THREE.DoubleSide) continue;
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
      updated += 1;
    }
  });
  return updated;
}
