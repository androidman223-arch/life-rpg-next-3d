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
    files: [
      "src/components/MoeField3DCanvas.jsx",
      "src/lib/moePlayerLookAhead.js",
    ],
    doNot: [
      "ゲームルール（MP消費・バフ時間）を canvas 内に書かない",
      "画面上のプレイヤー上下は moePlayerLookAhead。ワールド座標の初期スポーンと混ぜない",
    ],
    related: ["supportTargeting"],
  },

  enemyTargeting: {
    purpose: "敵ターゲット（攻撃対象）。3Dクリック → targetEnemyId。",
    layer: "orchestrator",
    stateOwner: "MoeFieldMap (targetEnemyId / targetEnemyIdRef)",
    files: ["src/components/MoeField3DCanvas.jsx"],
    doNot: ["支援スキルの味方ターゲットと混同しない"],
    related: ["supportTargeting", "floatingPanelStack"],
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
    ],
    doNot: [
      "petFocused（ペット命令フォーカス）と allyTarget を同一視しない",
      "ターゲット選択は selectAllyTarget() 経由に統一する",
    ],
    related: ["condenseMind", "enemyTargeting"],
  },

  condenseMind: {
    purpose:
      "プレイヤー技コンデンスマインド（回復60）。消費MP17・MP残量条件なし。対象のMP自然回復バフ。",
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
    purpose:
      "縦・横スキルパネル。player1（回復等） / player2（フェニックス） / player3（調査） / pet のモード切替。",
    layer: "ui",
    stateOwner: "各パネル (useMoeSkillPanelMode + useMoeDraggablePos)",
    files: [
      "src/lib/moeSkillPanelModeSettings.js",
      "src/components/MoeMergedSkillIconBar.jsx",
      "src/components/MoeMergedVerticalSkillPanel.jsx",
      "src/components/MoeSkillPanelSwitcher.jsx",
      "src/lib/moePlayerSkillSlotUi.js",
      "src/data/moePlayerSkillSlotOrder.js",
      "src/data/moePlayerUtilitySkills.js",
    ],
    doNot: ["パネル内にスキル効果ロジックを書かない → lib + MoeFieldMap handler"],
    related: ["enemyStatSearch", "playerUtilitySkills", "floatingPanelStack"],
  },

  floatingPanelStack: {
    purpose:
      "ドラッグ可能 HUD の z-index スタック。クリックで手前（capture フェーズ）。panelId は storageKey と揃える。",
    layer: "ui",
    stateOwner: "MoePanelStackContext (MoeFieldMapGate で Provider)",
    files: [
      "src/lib/moePanelStack.js",
      "src/context/MoePanelStackContext.jsx",
      "src/components/MoeFloatingPanelRoot.jsx",
      "src/lib/moePanelDock.js",
      "src/components/MoeFieldMapGate.jsx",
    ],
    doNot: [
      "MoeFieldMap 内で Provider を二重にしない",
      "z-index 60+ のモーダルと混同しない",
      "ドラッグヘッダだけ onPointerDown では前面化できない（stopPropagation）",
      "ミニマップは stack id と pos storage が別（MOE_PANEL_STACK_POS_STORAGE）",
    ],
    related: ["skillPanels"],
  },

  playerUtilitySkills: {
    purpose: "プレイヤー技③ — 調査・支援系スキル枠（敵ステサーチなど）。",
    layer: "pure",
    stateOwner: "moePlayerUtilitySkills.js + MoeFieldMap handler",
    files: [
      "src/data/moePlayerUtilitySkills.js",
      "src/lib/moePlayerSkillSlotUi.js (buildPlayerUtilitySkillSlotEntry)",
    ],
    doNot: ["技①の10枠に詰め込まない → 技③専用"],
    related: ["skillPanels", "enemyStatSearch"],
  },

  enemyStatSearch: {
    purpose:
      "敵ステサーチ — HP/MP/攻撃/スキル + 索敵（視野・聴覚・タイプ）。検知対象はプレイヤー。",
    layer: "pure",
    stateOwner: "MoeFieldMap (enemyStatSearchOpen) + buildMoeEnemyStatSearchView",
    files: [
      "src/lib/moeEnemyStatSearch.js",
      "src/lib/moeEnemyDetection.js",
      "src/lib/moeEnemyFieldActive.js",
      "src/components/MoeEnemyStatSearchPanel.jsx",
      "src/data/moePlayerUtilitySkills.js",
    ],
    doNot: [
      "enemyTargeting と混同しない（ターゲット選択は先に必要）",
      "表示ロジックを MoeField3DCanvas に書かない",
      "第2段: 扇形表示・追跡は moeEnemyDetection + Canvas",
    ],
    related: ["enemyTargeting", "playerUtilitySkills", "skillPanels", "petCommands"],
  },

  enemyDetection: {
    purpose:
      "敵索敵 — 前方視野（扇形）+ 足音（聴覚）。追跡（aggro）。アクティブのみ先制追跡 · ノンアクティブは検知のみ。忍び足=足音抑制 · 隠れ蓑=完全ステルス+ヘイト解除。",
    layer: "pure",
    stateOwner: "moeEnemyDetection.js + moeEnemyFieldChase.js",
    files: [
      "src/lib/moeEnemyDetection.js",
      "src/lib/moeEnemyFieldActive.js",
      "src/lib/moeEnemyFieldChase.js",
      "src/lib/moeEnemyRespawn.js",
      "src/lib/moeEnemyRespawnPlace.js",
      "src/lib/moePlayerStealth.js",
      "src/data/moeMonsterFieldRegistry.js",
    ],
    doNot: [
      "ペット索敵と混同しない（MOE操作はプレイヤー主体）",
      "ヘイト（戦闘優先度）と aggro（フィールド追跡）を混同しない",
      "撃破リポップは moeEnemyRespawn（Lv帯・10秒〜10分）。撃破フレームで座標を戻さない",
      "扇形描画を stat search パネルに書かない → MoeField3DCanvas",
    ],
    related: ["enemyStatSearch", "petCommands"],
  },

  petCommands: {
    purpose:
      "ペット命令（もどれ・待て・座れ・オート・攻撃）と SOS 脱出。戦闘キャンセル時の3Dロック解除。",
    layer: "orchestrator",
    stateOwner: "MoeFieldMap (petCommandRef / duelCombatSessionRef)",
    files: [
      "src/components/MoeFieldMap.jsx (handlePetComeBack / emergencyUnstuck3d)",
      "src/components/MoeField3DCanvas.jsx (duelCombatSessionRef で戦闘ビジュアル解除)",
    ],
    doNot: [
      "戻れ時に petCombatPosLock を残さない",
      "SOS はペット即ワープ（moe3dPetStartNearPlayer · 戦闘解除）",
    ],
    related: ["fieldCanvas", "enemyTargeting"],
  },

  mapPlannedData: {
    purpose: "マクロ１ — マップ別の公式敵・湧き座標（1マップ1ファイル）。",
    layer: "pure",
    stateOwner: "src/data/maps/*Planned.js",
    files: [
      "src/data/maps/moeAlbeezForestPlanned.js",
      "src/data/maps/moeElanPalacePlanned.js",
      "src/data/maps/moeHatiilDesertPlanned.js",
      "src/data/maps/moeNeokuMountainPlanned.js",
      "src/data/maps/moeSulfurMinePlanned.js",
      "src/data/moeMonsterFieldRegistry.js",
      "src/lib/moe3dMonsterMapSpawns.js",
    ],
    doNot: ["他マップの敵を流用しない → Wiki 湧き一覧どおり"],
    related: ["macro3SimpleMountains", "worldLayout3d"],
  },

  worldLayout3d: {
    purpose:
      "3D ワールドタイル登録・座標変換・アルター転送。MOE_3D_WORLD_MAP_REGISTRY は moe3dWorldLayout に集約。",
    layer: "pure",
    stateOwner: "moe3dWorldLayout.js + moeAltarWarps.js",
    files: [
      "src/lib/moe3dLayoutConstants.js",
      "src/lib/moe3dWorldLayout.js",
      "src/data/moeAltarWarps.js",
      "src/lib/moe3dAltarWarp.js",
      "src/lib/moe3dBiskHubLayout.js",
      "src/lib/moe3dBiskTile.js",
      "src/lib/moe3dBiskL4Fx.js",
    ],
    doNot: [
      "湧き座標は転送スポーンから moe3dClearSpawnFromAltarPlayer で押し出す",
      "moe3dWorldLayout / moeAltarWarps / moe3dMonsterMapSpawns から moeField3DModels を import しない",
      "共有タイル定数は moe3dLayoutConstants.js だけ（依存ゼロ）",
      "moe3dMonsterMapSpawns から moe3dDesertPreviewTile を import しない",
    ],
    related: ["mapPlannedData", "fieldPrefetch"],
  },

  persistence: {
    purpose: "localStorage / 外部セーブ。キーは moeStorageRegistry で一元管理。",
    layer: "persistence",
    stateOwner: "各 *Settings.js / moePetSave.js",
    files: [
      "src/lib/moe/moeStorageRegistry.js",
      "src/lib/moePetSave.js",
      "src/lib/moeExternalSaveLabels.js",
    ],
    doNot: ["文字列キーを各ファイルに直書きで増やさない"],
    related: ["externalSave"],
  },

  externalSave: {
    purpose:
      "ペット進行の JSON 外部保存。File System Access API + IndexedDB ハンドル + ダウンロード fallback。",
    layer: "persistence",
    stateOwner: "moePetSave.js（I/O） + MoeFieldMap 設定 UI",
    files: [
      "src/lib/moeExternalSave.js",
      "src/lib/moePetSave.js",
      "src/lib/moeExternalSaveLabels.js",
    ],
    doNot: [
      "フォルダ名をフルパスと誤解しない（Desktop 等を直接選ぶと表示が分かりやすい）",
      "読み込みは `<input type=\"file\">` 推奨（全ブラウザ）",
      "showDirectoryPicker の id 定数を忘れない（MOE_SAVE_PICKER_ID）",
    ],
    related: ["persistence"],
  },

  fieldBgm: {
    purpose:
      "メニュー BGM とフィールド面／戦闘 BGM の自動切替。曲 ID は moeFieldBgmMap、再生は AmbientBgm。",
    layer: "ui",
    stateOwner: "AmbientBgm.jsx（fieldAutoRef / zone / combat）",
    files: [
      "src/components/AmbientBgm.jsx",
      "src/lib/moeFieldBgm.js",
      "src/lib/moeFieldBgmMap.js",
    ],
    doNot: [
      "AmbientBgm に prefetch 等の無関係 import を足さない",
      "フィールド入室イベントと pathname 効果で二重に曲切替しない",
    ],
    related: ["fieldOrchestrator"],
  },

  fieldPrefetch: {
    purpose:
      "MoeFieldMap チャンクの先読み。layout の MoeFieldPrefetchBoot が唯一の起動点。",
    layer: "ui",
    stateOwner: "moeFieldPrefetch.js",
    files: [
      "src/lib/moeFieldPrefetch.js",
      "src/lib/moePlayerSummonPrefetch.js",
      "src/components/MoeFieldPrefetchBoot.jsx",
      "src/components/MoeFieldMapGate.jsx",
    ],
    doNot: [
      "moeFieldPrefetch の import 時 auto-start を復活させない",
      "副作用 import `import \"@/lib/moeFieldPrefetch\"` を散らさない",
      "prefetch 失敗 + MOE_3D_WORLD_MAP_REGISTRY TDZ → worldLayout3d の循環 import を疑う",
    ],
    related: ["fieldOrchestrator", "playerSummon", "macro0", "worldLayout3d"],
  },

  playerSummon: {
    purpose:
      "プレイヤー召喚プレスキル（生活改鳳・自力整龍）。技③スロット · MP消費 · 3D GLB VFX · リボーンワンス。",
    layer: "pure+ui",
    stateOwner: "MoeFieldMap.jsx（activate） + moePlayerPreSkillActivate.js",
    files: [
      "src/data/moePlayerPreSkills.js",
      "src/data/moePlayerSummonModels.js",
      "src/lib/moePlayerPreSkillActivate.js",
      "src/lib/moePlayerSummonSkills.js",
      "src/lib/moePlayerSummonEffect.js",
      "src/lib/moePlayerPreSkillUi.js",
      "src/lib/moePhoenixRebirthOnce.js",
    ],
    doNot: [
      "ペット技②の phoenix_habit_ascension（生活改鳳）と混同しない",
      "攻撃2倍は phoenix_scorching_sky 側 — プレスキル生活改鳳には付けない",
      "リボーンワンスはプレイヤー生活改鳳のみ — ペット生活改鳳には付けない",
    ],
    related: ["fieldOrchestrator", "fieldPrefetch"],
  },

  macro0: {
    purpose:
      "マクロ０ — 機能追加後の土台整備（サイクル0スキャン + 3サイクル）。新機能は足さない。",
    layer: "pure",
    stateOwner: ".cursor/skills/macro-0/SKILL.md",
    files: [
      ".cursor/skills/macro-0/SKILL.md",
      ".cursor/skills/macro-0/BACKLOG.md",
      "docs/moe-lessons.md",
    ],
    doNot: [
      "MoeFieldMap 大分割 · スキル配線は BACKLOG に書いて別タスク",
      "3ファイル以上触った日の終わりに走らせる（サイクル0）",
    ],
    related: ["persistence", "fieldBgm", "fieldPrefetch"],
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
