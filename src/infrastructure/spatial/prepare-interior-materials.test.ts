import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { prepareInteriorMaterials } from "./prepare-interior-materials";

describe("prepareInteriorMaterials", () => {
  it("makes single-sided scan surfaces visible from either side", () => {
    const material = new THREE.MeshBasicMaterial({ side: THREE.FrontSide });
    const startingVersion = material.version;
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), material));

    expect(prepareInteriorMaterials(root)).toBe(1);
    expect(material.side).toBe(THREE.DoubleSide);
    expect(material.version).toBeGreaterThan(startingVersion);
  });

  it("normalizes every material in a multi-material room mesh without repeat work", () => {
    const outward = new THREE.MeshBasicMaterial({ side: THREE.FrontSide });
    const alreadySafe = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const root = new THREE.Group();
    root.add(new THREE.Mesh(new THREE.BoxGeometry(4, 3, 5), [outward, alreadySafe]));

    expect(prepareInteriorMaterials(root)).toBe(1);
    expect(outward.side).toBe(THREE.DoubleSide);
    expect(alreadySafe.side).toBe(THREE.DoubleSide);
    expect(prepareInteriorMaterials(root)).toBe(0);
  });
});
