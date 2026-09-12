/**
 * MOE フィールド — サブシステム地図（コード内ドキュメント）
 *
 * 新機能を足す前に「どの箱に入れるか」をここで確認する。
 * コンソール: import { printMoeSubsystemGuide } from '@/lib/moe/moeSubsystemGuide'
 */

/** @typedef {'orchestrator'|'pure'|'ui'|'canvas'|'persistence'} MoeLayer */

/**
 * @type {Record<string, {
 *   purpose: string,
 *   layer: MoeLayer,
 *   stateOwner: string,
 *   files: string[],
 *   doNot: string[],
 *   related?: string[],
 * }>}
 */
export const MOE_SUBSYSTEMS = {
  fieldOrchestrator: {
    purpose:
      "フィールド全体の起動・ゲームループ・HUD配置。戦闘/NPC/スキルの配線はここに集中している（要分割）。",
    layer: "orchestrator",
    stateOwner: "MoeFieldMap.jsx",
    files: ["src/components/MoeFieldMap.jsx"],
    doNot: [
      "新しい純粋ロジックをここに直書きしない → src/lib/ へ",
      "新しい useRef を安易に増やさない → サブシステム単位でまとめる",
    ],
  },

  fieldCanvas: {
    purpose: "Three.js 描画・クリック判定・キャラアニメ。座標は player.x / player.y (= Three.js x/z)。",
    layer: "canvas",
    stateOwner: "MoeField3DCanvas.jsx",
    files: ["src/components/MoeField3DCanvas.jsx"],
    doNot: ["ゲームルール（MP消費・バフ時間）を canvas 内に書かない"],
    related: ["supportTargeting"],
  },

  enemyTargeting: {
    purpose: "敵ターゲット（攻撃対象）。3Dクリック → targetEnemyId。",
    layer: "orchestrator",
    stateOwner: "MoeFieldMap (targetEnemyId / targetEnemyIdRef)",
    files: ["src/components/MoeTargetWindow.jsx"],
    doNot: ["支援スキルの味方ターゲットと混同しない"],
    related: ["supportTargeting"],
  },

  supportTargeting: {
    purpose:
      "味方ターゲット（支援スキル用）。プレイヤー / ペット。コンデンスマインド・将来の単体回復など。",
    layer: "orchestrator",
    stateOwner: "MoeFieldMap (allyTarget / allyTargetRef)",
    files: [
      "src/lib/moeAllyTargetSettings.js",
      "src/components/MoePlayerHpWindow.jsx",
      "src/components/MoePetHpWindow.jsx",
      "src/components/MoeTargetWindow.jsx (支援ターゲット欄)",
    ],
    doNot: [
      "petFocused（ペット命令フォーカス）と allyTarget を同一視しない",
      "ターゲット選択は selectAllyTarget() 経由に統一する",
    ],
    related: ["condenseMind", "enemyTargeting"],
  },

  condenseMind: {
    purpose:
      "プレイヤー技コンデンスマインド（回復60）。消費MP34・MP残量条件なし。対象のMP自然回復バフ。",
    layer: "pure",
    stateOwner: "moePlayerCondenseMind.js（効果） + MoeFieldMap（ref/tick）",
    files: [
      "src/lib/moePlayerCondenseMind.js",
      "src/lib/moeAtrumPetSkills.js (ペットのマナ増幅法は別条件: MP5割以下)",
      "src/lib/moePlayerSkillSlotUi.js",
    ],
    doNot: [
      "プレイヤー技にペット用のMP5割条件をコピーしない",
      "プレイヤー対象とペット対象で別 ref を使う（playerCondenseMindRef / atrumMpRegenRef）— 将来統合予定",
    ],
    related: ["supportTargeting"],
  },

  macro3SimpleMountains: {
    purpose:
      "簡易山（stem Cylinder + dome 半球）· 緑コライダー · バイオーム色。",
    layer: "pure",
    stateOwner: "moe3dMacro3MountainRegistry.js",
    files: [
      "src/lib/moe3dMacro3SimpleMountain.js",
      "src/lib/moe3dMacro3MountainRegistry.js",
      "src/lib/moe3dMacro3MountainPalette.js",
      "src/lib/moe3dMacro3Apply.js",
      "src/lib/moe3dMacro3Colliders.js",
      ".cursor/skills/macro-3/SKILL.md",
      ".cursor/skills/MACROS.md",
    ],
    doNot: [
      "箱コライダー分割で山を囲まない",
      "マクロ２ L6（敵サイズ）と混同しない",
    ],
  },

  skillPanels: {
    purpose: "縦・横スキルパネル。player1 / player2 / pet モード切替とスロット表示。",
    layer: "ui",
    stateOwner: "各パネル (useMoeSkillPanelMode + useMoeDraggablePos)",
    files: [
      "src/lib/moeSkillPanelModeSettings.js",
      "src/components/MoeMergedSkillIconBar.jsx",
      "src/components/MoeMergedVerticalSkillPanel.jsx",
      "src/lib/moePlayerSkillSlotUi.js",
    ],
    doNot: ["パネル内にスキル効果ロジックを書かない → lib + MoeFieldMap handler"],
  },

  persistence: {
    purpose: "localStorage / 外部セーブ。キーは moeStorageRegistry で一元管理。",
    layer: "persistence",
    stateOwner: "各 *Settings.js / moePetSave.js",
    files: ["src/lib/moe/moeStorageRegistry.js"],
    doNot: ["文字列キーを各ファイルに直書きで増やさない"],
  },

};

/** 開発コンソール向け — サブシステム一覧を表示 */
export function printMoeSubsystemGuide() {
  console.group("[MOE] Subsystem guide");
  for (const [id, sub] of Object.entries(MOE_SUBSYSTEMS)) {
    console.groupCollapsed(`${id} — ${sub.purpose.slice(0, 60)}…`);
    console.log("layer:", sub.layer);
    console.log("state:", sub.stateOwner);
    console.log("files:", sub.files);
    if (sub.doNot?.length) console.warn("do NOT:", sub.doNot);
    if (sub.related?.length) console.log("related:", sub.related);
    console.groupEnd();
  }
  console.groupEnd();
}
