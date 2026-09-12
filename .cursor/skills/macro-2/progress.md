# マクロ２ 進捗 — 地図磨き

**方針:** 慌てず公式にていねいに · **10倍以上の時間 OK** · L×サイクル制

## 第2フェーズ（2026-09-11 · ゆっくり）

- **目標:** **+20サイクル**（サイクル **11〜30**）
- **状態:** **0/20** · **次: 11サイクル目 L1 #1 lexur_hills**
- **ペース:** 1面ずつ L1→L5 · 面ごとに Wiki 照合 · 一括パス禁止

## 第1フェーズ（完了 ✅）

- **10/10 サイクル完了**（サイクル1〜10）
- 実装: `moe3dMacro2CyclePass.js`（サイクル2〜10 · 第1フェーズのみ）

---

## 11サイクル目（未着手）

| # | エリア | L1 | L2 | L3 | L4 | L5 |
|---|--------|----|----|----|----|-----|
| 1-9 | 全9面 | — | — | — | — | — |

---

## 全10サイクル（各サイクル = 9面 × L1〜L5）

| サイクル | L1地形追い込み | L2目印杭 | L3湧きリング | L4微光 | L5Wikiメモ | 状態 |
|---------|---------------|---------|-------------|--------|-----------|------|
| 1 | 基盤地形 | 名物プロップ | 湧きpad | 演出粒子 | Wiki URL | ✅ |
| 2 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 3 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 4 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 5 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 6 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 7 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 8 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 9 | 小石 | 杭 | リング | 光 | メモ | ✅ |
| 10 | 小石 | 杭 | リング | 光 | メモ | ✅ |

## 1サイクル目 詳細（基盤）

| エリア | L1 | L2 | L3 | L4 | L5 |
|--------|----|----|----|----|-----|
| lexur_hills | 紫丘陵 | 救助ベスト | 湧きpad | 紫ミスト | Wiki ✅ |
| meerim_coast | 砂浜 | 海岸花 | 湧きpad | 飛沫 | Wiki ✅ |
| elvin_valley | 草原 | 牧場柵 | 湧きpad | 光虫 | Wiki ✅ |
| garm_corridor | 石回廊 | 壊橋 | 湧きpad | 灯ゆらぎ | Wiki ✅ |
| ilvana_valley | 川・崖 | 狼爪痕 | 湧きpad | 川シマー | Wiki ✅ |
| desert_preview | 砂丘 | 蠍尾杭 | 湧きpad | 熱気 | Wiki ✅ |
| slorim_plain | 平原 | マンモス骨 | 湧きpad | 草風粒子 | Wiki ✅ |
| ips_canyon | 峡谷 | 亀甲碑 | 湧きpad | 塵 | Wiki ✅ |
| hatiil_desert | 大砂丘 | デスワーム骨 | 湧きpad | **砂嵐** | Wiki ✅ |

## L6 敵サイズ（プレイヤー基準 · MOE公式体型）— ✅

| 項目 | 内容 |
|------|------|
| 基準身長 | 1.52（コグニート♂ = `MOE_PLAYER_MODEL_HEIGHT`） |
| 計算式 | `fit高さ = 1.52 × ratioVsPlayer` |
| 公式ティア | `src/data/moeMacro2OfficialSizeTiers.js`（xs〜superBoss 9段） |
| レジストリ | `src/data/moeMacro2EnemyScaleRegistry.js`（マクロ１配置敵 **31種**） |
| 適用 | `src/lib/moe3dMacro2L6EnemyScale.js` → `enemyModelHeightForKey` |
| 出典 | `MOE_MONSTER_FAMILIES.shapeNote` · https://wikiwiki.jp/moe-pet/ |
| 旧方式 | マクロ１の `×3` 一律（≈1.575m）→ ティア別比率に置き換え |

### 公式体型ティア（ratioVsPlayer）

| ティア | ratio | 例 |
|--------|-------|-----|
| xs | 0.55 | イーツ·イプスバス |
| s | 0.82 | 救助犬·海蛇·亀·小蝎 |
| m | 1.04 | 人型·ラット·オーク·中蝎 |
| mPlus | 1.14 | 鹿·ライオン·クマ·大蝎 |
| l | 1.36 | 狼·蜘蛛·平原ライオン |
| xl | 1.78 | 渓谷牛·巨亀·デスワーム |
| xxl | 2.28 | ギガース·マンモス |
| boss | 3.75 | キマイラ |
| superBoss | 5.75 | ストームパニッシャー |

### エルビン・ミーリム（公式体型 + 微調整 override）

| key | tier | ratio | 表示高さ |
|-----|------|-------|---------|
| meerim_rat | m | **1.12** | ≈1.70m |
| elvin_spider | l | **1.38** | ≈2.10m |
| elvin_wolf | l | **1.40** | ≈2.13m |
| elvin_bison | xl | **1.82** | ≈2.77m |

## 参照モジュール

| L | ファイル |
|---|---------|
| L1 基盤 | `moe3dMacro2L1Tiles.js` |
| L2 | `moe3dMacro2L2Props.js` |
| L3 | `moe3dMacro2L3Spawns.js` |
| L4 | `moe3dMacro2L4Fx.js` |
| L5 | `moe3dMacro2L5Wiki.js` |
| **L6 敵サイズ** | `moeMacro2EnemyScaleRegistry.js` · `moe3dMacro2L6EnemyScale.js` |
| 2〜10サイクル | `moe3dMacro2CyclePass.js` |
