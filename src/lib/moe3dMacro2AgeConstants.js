/** マクロ２ L1 — AGE大陸（アルター転送 · 専用地形） */
export const MOE_AGE_MAP_SLOT_IDS = new Set([
  "yug_coast",
  "soles_valley",
  "geo_abyss_ne",
  "geo_abyss_s",
  "geo_abyss_w",
  "mitoya_great_tree",
]);

/** 家AGE — ユグ海岸〜ミトヤの大樹（プレイヤー宅が並ぶ番地 · 敵湧きなし） */
export const MOE_AGE_HOME_ROW_SLOT_IDS = new Set([
  "yug_coast",
  "mitoya_great_tree",
]);

/** AGE列 iz=4 — 東→西（境界で西の面に吸われないようミトヤを先に判定） */
export const MOE_AGE_ROW_SLOT_ORDER_EAST_FIRST = [
  "mitoya_great_tree",
  "geo_abyss_w",
  "geo_abyss_s",
  "geo_abyss_ne",
  "soles_valley",
  "yug_coast",
];
