/**
 * 垂直円柱（XZ は楕円断面）— プレイヤーは円で近似
 * @typedef {{ cx: number, cz: number, rx: number, rz: number }} Moe3dColumnCollider2d
 */

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} playerR
 * @param {Moe3dColumnCollider2d} col
 */
export function moe3dCircleHitsColumn(px, pz, playerR, col) {
  const dx = px - col.cx;
  const dz = pz - col.cz;
  const rx = col.rx + playerR;
  const rz = col.rz + playerR;
  return (dx * dx) / (rx * rx) + (dz * dz) / (rz * rz) <= 1 + 1e-8;
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {Moe3dColumnCollider2d[]} columns
 * @param {number} [radius]
 */
export function moe3dDestinationBlockedByColumns(
  px,
  pz,
  nx,
  nz,
  columns,
  radius = 0.55
) {
  for (const col of columns) {
    if (moe3dCircleHitsColumn(nx, nz, radius, col)) return true;
  }
  return false;
}

/**
 * @param {number} x0
 * @param {number} z0
 * @param {number} x1
 * @param {number} z1
 * @param {Moe3dColumnCollider2d[]} columns
 * @param {number} [radius]
 */
export function moe3dSegmentBlockedByColumns(
  x0,
  z0,
  x1,
  z1,
  columns,
  radius = 0.55
) {
  const dist = Math.hypot(x1 - x0, z1 - z0);
  if (dist < 0.001) {
    return moe3dDestinationBlockedByColumns(x0, z0, x1, z1, columns, radius);
  }
  const step = Math.max(0.22, radius * 0.42);
  const steps = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const z = z0 + (z1 - z0) * t;
    for (const col of columns) {
      if (moe3dCircleHitsColumn(x, z, radius, col)) return true;
    }
  }
  return false;
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {Moe3dColumnCollider2d[]} columns
 * @param {number} [radius]
 * @returns {{ x: number, z: number }}
 */
function moe3dClampMoveStepColumns(px, pz, nx, nz, columns, radius = 0.55) {
  if (!columns?.length) return { x: nx, z: nz };
  if (!moe3dSegmentBlockedByColumns(px, pz, nx, nz, columns, radius)) {
    return { x: nx, z: nz };
  }
  if (!moe3dSegmentBlockedByColumns(px, pz, nx, pz, columns, radius)) {
    return { x: nx, z: pz };
  }
  if (!moe3dSegmentBlockedByColumns(px, pz, px, nz, columns, radius)) {
    return { x: px, z: nz };
  }
  return { x: px, z: pz };
}

/**
 * @param {number} px
 * @param {number} pz
 * @param {number} nx
 * @param {number} nz
 * @param {Moe3dColumnCollider2d[]} columns
 * @param {number} [radius]
 * @returns {{ x: number, z: number }}
 */
export function moe3dClampMoveAgainstColumnColliders(
  px,
  pz,
  nx,
  nz,
  columns,
  radius = 0.55
) {
  if (!columns?.length) return { x: nx, z: nz };
  const dist = Math.hypot(nx - px, nz - pz);
  if (dist < 0.001) {
    return moe3dClampMoveStepColumns(px, pz, nx, nz, columns, radius);
  }
  const maxStep = Math.max(0.28, radius * 0.5);
  const steps = Math.max(1, Math.ceil(dist / maxStep));
  let x = px;
  let z = pz;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const tx = px + (nx - px) * t;
    const tz = pz + (nz - pz) * t;
    const next = moe3dClampMoveStepColumns(x, z, tx, tz, columns, radius);
    x = next.x;
    z = next.z;
  }
  return { x, z };
}
