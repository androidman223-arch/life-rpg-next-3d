/**
 * AmbientBgm — 曲カタログ（純粋データ + パス解決）
 */

export const BGM_TRACK_STORAGE_KEY = "life-rpg-bgm-track";
export const BGM_VOLUME_STORAGE_KEY = "life-rpg-bgm-volume-v5";
export const DEFAULT_BGM_VOLUME = 0.22;

const BGM_DIR = "/assets/bgm";

/** ローカル専用（.gitignore — public/assets/bgm/ambient-bgm*.mp3） */
export const MOE_AMBIENT_LOCAL_TRACKS = [
  {
    id: "local",
    label: "マイ BGM：ambient-bgm.mp3",
    path: "/ambient-bgm.mp3",
  },
  ...Array.from({ length: 6 }, (_, i) => {
    const n = i + 2;
    return {
      id: `local${n}`,
      label: `マイ BGM ${n}：ambient-bgm-${n}.mp3`,
      path: `${BGM_DIR}/ambient-bgm-${n}.mp3`,
    };
  }),
  {
    id: "eruan",
    label: "エルアン：ambient-bgm-8eruan.mp3",
    path: "/ambient-bgm-8eruan.mp3.mp3",
  },
];

export const MOE_AMBIENT_DEFAULT_LOCAL_TRACK_ID = MOE_AMBIENT_LOCAL_TRACKS[0].id;

/** リポジトリ同梱（Kevin MacLeod / Incompetech・CC BY 4.0） */
export const MOE_AMBIENT_ROYALTY_TRACKS = [
  {
    id: "carefree",
    label: "フリー：bgm-royalty-free.mp3（のんびり・街・日常）",
    path: `${BGM_DIR}/bgm-royalty-free.mp3`,
  },
  {
    id: "castle",
    label: "フリー：bgm-royalty-free-castle.mp3（城・宮殿・物語）",
    path: `${BGM_DIR}/bgm-royalty-free-castle.mp3`,
  },
  {
    id: "field",
    label: "フリー：bgm-royalty-free-field.mp3（フィールド・散策）",
    path: `${BGM_DIR}/bgm-royalty-free-field.mp3`,
  },
  {
    id: "battle",
    label: "フリー：bgm-royalty-free-battle.mp3（アクション・戦闘）",
    path: `${BGM_DIR}/bgm-royalty-free-battle.mp3`,
  },
];

export const MOE_AMBIENT_BGM_SELECT_OPTIONS = [
  ...MOE_AMBIENT_LOCAL_TRACKS,
  ...MOE_AMBIENT_ROYALTY_TRACKS,
];

/** @param {string} id */
export function moeAmbientBgmPathForTrackId(id) {
  const local = MOE_AMBIENT_LOCAL_TRACKS.find((t) => t.id === id);
  if (local) return local.path;
  return (
    MOE_AMBIENT_ROYALTY_TRACKS.find((t) => t.id === id)?.path ??
    MOE_AMBIENT_ROYALTY_TRACKS[0].path
  );
}

/** @param {string} id */
export function isMoeAmbientLocalTrackId(id) {
  return MOE_AMBIENT_LOCAL_TRACKS.some((t) => t.id === id);
}

/** @param {string} id */
export function isMoeAmbientValidTrackId(id) {
  return (
    isMoeAmbientLocalTrackId(id) ||
    MOE_AMBIENT_ROYALTY_TRACKS.some((t) => t.id === id)
  );
}
