---
name: macro-2
description: >-
  MOE全9フィールド面の「質」をL1〜L5×サイクル制で少しずつ改善する。
  ユーザーが「マクロ２」「地図磨き」「マクロ2」と言ったときに必ずこのスキルを
  読んで実行する。マクロ１（敵+1）とは別系統。
disable-model-invocation: true
---

# マクロ２ — 地図磨き（L×サイクル制）

## 指令

すべての地図を **少しずつ** よくする。急がず、セッション跨ぎ OK。

- **マクロ１** = 量（敵・モデル・湧き）
- **マクロ２** = 質（地形・プロップ・演出・没入感）

## 用語（ユーザー指定 · 「ラウンド/R」は使わない）

| 言い方 | 意味 |
|--------|------|
| **L1〜L5** | レイヤー（下表）· **1L = 9面すべて同じレイヤーを ✅** |
| **1サイクル / 1周** | L1→L5 全部 × 9面（質上げ **1回分**） |
| **2サイクル / 2周** | L1→L5 を **2回**（質上げ **2回分**） |
| **十分** | マクロ２をここで止める（完了宣言） |

- 報告・会話では **「ラウンド」「○R」は使わない** → **L** と **サイクル/周** で統一。

## 第2フェーズ指令（2026-09-11 · ゆっくり）

- **追加:** **20サイクル**（サイクル **11〜30** · 第1フェーズ10サイクル完了後）
- **ペース:** **急がない** · **10倍以上の時間 OK** · 1面ずつ Wiki 照合して手を入れる
- **禁止:** `appendAllMoe3dMacro2CyclePasses` の一括延長だけでサイクル完了扱い（各サイクルは **9面 × L1〜L5 を面ごとに意味のある差分** を入れる）
- **サイクル間:** 40秒休憩

## ★指令リスト — 6レイヤー

| L | 内容 | 例 |
|---|------|-----|
| **L1** | 地形の骨格 | 丘陵 · 砂浜 · 峡谷 |
| **L2** | Wiki名物プロップ | ガルム「橋の残骸」 |
| **L3** | 湧き・座標 | 祭壇余白 · リスポーン · pad |
| **L4** | 演出 | ハティル「砂嵐」 |
| **L5** | Wikiメモ | progress に公式URL · 再現点 |
| **L6** | **敵サイズ（プレイヤー基準）** | ratioVsPlayer · 公式体型メモ |

## ★指令リスト — エリア番号 × L1 設計（9面）

| # | mapSlotId | L1 でやること |
|---|-----------|---------------|
| 1 | lexur_hills | 丘陵の起伏 + 紫系グラデ |
| 2 | meerim_coast | 海岸線 · 砂浜 |
| 3 | elvin_valley | 草原 + 木数本 |
| 4 | garm_corridor | 石回廊（橋の残骸 → **L2**） |
| 5 | ilvana_valley | 渓谷の川 · 崖 |
| 6 | desert_preview | ハティル見本との差分整理 |
| 7 | slorim_plain | 平原の広がり · 草 |
| 8 | ips_canyon | 峡谷タイルの細部 |
| 9 | hatiil_desert | 蟻地獄マーカー（砂嵐 → **L4**） |

## 6レイヤー（1L = 全9面 × 同じレイヤー1つ）

| レイヤー | 内容 | 主な変更先 |
|---------|------|-----------|
| **L1** | 地形アイデンティティ | `moe3dMacro2L1Tiles.js` · 予約タイル→専用低ポリ |
| **L2** | プロップ | 木・岩・水辺・Wiki名物1要素 |
| **L3** | 湧き・座標 | spawn / 祭壇周辺 / リスポーン範囲 |
| **L4** | 演出 | 粒子・ライト・時間帯 |
| **L5** | 公式メモ | Wiki URL · 再現した特徴を progress に |
| **L6** | **敵表示サイズ** | `moeMacro2EnemyScaleRegistry.js` · `moe3dMacro2L6EnemyScale.js` |

### L6 敵サイズ（プレイヤー身長基準 · MOE公式体型）

- **基準:** `MOE_PLAYER_MODEL_HEIGHT`（1.52）= コグニート♂トレーナー背高
- **式:** `表示高さ = 1.52 × ratioVsPlayer`
- **ティア:** `moeMacro2OfficialSizeTiers.js` — xs/s/m/mPlus/l/xl/xxl/boss/superBoss（9段）
- **出典:** `MOE_MONSTER_FAMILIES.shapeNote` · Wiki エリアガイド体型
- **適用:** `enemyModelHeightForKey` がマクロ２登録敵31種を優先（マクロ１一律×3は置き換え）
- **中ボス** `elvin_bison`（Bison01.glb）・`auzun_bura` は従来のボススケールを維持

## 対象9面（マクロ１と同じ）

| # | mapSlotId |
|---|-----------|
| 1 | lexur_hills |
| 2 | meerim_coast |
| 3 | elvin_valley |
| 4 | garm_corridor |
| 5 | ilvana_valley |
| 6 | desert_preview |
| 7 | slorim_plain |
| 8 | ips_canyon |
| 9 | hatiil_desert |

## 実行ルール

- 「マクロ２」→ **progress.md** で未完了の **L** が最も手前から再開。
- **1L** = 9面すべて同じレイヤーを ✅（例: L1 地形を9面全部）。
- 1面改善 → すぐ次面へ。報告は進捗更新しつつ **同じ L 内は止まらず** 進める。
- **禁止:** 1面だけで「マクロ２完了」と報告 · L 途中で「L完了」と報告。
- **許可:** 1L だけ終えて次セッションへ · 1サイクル（L1〜L5）終わっても **何周でも** 再サイクル可。
- **方針:** 慌てず公式にていねいに · 長い時間をかけて OK

### ユーザー指定の例

- 「**マクロ２ L4**」→ L4 だけ9面
- 「**マクロ２ L4-L5**」→ L4 と L5 を順に
- 「**マクロ２ 2サイクル**」→ L1〜L5 を2周
- 「**マクロ２ 十分**」→ ここで止める

## L3 手順（湧き・座標 · 1面ずつ）

1. `moe3dMacro2L3Spawns.js` — `MACRO2_L3_ZONES` に面ごと祭壇余白・リスポーン margin。
2. `macro2L3TunedSpawnCoords` を `moe3dMonsterMapSpawns.js` の湧き解決に適用。
3. `appendMoe3dMacro2L3SpawnPads` を L2 直後に呼び、湧き pad をタイル上に表示。
4. 看板 subtitle を `L1+L2+L3 · …` に更新。
5. **progress.md** の L3 列を ✅ → 次面。

## L2 手順（プロップ · 1面ずつ）

1. `moe3dMacro2L2Props.js` に Wiki 名物プロップを追加。
2. `appendMoe3dMacro2L2Props(tile, slotId, …)` を L1 タイル生成後に呼ぶ。
3. 看板 subtitle を L2 反映（`L1+L2 · …`）。
4. **progress.md** の L2 列を ✅ → 次面。

## L6 手順（敵サイズ · 全フィールド敵31種）

1. `moeMacro2OfficialSizeTiers.js` — 公式体型ティア（xs〜superBoss）と key→tier を定義。
2. `moeMacro2EnemyScaleRegistry.js` — ティアから `ratioVsPlayer` を自動生成。
3. `moe3dMacro2L6EnemyScale.js` → `enemyModelHeightForKey` で適用確認。
4. フィールドでプレイヤー横並び比較（ティア単位で微調整）。
5. **progress.md** の L6 を ✅。

## L1 手順（地形 · 1面ずつ）

1. `moe3dMacro2L1Tiles.js` に `buildMoe3dMacro2L1*` を追加 or 強化。
2. `moe3dReservedMapSlots()` から当該 slot を除外（専用タイルに差し替え）。
3. `MoeField3DCanvas.jsx` — `addMoe3dMacro2L1Tiles` で配置。
4. 看板 subtitle を `L1 · 地形` に更新。
5. フィールドで walk / spawn 確認。
6. **progress.md** の L1 列を ✅ → 次面。

## 参照ファイル

- L1 地形: `src/lib/moe3dMacro2L1Tiles.js`
- 予約除外: `src/lib/moe3dWorldLayout.js` · `moe3dReservedMapSlots`
- Canvas: `src/components/MoeField3DCanvas.jsx`
- スロット定義: `MOE_3D_WORLD_MAP_REGISTRY` in `moe3dWorldLayout.js`
- 旧イプス/砂漠: `moe3dIpsCanyonTile.js` · `moe3dDesertPreviewTile.js`（L1統合後も export 維持）

## 完了条件

- **L N 完了** = 9面 × レイヤー N がすべて ✅
- **1サイクル完了** = L1〜L5 全 ✅
- **マクロ２本当の完了** = ユーザーが **「十分」** と言ったとき（次サイクルも指示があれば可）

## 進捗

[progress.md](progress.md) を都度更新する。
