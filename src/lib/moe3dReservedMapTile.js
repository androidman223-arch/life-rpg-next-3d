import * as THREE from "three";
import { buildMoe3dKanbanSign } from "@/lib/moe3dKanbanSign";
import {
  moe3dApplyMapTileScale,
  moe3dTileLocalOrigin,
  moe3dTileLocalSize,
} from "@/lib/moe3dWorldLayout";
import { appendMoe3dMacro3Terrain } from "@/lib/moe3dMacro3Apply";
import { appendMoe3dMacro2L3SpawnPads } from "@/lib/moe3dMacro2L3Spawns";
import { resetMoe3dMacro3L4Fx } from "@/lib/moe3dMacro3L4Fx";
import { MOE_MONSTER_FIELD_SPAWN_SPECS } from "@/lib/moe3dMonsterMapSpawns";
import { MOE_TERRAIN_BUFFER_PATHS_ENABLED } from "@/lib/moe3dTerrainFeatures";

const SLOT_VISUALS = {
  bisk: {
    ground: 0x94a3b8,
    accent: 0x64748b,
    rim: 0xcbd5e1,
    subtitle: "未実装 · 予約",
  },
  meerim_coast: {
    ground: 0xd4b896,
    accent: 0x38bdf8,
    rim: 0xfde68a,
    subtitle: "未実装 · 予約",
  },
  elvin_valley: {
    ground: 0x4ade80,
    accent: 0x166534,
    rim: 0x86efac,
    subtitle: "未実装 · 予約",
  },
  elvin_mountains: {
    ground: 0x78716c,
    accent: 0x44403c,
    rim: 0xa8a29e,
    subtitle: "未実装 · 予約",
  },
  sulfur_mine: {
    ground: 0x57534e,
    accent: 0xeab308,
    rim: 0xfde047,
    subtitle: "マクロ３+L3 · 白骨·黒骨·サラマンダー",
  },
  darin_mountain: {
    ground: 0x57534e,
    accent: 0x292524,
    rim: 0xa3a3a3,
    subtitle: "L6〜L8 主峰",
  },
  lexur_hills: {
    ground: 0xc4b5fd,
    accent: 0x7c3aed,
    rim: 0xddd6fe,
    subtitle: "未実装 · 予約",
  },
  garm_corridor: {
    ground: 0xa78bfa,
    accent: 0x5b21b6,
    rim: 0xc4b5fd,
    subtitle: "未実装 · 予約",
  },
  ilvana_valley: {
    ground: 0x67e8f9,
    accent: 0x0e7490,
    rim: 0xa5f3fc,
    subtitle: "未実装 · 予約",
  },
  albeez_forest: {
    ground: 0x15803d,
    accent: 0x14532d,
    rim: 0x4ade80,
    subtitle: "マクロ１+L3 · クローラー·パピー",
  },
  ips_canyon: {
    ground: 0xfdba74,
    accent: 0xc2410c,
    rim: 0xfed7aa,
    subtitle: "将来 · 予約",
  },
  ark_ruins: {
    ground: 0xfde68a,
    accent: 0xa16207,
    rim: 0xfef08a,
    subtitle: "将来 · 予約",
  },
  eisis_cave: {
    ground: 0x7dd3fc,
    accent: 0x0369a1,
    rim: 0xbae6fd,
    subtitle: "将来 · 予約",
  },
  hatiil_desert: {
    ground: 0xd4a574,
    accent: 0xb45309,
    rim: 0xfcd34d,
    subtitle: "MOE本編 · 5種湧き",
  },
  mainland_connector: {
    ground: 0xbbf7d0,
    accent: 0x4ade80,
    rim: 0xfef08a,
    subtitle: "マップ間 · 接続予約",
  },
  neoku_mountain: {
    ground: 0xf97316,
    accent: 0x9a3412,
    rim: 0xfdba74,
    subtitle: "マクロ１+L3 · ネオクオルヴァン·ノッカー",
  },
  neoku_plateau: {
    ground: 0xfb923c,
    accent: 0xc2410c,
    rim: 0xfed7aa,
    subtitle: "アルター転送 · 公式湧き未配置",
  },
  elan_palace: {
    ground: 0xfcd34d,
    accent: 0xa16207,
    rim: 0xfef08a,
    subtitle: "マクロ１+L3 · 白骨·黒骨",
  },
  war_age: {
    ground: 0xef4444,
    accent: 0x7f1d1d,
    rim: 0xfca5a5,
    subtitle: "アルター転送 · ワープ pad",
  },
  slorim_plain: {
    ground: 0xa3e635,
    accent: 0x4d7c0f,
    rim: 0xd9f99d,
    subtitle: "アルター転送 · ワープ pad",
  },
};

/**
 * 将来 GLB に差し替える予約タイル（低ポリ · 看板付き）
 * @param {number} tileW
 * @param {number} tileD
 * @param {{ id: string, nameJa: string, shortLabel?: string, order?: number, buildPhase?: number }} slot
 */
export function buildMoe3dReservedMapTile(tileW, tileD, slot) {
  const root = new THREE.Group();
  root.name = `reserved-map-${slot.id}`;

  const vis = SLOT_VISUALS[slot.id] ?? SLOT_VISUALS.mainland_connector;
  const isFuture = (slot.buildPhase ?? 1) >= 3;

  const groundMat = new THREE.MeshStandardMaterial({
    color: vis.ground,
    roughness: 0.92,
    metalness: 0.02,
    transparent: isFuture,
    opacity: isFuture ? 0.72 : 1,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: vis.accent,
    roughness: 0.88,
    transparent: isFuture,
    opacity: isFuture ? 0.75 : 1,
  });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(tileW * 0.98, 0.28, tileD * 0.98),
    groundMat
  );
  base.position.y = 0.1;
  base.receiveShadow = true;
  root.add(base);

  if (slot.id !== "mainland_connector") {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(tileW * 0.72, 0.06, tileD * 0.52),
      accentMat
    );
    pad.position.set(0, 0.28, tileD * 0.08);
    pad.receiveShadow = true;
    root.add(pad);
  } else if (MOE_TERRAIN_BUFFER_PATHS_ENABLED) {
    const path = new THREE.Mesh(
      new THREE.BoxGeometry(tileW * 0.22, 0.05, tileD * 0.88),
      accentMat
    );
    path.position.set(0, 0.26, 0);
    path.receiveShadow = true;
    root.add(path);
  }

  const kanbanTitle = slot.nameJa ?? slot.shortLabel ?? slot.id;
  const kanbanSub =
    slot.id === "mainland_connector"
      ? "試作 ↔ ビスク"
      : slot.warpOnly
        ? "アルター転送"
        : vis.subtitle;
  const sign = buildMoe3dKanbanSign(kanbanTitle, kanbanSub, {
    scale: Math.min(1.05, tileW / 48),
    boardW: Math.min(tileW * 0.42, 3.1),
  });
  sign.position.set(-tileW * 0.06, 0, -tileD * 0.32);
  root.add(sign);

  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(tileW, 0.06, tileD),
    new THREE.MeshStandardMaterial({
      color: vis.rim,
      emissive: vis.rim,
      emissiveIntensity: isFuture ? 0.06 : 0.12,
      transparent: true,
      opacity: isFuture ? 0.35 : 0.5,
    })
  );
  rim.position.y = 0.03;
  root.add(rim);

  root.userData.reservedMap = {
    id: slot.id,
    nameJa: slot.nameJa,
    order: slot.order ?? 0,
    subtitle: vis.subtitle,
    buildPhase: slot.buildPhase ?? 1,
  };

  return root;
}

/**
 * 予約タイルを terrainGroup に一括配置
 * @param {THREE.Group} terrainGroup
 * @param {number} tileW
 * @param {number} tileD
 * @param {ReturnType<import("@/lib/moe3dWorldLayout").moe3dReservedMapSlots>} slots
 * @param {(root: THREE.Group, slot: object) => void} [onEach]
 */
export function addMoe3dReservedMapTiles(terrainGroup, tileW, tileD, slots, onEach) {
  resetMoe3dMacro3L4Fx();
  for (const slot of slots) {
    const tile = buildMoe3dReservedMapTile(tileW, tileD, slot);
    moe3dApplyMapTileScale(tile);
    appendMoe3dMacro2L3SpawnPads(
      tile,
      slot.id,
      tileW,
      tileD,
      MOE_MONSTER_FIELD_SPAWN_SPECS
    );
    appendMoe3dMacro3Terrain(tile, slot.id, tileW, tileD);
    const origin = moe3dTileLocalOrigin(slot.ix, slot.iz, tileW, tileD);
    const size = moe3dTileLocalSize(slot.ix, slot.iz, tileW, tileD);
    // メッシュ原点＝面の中心 · moe3dSlotSpawnWorld の tx/tz=0.5 と一致させる
    tile.position.set(origin.x + size.w * 0.5, 0, origin.z + size.d * 0.5);
    terrainGroup.add(tile);
    onEach?.(tile, slot);
  }
}
