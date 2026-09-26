# MOE ファイル索引

「どのファイルに何があるか」の早見表。コードは動かさず参照用。

開発中はコンソール `__MOE_DEV__.guide()` でもサブシステム一覧が見られます。

**育成設計（鳳凰/龍 · 修行 · ボス）** → [`moe-player-progression.md`](./moe-player-progression.md)  
**ペット最上級メモ（ミステリーエッグ）** → [`moe-mystery-dragon-pet-memo.md`](./moe-mystery-dragon-pet-memo.md)

---

## オーケストレーター・3D

| ファイル | 役割 |
|----------|------|
| `src/components/MoeFieldMap.jsx` | フィールド全体・ゲームループ・HUD・戦闘・スキル配線 |
| `src/components/MoeField3DCanvas.jsx` | Three.js 描画・アニメ・クリック判定 |
| `src/components/MoeField3D.jsx` | 3D フィールドのラッパ |

### 3D ワールドレイアウト（循環 import 注意）

| ファイル | 役割 |
|----------|------|
| `src/lib/moe3dLayoutConstants.js` | **依存ゼロ** — 2×4 試作タイル数 · タイル間隔 · 砂漠 preview index |
| `src/lib/moe3dWorldLayout.js` | マップ登録 `MOE_3D_WORLD_MAP_REGISTRY` · 座標変換 · ミニマップ bounds |
| `src/data/moeAltarWarps.js` | アルター配置・転送先一覧 `MOE_ALTARS` |
| `src/lib/moe3dAltarWarp.js` | 転送実行・スポーン座標 |
| `src/lib/moe3dMonsterMapSpawns.js` | マップ別湧き座標（`moe3dLayoutConstants` 経由で tile index） |
| `src/lib/moeField3DModels.js` | GLB URL · 敵モデル · 試作ゾーン（定数は layoutConstants から re-export） |

`moe3dWorldLayout` / `moeAltarWarps` / `moe3dMonsterMapSpawns` は **`moeField3DModels` を import しない**（詳細は `docs/moe-lessons.md`）。

---

## プレイヤースキル

設計メモ: [`moe-player-progression.md`](./moe-player-progression.md)

| ファイル | 役割 |
|----------|------|
| `src/lib/moePlayerExperience.js` | プレイヤー熟練度まとめ保存（phoenix/dragon/heal/stealth/preSkills） |
| `src/lib/moePlayerSkillSuccessRate.js` | MOE風スキル成功率 |
| `src/lib/moePlayerSkillUseFlow.js` | 使用時の成功率判定＋熟練付与 |
| `src/lib/moePhoenixTrainingMemos.js` | 鳳凰修行① · 休み/説明/禁止事項の初期メモ |
| `src/lib/moeDragonTraining.js` | 修行② 龍の武練 · タイマー · 行動ログ · 龍EXP |
| `src/lib/moeTomorrowMemo.js` | アルター · 明日やることメモ（自由追加） |
| `src/components/DragonTrainingPanel.jsx` | 龍の武練 UI（タイトル画面） |
| `src/components/MoeAltarTomorrowMemo.jsx` | アルター内メモ UI |
| `src/data/moePlayerSkillSlotOrder.js` | 技①のスロット並び（ライト・ヒール・テレポ…） |
| `src/data/moePlayerNinjaSkills.js` | 忍者スキル定義（忍び足・神速・隠れ蓑） |
| `src/data/moePlayerUtilitySkills.js` | **技③** — 調査・召喚プレスキル（敵ステサーチ・生活改鳳・自力整龍） |
| `src/data/moePlayerPreSkills.js` | プレイヤー召喚プレスキル定義（ダメージ・MP） |
| `src/lib/moePlayerPreSkillActivate.js` | プレスキル使用判定・トースト文（純粋ロジック） |
| `src/hooks/useMoePlayerPreSkillField.js` | フィールドでのプレスキル使用フック |
| `src/lib/moePlayerSummonSkills.js` | 召喚攻撃シーケンス（炎連・単発大ダメ） |
| `src/lib/moePlayerSummonEffect.js` | 3D 召喚 GLB 一時表示 |
| `src/lib/moePlayerSummonPrefetch.js` | 召喚 GLB 先読み |
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
| `moeBiskPlanned.js` | 城下町ビスク（イクシオン ウォーター） |
| `moeDarinMountainPlanned.js` | ダーイン山 |
| `moeDragonValleyPlanned.js` | 飛竜の谷 |
| `moeEisisCavePlanned.js` | エイシス・ケイブ |
| `moeElanPalacePlanned.js` | エルアン宮殿 |
| `moeElvinMountainsPlanned.js` | エルビン山脈 |
| `moeHatiilDesertPlanned.js` | ハティル砂漠 |
| `moeMutumCatacombPlanned.js` | ムトゥーム地下墓地 |
| `moeNeokuMountainPlanned.js` | ネオク山 |
| `moeNeokuPlateauPlanned.js` | ネオク高原 |
| `moeSulfurMinePlanned.js` | スルト鉱山 |
| `moeYugCoastPlanned.js` | AGE · ユグ海岸（海ヘビ） |
| `moeSolesValleyPlanned.js` | AGE · ソレス渓谷（レスクール ハウンド） |
| `moeGeoAbyssPlanned.js` | AGE · ゲオ深淵3面（サラマンダー stub） |
| `moeMitoyaGreatTreePlanned.js` | AGE · ミトヤの大樹（トレント stub） |

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
| `src/lib/moePetSave.js` | ペットセーブ/ロード |
| `src/lib/moeExternalSave.js` | 外部 JSON 保存 I/O（FS API · IndexedDB） |
| `src/lib/moeExternalSaveLabels.js` | 外部保存の表示ラベル（デスクトップ等） |
| `src/lib/moeAmbientBgmTracks.js` | BGM 曲カタログ（AmbientBgm 用） |
| `src/components/MoeFieldPage.jsx` | `/moe` · `/moe/3d` 共通ページ |

---

## プレイヤー召喚（マクロ１ · モデル）

| ファイル | 役割 |
|----------|------|
| `scripts/summons/playerPhoenixBuilder.mjs` | 鳳凰（生活改鳳）低ポリビルダー |
| `scripts/summons/playerSeiryuDragonBuilder.mjs` | 整龍（自力整龍）低ポリビルダー |
| `scripts/summons/playerSummonCatalog.mjs` | パレット・ファイル名 |
| `src/data/moePlayerSummonModels.js` | スキル ID ↔ GLB URL |
| `src/lib/moePlayerPreSkillUi.js` | 技③スロット表示・ダメージ説明 |
| `public/assets/models/summon/*.glb` | 生成物（`npm run generate:summons`） |

---

## BGM・先読み

| ファイル | 役割 |
|----------|------|
| `src/components/AmbientBgm.jsx` | 全画面 BGM 再生・音量・曲選択 HUD |
| `src/lib/moeFieldBgm.js` | フィールド BGM イベント・入室判定 |
| `src/lib/moeFieldBgmMap.js` | マップ面 ↔ 曲 ID（純粋データ） |
| `src/lib/moeFieldPrefetch.js` | MoeFieldMap チャンク先読みシングルトン |
| `src/components/MoeFieldPrefetchBoot.jsx` | layout から先読み起動（MoeFieldMap + 召喚 GLB） |
| `src/components/MoeFieldMapGate.jsx` | 先読み済みなら「準備中」スキップ |
| `src/lib/moe3dMapSlotAtWorldPos.js` | 座標 → マップ面 ID（BGM ゾーン判定用） |

---

## 開発・テスト

| ファイル | 役割 |
|----------|------|
| `src/lib/moe/moeSubsystemGuide.js` | サブシステム地図（`__MOE_DEV__.guide()`） |
| `src/lib/moe/moeStorageRegistry.js` | localStorage キー一覧 |
| `src/lib/moe/moeFieldInvariants.js` | 状態矛盾チェック |
| `tests/moe/smoke.test.mjs` | スモークテスト |
| `docs/moe-lessons.md` | 落とし穴メモ（短い） |
| `.cursor/skills/macro-0/SKILL.md` | マクロ０整備手順 |
| `.cursor/skills/macro-0/BACKLOG.md` | マクロ０ · 後回し一覧 |

---

## 最近追加（2026-09）

- **3D 循環 import 修正** — `moe3dLayoutConstants.js` · フィールド読み込み TDZ 解消
- **リボーンワンス** — プレイヤー生活改鳳 · 死亡3秒後1回復活 · `moePhoenixRebirthOnce.js`
- **アイテムボックスリサイズ** — 縦横ドラッグ · アイコン32px固定 · `moeItemBoxLayout.js`
- **敵アクティブ / ノンアクティブ** — `moeEnemyFieldActive.js` · 索敵は共通 · 追跡のみ分岐
- **敵ステサーチ** — 技③ · `moeEnemyStatSearch.js` + `MoeEnemyStatSearchPanel.jsx`
- **SOS 脱出** — ペット命令の 🆘 · `MoeFieldMap.jsx` `emergencyUnstuck3d`
- **戦闘「もどれ」修正** — `duelCombatSessionRef` で 3D ロック解除
- **フィールド BGM** — 面ごと自動切替 · 戦闘終了 2s フェード · `moeFieldBgmMap.js`
- **外部セーブ UI** — 設定パネル · `moeExternalSaveLabels.js` · インポートは file input
- **3D 先読み** — `MoeFieldPrefetchBoot` + `MoeFieldMapGate`（副作用 import 禁止）
- **プレイヤー召喚スキル** — 技③ · 生活改鳳/自力整龍 · GLB VFX · `moePlayerPreSkillActivate.js`
