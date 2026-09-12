---
name: macro-1
description: >-
  MOE全マップ（戦乱時代 war_age 以外）に公式敵を追加し、Wikiステータス準拠で
  モデル・スキルアニメ・フィールド配置まで完了する。ユーザーが「マクロ１をしてください」
  「マクロ1」と言ったときに必ずこのスキルを読んで実行する。
disable-model-invocation: true
---

# マクロ１ — 全エリア敵+1

## 指令（ユーザー原文）

1. すべてのエリアの敵を１匹づつ増やす　何を増やすかはおまかせ　　全て公式のステータスを参考に。
2. それらの敵のモデリング・スキルアニメ・を１匹づつ全エリア開始。
3. 完成したら　それぞれのエリアのフィールドに配置。
4. すべて完了したらマクロ終了。以後マクロ１をしてくださいといったら、この　指令があなたにいき、完成させます。

5. マクロ１の最後に追加で　１匹作ったら、全エリア１匹づつ追加して　終了したら　マクロの終わりです。

6. **全エリア終わるまで** — マクロ１は **対象エリアすべて** 完了するまで続行する。**1匹・1エリアで終了してはならない。**

**追加方針:** 慌てず公式にていねいに　長い時間をかけてＯＫ

## 第3フェーズ指令（2026-09-11 · ユーザー指定）

- **対象:** `MOE_3D_WORLD_MAP_REGISTRY` の **全23面**（`war_age` 戦乱時代 **のみ除外**）
- **内容:** 戦乱時代以外 **すべてのエリア** に公式敵を追加（湧き·モデル·Wikiステータス）
- **除外:** `war_age`（War Age · クエスト・オブ・エイジス）— **敵追加しない**
- **含む:** 本編9面（済）＋ ネオク山·高原·エルアン宮殿·エルビン山脈·ダーイン山·アルビーズ·箱舟遺跡·エイシス洞·ビスク·接続道 等
- **ペース:** 第2フェーズ同様 · 急がない · Wiki調査 → 1匹ずつ
- **必須:** 各マップは **公式 Wiki エリアガイドに載っている敵だけ** 配置する（他マップの敵流用 **禁止**）
- **メモ:** `src/data/moeMacro1Phase3AreaWiki.js` · ユーザー指摘を反映

### 公式湧きルール（厳守 · 2026-09-11 ユーザー指摘）

| マップ | ❌ やってはいけない例 | ✅ 公式 |
|--------|---------------------|--------|
| エルアン宮殿 | レスクール アマゾネス | **白骨·黒骨** など骨系 |
| エイシス洞 | ドードルバグ | **スパイダー** |
| ネオク山など | 他エリアの狼·ライオン流用 | **そのマップの Wiki 湧き一覧** |

GLB 未実装の公式敵は **先にモデル化** → その後湧き。仮の既存敵配置はしない。

## 第2フェーズ指令（2026-09-11 · ゆっくり）

- **追加:** **4サイクル**（サイクル **6〜9** · 第1フェーズ5サイクル完了後）
- **ペース:** **急がない** · **10倍以上の時間 OK** · Wiki調査 → モデル → 配置を **1匹ずつ丁寧に**
- **禁止:** 既存バリアントの湧きコピーだけでサイクル完了扱い（第2フェーズは **Wiki未登場の公式敵** または **新GLB** を優先）
- **サイクル間:** 40秒休憩（前回同様）

## 実行ルール（重要）

- 「マクロ１をしてください」と言われたら **対象エリア全完了まで** 作業を続ける（途中で「1匹できました」で終わらせない）。
- 1エリア完成 → すぐ次エリアへ。報告は進捗更新しつつ **止まらず** 進める。
- **禁止:** 1匹だけ作ってマクロ完了扱いにすること · 1エリアだけで「マクロ終了」と報告すること · `war_age` に敵を置くこと。
- **許可:** 公式調査・モデリングに時間をかける · セッション跨ぎでも progress を見て **未完了エリアから再開** する。

## 進捗

進捗・追加敵一覧は [progress.md](progress.md) を都度更新する。

## 1エリア分の手順（1匹ずつ · 急がない）

1. **公式調査** — https://wikiwiki.jp/moe-pet/ の **当該マップのエリアガイド** で湧きモンスター一覧を確認（他マップの敵を借りない）。出典 URL を progress にメモ。第3フェーズは `moeMacro1Phase3AreaWiki.js` を更新。
2. **データ登録** — `moeMonsterFieldRegistry.js`（stats/skills）、`moeMonsterLineup.js`（family + variant）。
3. **モデル** — `scripts/monsters/monsterTypeBuilders.mjs` に builder 追加 → `monsterVariantCatalog.mjs` に palette/anim。
4. **GLB 生成** — `npm run generate:macro1 -- <familyId>`
5. **スキルアニメ** — `variant.anim`（四足は `hasArms: false`）。必要なら builder 内に attack 用パーツ。
6. **フィールド配置** — `moe3dMonsterMapSpawns.js` に spawn spec（tx/tz · タイル中心基準）。
7. **高さ・表示** — `moeField3DModels.js` の `enemyModelHeightForKey` · **`moeMacro1Constants.js` の `MOE_MACRO1_DISPLAY_SCALE = 3`**（マクロ１敵は全て3倍表示）。
8. **確認** — GLB 三角数・フィールド湧き・ボス座標上書きなし（mapSlot 敵は `spawnArea` 必須）。
9. **progress.md** を ✅ に更新して次エリアへ。

## 対象エリア（全23面 · `war_age` 除外）

**除外（1面）:** `war_age` — 戦乱時代 · 敵追加 **しない**

### 第1フェーズ済み（本編9面 · 敵湧きあり）

| # | mapSlotId | 名前 |
|---|-----------|------|
| 1 | lexur_hills | レクスール・ヒルズ |
| 2 | meerim_coast | ミーリム海岸 |
| 3 | elvin_valley | エルビン渓谷 |
| 4 | garm_corridor | ガルム回廊 |
| 5 | ilvana_valley | イルヴァーナ渓谷 |
| 6 | desert_preview | 砂漠プレビュー |
| 7 | slorim_plain | スローリム平原 |
| 8 | ips_canyon | イプス峡谷 |
| 9 | hatiil_desert | ハティル砂漠 |

### 第3フェーズ（未着手 · 敵追加が必要）

| # | mapSlotId | 名前 | 備考 |
|---|-----------|------|------|
| 10 | bisk | 城下町ビスク | 拠点 |
| 11 | mainland_connector | 接続道 | |
| 12 | legacy_buffer | 試作区バッファ | |
| 13 | elvin_mountains | エルビン山脈 | |
| 14 | darin_mountain | ダーイン山 | |
| 15 | albeez_forest | アルビーズの森 | |
| 16 | ark_ruins | 箱舟遺跡 | |
| 17 | eisis_cave | エイシス・ケイブ | |
| 18 | legacy_prototype | 試作マップ | 展示あり |
| 19 | neoku_mountain | ネオク山 | warp |
| 20 | neoku_plateau | ネオク高原 | warp |
| 21 | elan_palace | エルアン宮殿 | warp |
| 22 | mutum_catacomb | ムトゥーム地下墓地 | future |
| 23 | nubool_village | ヌブールの村 | future |

各エリアの追加敵は progress で Wiki 調査後に確定。公式エリアガイド準拠 · 既存 family と重複しなければバリアント可。

## 参照ファイル

- レジストリ: `src/data/moeMonsterFieldRegistry.js`
- 湧き: `src/lib/moe3dMonsterMapSpawns.js` · `src/data/moeHatiilDesertPlanned.js`
- 第3フェーズ Wiki メモ: `src/data/moeMacro1Phase3AreaWiki.js` · `src/data/moeMacro1Phase3Spawns.js`
- ビルダー: `scripts/monsters/monsterTypeBuilders.mjs`
- カタログ: `scripts/monsters/monsterVariantCatalog.mjs`
- GLB: `npm run generate:macro1`
- ハティル実装例: `scripts/monsters/stormPunisherBuilder.mjs`

## 完了条件（マクロの終わり · ここだけが終了）

- **全23エリア**（`war_age` 除外）それぞれに公式敵 · モデル · スキルアニメ · フィールド配置 · 動作確認まで **すべて ✅**
- **23/23 になった時だけ** 「マクロ１完了」と報告する
- 第1フェーズ9面は済 — 第3フェーズ14面を残タスクとして続行
- 途中進捗ではマクロ終了しない — 残りエリアを続ける
