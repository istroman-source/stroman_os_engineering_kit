import type { SpatialBounds } from "@/domain/creative";

export class InvalidGlbError extends Error {}

type Matrix4 = readonly number[];
const IDENTITY: Matrix4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function multiply(left: Matrix4, right: Matrix4): number[] {
  const result = new Array<number>(16).fill(0);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      for (let index = 0; index < 4; index += 1) {
        const outputIndex = column * 4 + row;
        result[outputIndex] =
          (result[outputIndex] ?? 0) + left[index * 4 + row]! * right[column * 4 + index]!;
      }
    }
  }
  return result;
}

function nodeMatrix(node: Record<string, unknown>): Matrix4 {
  if (
    Array.isArray(node.matrix) &&
    node.matrix.length === 16 &&
    node.matrix.every(Number.isFinite)
  ) {
    return node.matrix as number[];
  }
  const translation = Array.isArray(node.translation) ? (node.translation as number[]) : [0, 0, 0];
  const rotation = Array.isArray(node.rotation) ? (node.rotation as number[]) : [0, 0, 0, 1];
  const scale = Array.isArray(node.scale) ? (node.scale as number[]) : [1, 1, 1];
  const [x = 0, y = 0, z = 0, w = 1] = rotation;
  const [sx = 1, sy = 1, sz = 1] = scale;
  return [
    (1 - 2 * y * y - 2 * z * z) * sx,
    (2 * x * y + 2 * z * w) * sx,
    (2 * x * z - 2 * y * w) * sx,
    0,
    (2 * x * y - 2 * z * w) * sy,
    (1 - 2 * x * x - 2 * z * z) * sy,
    (2 * y * z + 2 * x * w) * sy,
    0,
    (2 * x * z + 2 * y * w) * sz,
    (2 * y * z - 2 * x * w) * sz,
    (1 - 2 * x * x - 2 * y * y) * sz,
    0,
    translation[0] ?? 0,
    translation[1] ?? 0,
    translation[2] ?? 0,
    1,
  ];
}

function transform(matrix: Matrix4, point: readonly [number, number, number]) {
  return {
    x: matrix[0]! * point[0] + matrix[4]! * point[1] + matrix[8]! * point[2] + matrix[12]!,
    y: matrix[1]! * point[0] + matrix[5]! * point[1] + matrix[9]! * point[2] + matrix[13]!,
    z: matrix[2]! * point[0] + matrix[6]! * point[1] + matrix[10]! * point[2] + matrix[14]!,
  };
}

function expand(
  output: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
  matrix: Matrix4,
  min: readonly number[],
  max: readonly number[],
) {
  for (const x of [min[0]!, max[0]!]) {
    for (const y of [min[1]!, max[1]!]) {
      for (const z of [min[2]!, max[2]!]) {
        const point = transform(matrix, [x, y, z]);
        output.min.x = Math.min(output.min.x, point.x);
        output.min.y = Math.min(output.min.y, point.y);
        output.min.z = Math.min(output.min.z, point.z);
        output.max.x = Math.max(output.max.x, point.x);
        output.max.y = Math.max(output.max.y, point.y);
        output.max.z = Math.max(output.max.z, point.z);
      }
    }
  }
}

export function boundsFromGltfDocument(
  document: Record<string, unknown>,
  scale: number,
): SpatialBounds {
  const nodes = Array.isArray(document.nodes) ? (document.nodes as Record<string, unknown>[]) : [];
  const meshes = Array.isArray(document.meshes)
    ? (document.meshes as Record<string, unknown>[])
    : [];
  const accessors = Array.isArray(document.accessors)
    ? (document.accessors as Record<string, unknown>[])
    : [];
  const scenes = Array.isArray(document.scenes)
    ? (document.scenes as Record<string, unknown>[])
    : [];
  const sceneIndex = typeof document.scene === "number" ? document.scene : 0;
  const roots = Array.isArray(scenes[sceneIndex]?.nodes)
    ? (scenes[sceneIndex]!.nodes as number[])
    : nodes.map((_, index) => index);
  const output = {
    min: { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY, z: Number.POSITIVE_INFINITY },
    max: { x: Number.NEGATIVE_INFINITY, y: Number.NEGATIVE_INFINITY, z: Number.NEGATIVE_INFINITY },
  };
  const walk = (nodeIndex: number, parent: Matrix4, ancestors: ReadonlySet<number>) => {
    if (ancestors.has(nodeIndex)) throw new InvalidGlbError("GLB node graph contains a cycle.");
    const node = nodes[nodeIndex];
    if (!node) return;
    const world = multiply(parent, nodeMatrix(node));
    if (typeof node.mesh === "number") {
      const mesh = meshes[node.mesh];
      const primitives = Array.isArray(mesh?.primitives)
        ? (mesh.primitives as Record<string, unknown>[])
        : [];
      for (const primitive of primitives) {
        const attributes = primitive.attributes as Record<string, unknown> | undefined;
        const accessorIndex = attributes?.POSITION;
        const accessor = typeof accessorIndex === "number" ? accessors[accessorIndex] : undefined;
        if (
          accessor?.type === "VEC3" &&
          Array.isArray(accessor.min) &&
          Array.isArray(accessor.max) &&
          accessor.min.length === 3 &&
          accessor.max.length === 3 &&
          accessor.min.every(Number.isFinite) &&
          accessor.max.every(Number.isFinite)
        ) {
          expand(output, world, accessor.min as number[], accessor.max as number[]);
        }
      }
    }
    const nextAncestors = new Set(ancestors).add(nodeIndex);
    if (Array.isArray(node.children)) {
      for (const child of node.children as number[]) walk(child, world, nextAncestors);
    }
  };
  for (const root of roots) walk(root, IDENTITY, new Set());
  if (
    ![output.min.x, output.min.y, output.min.z, output.max.x, output.max.y, output.max.z].every(
      Number.isFinite,
    )
  ) {
    throw new InvalidGlbError("GLB has no readable position bounds.");
  }
  const bounds = {
    min: { x: output.min.x * scale, y: output.min.y * scale, z: output.min.z * scale },
    max: { x: output.max.x * scale, y: output.max.y * scale, z: output.max.z * scale },
  };
  const diagonal = Math.hypot(
    bounds.max.x - bounds.min.x,
    bounds.max.y - bounds.min.y,
    bounds.max.z - bounds.min.z,
  );
  if (diagonal <= 0.1 || diagonal >= 2_000) {
    throw new InvalidGlbError("GLB bounds are not plausible for a location.");
  }
  const width = bounds.max.x - bounds.min.x;
  const height = bounds.max.y - bounds.min.y;
  const depth = bounds.max.z - bounds.min.z;
  if (width < 1 || height < 1.2 || depth < 1) {
    throw new InvalidGlbError(
      "This GLB is object-scale or too flat to navigate as a room. Check its export unit or capture more of the location.",
    );
  }
  return bounds;
}

export function readGlbBounds(bytes: Uint8Array, scale: number): SpatialBounds {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (
    bytes.byteLength < 20 ||
    view.getUint32(0, true) !== 0x46546c67 ||
    view.getUint32(4, true) !== 2 ||
    view.getUint32(8, true) !== bytes.byteLength ||
    view.getUint32(16, true) !== 0x4e4f534a
  ) {
    throw new InvalidGlbError("Choose a valid binary glTF 2.0 (.glb) scan.");
  }
  const jsonLength = view.getUint32(12, true);
  if (jsonLength <= 0 || jsonLength > bytes.byteLength - 20) {
    throw new InvalidGlbError("The GLB metadata is incomplete.");
  }
  let document: Record<string, unknown>;
  try {
    document = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + jsonLength)));
  } catch {
    throw new InvalidGlbError("The GLB metadata is not valid JSON.");
  }
  return boundsFromGltfDocument(document, scale);
}
