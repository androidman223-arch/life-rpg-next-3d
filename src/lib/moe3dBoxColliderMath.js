/**
 * @typedef {{ minX: number, maxX: number, minZ: number, maxZ: number }} Moe3dBoxCollider2d
 */

/**
 * @param {number} cx
 * @param {number} cz
 * @param {number} radius
 * @param {Moe3dBoxCollider2d} box
 */
export function moe3dCircleHitsBox(cx, cz, radius, box) {
  const closestX = Math.max(box.minX, Math.min(cx, box.maxX));
  const closestZ = Math.max(box.minZ, Math.min(cz, box.maxZ));
  const dx = cx - closestX;
  const dz = cz - closestZ;
  const r2 = radius * radius;
  return dx * dx + dz * dz <= r2 + 1e-8;
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {Moe3dBoxCollider2d[]} boxes
 * @param {number} [radius]
 */
export function moe3dDestinationBlockedByBoxes(px, pz, nx, nz, boxes, radius = 0.55) {
  for (const box of boxes) {
    if (moe3dCircleHitsBox(nx, nz, radius, box)) return true;
  }
  return false;
}

/**
 * @param {number} x0
 * @param {number} z0
 * @param {number} x1
 * @param {number} z1
 * @param {Moe3dBoxCollider2d[]} boxes
 * @param {number} [radius]
 */
export function moe3dSegmentBlockedByBoxes(x0, z0, x1, z1, boxes, radius = 0.55) {
  const dist = Math.hypot(x1 - x0, z1 - z0);
  if (dist < 0.001) {
    return moe3dDestinationBlockedByBoxes(x0, z0, x1, z1, boxes, radius);
  }
  const step = Math.max(0.22, radius * 0.42);
  const steps = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const z = z0 + (z1 - z0) * t;
    for (const box of boxes) {
      if (moe3dCircleHitsBox(x, z, radius, box)) return true;
    }
  }
  return false;
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {Moe3dBoxCollider2d[]} boxes
 * @param {number} [radius]
 * @returns {{ x: number, z: number }}
 */
function moe3dClampMoveStep(px, pz, nx, nz, boxes, radius = 0.55) {
  if (!boxes?.length) return { x: nx, z: nz };
  if (!moe3dSegmentBlockedByBoxes(px, pz, nx, nz, boxes, radius)) {
    return { x: nx, z: nz };
  }
  if (!moe3dSegmentBlockedByBoxes(px, pz, nx, pz, boxes, radius)) {
    return { x: nx, z: pz };
  }
  if (!moe3dSegmentBlockedByBoxes(px, pz, px, nz, boxes, radius)) {
    return { x: px, z: nz };
  }
  return { x: px, z: pz };
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {Moe3dBoxCollider2d[]} boxes
 * @param {number} [radius]
 * @returns {{ x: number, z: number }}
 */
export function moe3dClampMoveAgainstBoxColliders(
  px,
  pz,
  nx,
  nz,
  boxes,
  radius = 0.55
) {
  if (!boxes?.length) return { x: nx, z: nz };
  const dist = Math.hypot(nx - px, nz - pz);
  if (dist < 0.001) {
    return moe3dClampMoveStep(px, pz, nx, nz, boxes, radius);
  }
  const maxStep = Math.max(0.28, radius * 0.5);
  const steps = Math.max(1, Math.ceil(dist / maxStep));
  let x = px;
  let z = pz;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const tx = px + (nx - px) * t;
    const tz = pz + (nz - pz) * t;
    const next = moe3dClampMoveStep(x, z, tx, tz, boxes, radius);
    x = next.x;
    z = next.z;
  }
  return { x, z };
}
