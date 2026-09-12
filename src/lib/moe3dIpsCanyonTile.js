import { buildMoe3dIpsCanyonTile as buildMacro2IpsCanyonTile } from "@/lib/moe3dMacro2L1Tiles";
import {
  moe3dMapSlotById,
  moe3dTileIndexWorldRect,
} from "@/lib/moe3dWorldLayout";

/** イプス峡谷 — マクロ２ L1 地形（`moe3dMacro2L1Tiles.js`） */
export function buildMoe3dIpsCanyonTile(tileW, tileD) {
  const root = buildMacro2IpsCanyonTile(tileW, tileD);
  root.userData.ipsCanyonTile = {
    id: "ips_canyon",
    nameJa: "イプス峡谷",
    version: 2,
    altarTx: 0.5,
    altarTz: 0.52,
  };
  return root;
}

/** イプス峡谷面に展示する敵 */
export const MOE_3D_IPS_CANYON_SHOWCASE_FAMILIES = new Set([
  "turtle",
  "giant_tortoise",
]);

/**
 * イプス峡谷1面上の展示座標（Three.js x / z · フィールド y = z）
 * @param {string} familyId
 * @param {number} localX
 * @param {number} localZ
 * @param {number} tileW
 * @param {number} tileD
 * @param {number} terrainOriginX
 * @param {number} terrainOriginZ
 */
export function moe3dIpsCanyonMonsterShowcaseSpot(
  familyId,
  localX,
  localZ,
  tileW,
  tileD,
  terrainOriginX,
  terrainOriginZ
) {
  const spots = {
    turtle: { tx: 0.38, tz: 0.58, yaw: Math.PI * 0.2 },
    giant_tortoise: { tx: 0.62, tz: 0.42, yaw: -Math.PI * 0.15 },
  };
  const s = spots[familyId];
  if (!s) return null;
  return {
    x: terrainOriginX + localX + tileW * s.tx,
    y: terrainOriginZ + localZ + tileD * s.tz,
    yaw: s.yaw,
  };
}

/** イプス峡谷タイルのワールド矩形（player x / y = Three.js x / z） */
export function moe3dIpsCanyonWorldRect(tileW, tileD) {
  const slot = moe3dMapSlotById("ips_canyon");
  if (!slot || !tileW || !tileD) return null;
  return moe3dTileIndexWorldRect(slot.ix, slot.iz, tileW, tileD);
}

/** 峡谷内フィールド敵の初期配置 */
export function moe3dIpsCanyonEnemySpawnPoints(tileW, tileD) {
  const rect = moe3dIpsCanyonWorldRect(tileW, tileD);
  if (!rect) return [];
  const cx = (rect.minX + rect.maxX) / 2;
  const cz = (rect.minZ + rect.maxZ) / 2;
  const w = rect.maxX - rect.minX;
  const d = rect.maxZ - rect.minZ;
  return [
    { key: "turtle", slotInZone: 0, x: cx - w * 0.16, y: cz + d * 0.1 },
    { key: "turtle", slotInZone: 1, x: cx + w * 0.18, y: cz - d * 0.06 },
    { key: "giant_tortoise", slotInZone: 0, x: cx + w * 0.04, y: cz + d * 0.2 },
  ];
}

/**
 * イプス峡谷内リスポーン
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ x: number, y: number }} playerPos
 * @param {{ id: number, x: number, y: number, hp: number }[]} others
 * @param {number} excludeId
 */
export function moe3dPickRespawnInIpsCanyon(
  tileW,
  tileD,
  playerPos,
  others,
  excludeId
) {
  const rect = moe3dIpsCanyonWorldRect(tileW, tileD);
  if (!rect) return { x: 0, y: 0 };
  const marginX = (rect.maxX - rect.minX) * 0.12;
  const marginZ = (rect.maxZ - rect.minZ) * 0.12;
  for (let attempt = 0; attempt < 36; attempt++) {
    const x =
      rect.minX +
      marginX +
      Math.random() * (rect.maxX - rect.minX - marginX * 2);
    const y =
      rect.minZ +
      marginZ +
      Math.random() * (rect.maxZ - rect.minZ - marginZ * 2);
    if (Math.hypot(x - playerPos.x, y - playerPos.y) < 18) continue;
    let ok = true;
    for (const o of others) {
      if (o.id === excludeId || o.hp <= 0) continue;
      if (Math.hypot(x - o.x, y - o.y) < 14) {
        ok = false;
        break;
      }
    }
    if (ok) return { x, y };
  }
  const points = moe3dIpsCanyonEnemySpawnPoints(tileW, tileD);
  return points[0] ?? { x: (rect.minX + rect.maxX) / 2, y: (rect.minZ + rect.maxZ) / 2 };
}
