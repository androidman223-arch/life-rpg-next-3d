# MOE ファイル索引

「どのファイルに何があるか」の早見表。コードは動かさず参照用。

開発中はコンソール `__MOE_DEV__.guide()` でもサブシステム一覧が見られます。

---

## オーケストレーター・3D

| ファイル | 役割 |
|----------|------|
| `src/components/MoeFieldMap.jsx` | フィールド全体・ゲームループ・HUD・戦闘・スキル配線 |
| `src/components/MoeField3DCanvas.jsx` | Three.js 描画・アニメ・クリック判定 |
| `src/components/MoeField3D.jsx` | 3D フィールドのラッパ |

---

## プレイヤースキル

| ファイル | 役割 |
|----------|------|
| `src/data/moePlayerSkillSlotOrder.js` | 技①のスロット並び（ライト・ヒール・テレポ…） |
| `src/data/moePlayerNinjaSkills.js` | 忍者スキル定義（忍び足・神速・隠れ蓑） |
| `src/data/moePlayerUtilitySkills.js` | **技③** — 調査系（敵ステサーチなど） |
| `src/lib/moePlayerSkillSlotUi.js` | スキル枠の表示・クリック定義 |
| `src/lib/moeSkillPanelModeSettings.js` | 技①/②/③/ペット の切替 |
| `src/components/MoeMergedSkillIconBar.jsx` | 横スキルバー |
| `src/components/MoeMergedVerticalSkillPanel.jsx` | 縦スキルパネル |

---

## 敵・戦闘・ターゲット

| ファイル | 役割 |
|----------|------|
| `src/data/moeMonsterFieldRegistry.js` | 公式敵レジストリ（全ファミリー） |
| `src/data/moeMeerimEnemies.js` | ミーリム海岸（2D/初期ゾーン） |
| `src/lib/moe3dMonsterMapSpawns.js` | 3D マップ別湧き座標 |
| `src/lib/moeEnemyStatSearch.js` | 敵ステサーチ用ステ整形（純粋ロジック） |
| `src/lib/moeEnemyDetection.js` | 索敵データ（視野・聴覚・タイプ）— 検知対象はプレイヤー |
| `src/lib/moeEnemyFieldActive.js` | アクティブ / ノンアクティブ（先制・追跡の可否） |
| `src/lib/moeEnemyFieldChase.js` | 索敵後の追跡・接触バトル（`aggro` ランタイム） |
| `src/components/MoeEnemyStatSearchPanel.jsx` | 敵ステ表示ウィンドウ |
| `src/components/MoeTargetWindow.jsx` | 敵ターゲット HP バー・支援ターゲット |

---

## マップ別データ（マクロ１）

`src/data/maps/` — **1マップ1ファイル**。Wiki 湧き・敵ステータス。

| ファイル | マップ |
|----------|--------|
| `moeAlbeezForestPlanned.js` | アルビーズの森 |
| `moeElanPalacePlanned.js` | エルアン宮殿 |
| `moeHatiilDesertPlanned.js` | ハティル砂漠 |
| `moeNeokuMountainPlanned.js` | ネオク山 |
| `moeSulfurMinePlanned.js` | スルト鉱山 |

集約: `moeMacro1Constants.js` · 公式チェック `src/lib/moe/moeMacro1OfficialCheck.js`

---

## 簡易山（マクロ３）

| ファイル | 役割 |
|----------|------|
| `src/lib/moe3dMacro3SimpleMountain.js` | stem + dome 生成 |
| `src/lib/moe3dMacro3MountainRegistry.js` | 山の一覧・配置 |
| `src/lib/moe3dMacro3MountainPalette.js` | バイオーム色 |
| `src/lib/moe3dMacro3Colliders.js` | 緑コライダー |
| `src/lib/moe3dMacro3Apply.js` | シーンへの適用 |
| `src/lib/moe3dMacro3L4Fx.js` | 登攀演出 |

一覧: `.cursor/skills/MACROS.md`

---

## 地図磨き（マクロ２）

| ファイル | 役割 |
|----------|------|
| `src/lib/moe3dMacro2L1Tiles.js` | L1 地形タイル |
| `src/lib/moe3dMacro2L2Props.js` | L2 名物プロップ |
| `src/lib/moe3dMacro2L3Spawns.js` | L3 湧きパッド |
| `src/lib/moe3dMacro2L4Fx.js` | L4 演出 |
| `src/lib/moe3dMacro2L5Wiki.js` | L5 Wiki メモ |
| `src/lib/moe3dMacro2L6EnemyScale.js` | L6 敵表示サイズ |
| `src/lib/moe3dMacro2CyclePass.js` | サイクルパス |

---

## ペット

| ファイル | 役割 |
|----------|------|
| `src/data/moePets.js` | ペットステ・成長 |
| `src/data/moePetCombatSkills.js` | 戦闘スキル |
| `src/data/moePhoenixDragon.js` | フェニックス系 |
| `src/lib/moePetSave.js` | セーブ/ロード |

---

## 開発・テスト

| ファイル | 役割 |
|----------|------|
| `src/lib/moe/moeSubsystemGuide.js` | サブシステム地図（`__MOE_DEV__.guide()`） |
| `src/lib/moe/moeStorageRegistry.js` | localStorage キー一覧 |
| `src/lib/moe/moeFieldInvariants.js` | 状態矛盾チェック |
| `tests/moe/smoke.test.mjs` | スモークテスト |
| `docs/moe-lessons.md` | 落とし穴メモ（短い） |

---

## 最近追加（2026-09）

- **敵アクティブ / ノンアクティブ** — `moeEnemyFieldActive.js` · 索敵は共通 · 追跡のみ分岐
- **敵ステサーチ** — 技③ · `moeEnemyStatSearch.js` + `MoeEnemyStatSearchPanel.jsx`
- **SOS 脱出** — ペット命令の 🆘 · `MoeFieldMap.jsx` `emergencyUnstuck3d`
- **戦闘「もどれ」修正** — `duelCombatSessionRef` で 3D ロック解除
