/**
 * 鳳凰スキルゲット一覧（修行① · 知恵EXP Lv10〜90）
 * ボーナス表・UI表示用（解放ロジックは段階実装）
 *
 * `originalName` … フィールド／ペット技②の実名（リネーム前）
 */

/** @typedef {{ level: number, name: string, hint: string, icon: string, sub: string, originalName?: string, status?: 'done'|'planned'|'stub' }} MoePhoenixSkillGetEntry */

/** @type {MoePhoenixSkillGetEntry[]} */
export const MOE_PHOENIX_SKILL_GET_LEVELS = [
  10, 20, 30, 40, 50, 60, 70, 80, 90,
];

/** @type {MoePhoenixSkillGetEntry[]} */
export const MOE_PHOENIX_SKILL_GET_CATALOG = [
  {
    level: 10,
    name: "鳳凰の呼吸",
    icon: "🧘",
    sub: "整える",
    originalName: "自力整然",
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
    originalName: "温泉調気",
    hint: "温泉で眠る体に戻す — コンデンスマインド · MP回復",
    status: "planned",
  },
  {
    level: 40,
    name: "フライングフェザー",
    icon: "🪶",
    sub: "転送",
    originalName: "テレポート",
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
    originalName: "深睡眠眠",
    hint: "深く眠れる — 全ステータスアップ＋リジェネ強化回復",
    status: "planned",
  },
  {
    level: 70,
    name: "バイタリティ",
    icon: "💓",
    sub: "HP+50",
    originalName: "生命爆神",
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
    originalName: "生活改鳳",
    hint: "リボーンワンス＋ダメージ（旧名・生活改鳳 · 後でリネーム検討）",
    status: "planned",
  },
];
