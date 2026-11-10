/**
 * 鳳凰スキルゲット一覧（修行① · 知恵EXP Lv10〜150）
 * ボーナス表・UI表示用（解放ロジックは段階実装）
 */

/** @typedef {{ level: number, name: string, hint: string, icon: string, sub: string, originalName?: string, status?: 'done'|'planned'|'stub'|'empty' }} MoePhoenixSkillGetEntry */

/** @type {MoePhoenixSkillGetEntry[]} */
export const MOE_PHOENIX_SKILL_GET_LEVELS = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 130, 150,
];

/** @type {MoePhoenixSkillGetEntry[]} */
export const MOE_PHOENIX_SKILL_GET_CATALOG = [
  {
    level: 10,
    name: "鳳凰の呼吸",
    icon: "🧘",
    sub: "整える",
    hint:
      "すべての始まり。心を整え自力解決·自己観察·客観視 · 走行スタミナ回復 · 修行①完了で知恵Lv必ずUP（超LvUPの元）",
    status: "planned",
  },
  {
    level: 20,
    name: "ライトヒール",
    icon: "✨",
    sub: "回復①",
    hint: "プレイヤー回復①",
    status: "planned",
  },
  {
    level: 30,
    name: "オンセン",
    icon: "♨",
    sub: "MP回復",
    hint: "温泉で眠る体に戻す — コンデンスマインド · MP回復",
    status: "planned",
  },
  {
    level: 40,
    name: "フライングフェザー",
    icon: "🪶",
    sub: "転送",
    hint:
      "羽で飛んで帰る · 現在地を記録（レコード石） · 選択地点へテレポート（未選択時はビスク中央）",
    status: "done",
  },
  {
    level: 50,
    name: "ヒーリング",
    icon: "💗",
    sub: "回復②",
    hint: "プレイヤー回復②",
    status: "planned",
  },
  {
    level: 60,
    name: "スリープディープ",
    icon: "💤",
    sub: "熟睡",
    hint: "深く眠れる — 全ステータスアップ＋リジェネ強化回復",
    status: "planned",
  },
  {
    level: 70,
    name: "バイタリティ",
    icon: "💓",
    sub: "HP+50",
    hint: "HP＋50",
    status: "planned",
  },
  {
    level: 80,
    name: "ヒールオール",
    icon: "💖",
    sub: "回復③",
    hint: "プレイヤー回復③",
    status: "planned",
  },
  {
    level: 90,
    name: "フェニックス",
    icon: "🔥",
    sub: "転生",
    hint: "リボーンワンス＋ダメージ",
    status: "planned",
  },
  {
    level: 100,
    name: "空き",
    icon: "·",
    sub: "",
    hint: "まだ決めていない",
    status: "empty",
  },
  {
    level: 130,
    name: "フェニックスオーラ",
    icon: "🔥",
    sub: "完全ガード",
    hint: "5秒間 — 物理・魔法の被ダメを無効（ペット）",
    status: "done",
  },
  {
    level: 150,
    name: "空き",
    icon: "·",
    sub: "",
    hint: "まだ決めていない",
    status: "empty",
  },
];
