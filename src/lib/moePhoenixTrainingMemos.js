/**
 * 鳳凰修行① — 説明・休み・禁止事項の初期メモ（training-exp-system bridge 用）
 */

/** 鳳凰ボタン下のサブメッセージ（常時表示） */
export const MOE_PHOENIX_BUTTON_SUB_HINT =
  "（静かに整える、自力思考、めいそう、メモ整理、習慣整え、休む、断捨離、人生の目標、 ALL OK）";

/** 休みメモ用の補足（説明パネル内） */
export const MOE_PHOENIX_REST_SUB_HINT =
  "がんばりすぎない＝知恵の土台（実践ばかりで体を壊して何もできなくなった——休む勇気も鳳凰の修行）";

/** 休みメモの初期ひな形 */
export const MOE_PHOENIX_REST_GUIDE_DEFAULT = `休み — 頑張りすぎない勇気（自力思考のサブ効果）

実践ばかりで体を壊して、何もできなくなった経験から——休養は知恵の土台です。
がんばりすぎないことが、人生100年をさらに伸ばす考え方です。

休み＝🌿健康　💡知恵　⏳企画　🎂長寿`;

/** 鳳凰修行の説明メモ */
export const MOE_PHOENIX_GUIDE_MEMO_DEFAULT = `鳳凰修行＝知恵を上げる（整える · 休む · わかる）

【鳳凰でOKな活動】
自力思考 · 瞑想 · メモ整理 · 習慣を整える · 休む · 断捨離 · 人生の目標 · 企画 · 問題解決

タイマー開始＝静かに整える。メモを開いて、目標・習慣・人生設計を書いていく。

セッション終わりに「今日わかったこと」一行（任意）で振り返る——メモと瞑想の橋渡し。`;

/** ★禁止事項メモ */
export const MOE_PHOENIX_FORBIDDEN_MEMO_DEFAULT = `★禁止事項★

・ダラダラのYouTube・TV
　半端な学びが増えて、時間と命を削る行為。
　見るなら必ず「10分」と決めてから。

・他力本願
　成長が0だった。他人の教えは全く役立たず。
　特にスピリチュアル・占いは見るべからず。

・夜の学び（最大の悪）
　学びでも夜は最大の悪。目が覚醒して寝れない→寝る頃は朝→睡眠不足で毎日地獄。
　1日1時間×5回＝5時間を失う。`;

/** @returns {Record<string, string>} */
export function getMoePhoenixTrainingDefaultMemos() {
  return {
    self: "",
    blame: "",
    task: "",
    habit: "",
    rest: MOE_PHOENIX_REST_GUIDE_DEFAULT,
    guide: MOE_PHOENIX_GUIDE_MEMO_DEFAULT,
    forbidden: MOE_PHOENIX_FORBIDDEN_MEMO_DEFAULT,
  };
}

/** 振り返り一行のプレースホルダ */
export const MOE_PHOENIX_REFLECTION_PLACEHOLDER =
  "今日わかったこと（一行・任意）…";

/** 鳳凰セッション終了時に振り返りを促す活動 */
export const MOE_PHOENIX_REFLECTION_KINDS = ["phoenix"];
