---
name: macro-3
description: >-
  MOE 3D 簡易山マクロ — 上下2ブロック（円柱ステム+半球ドーム）· 緑コライダー ·
  山カラー選択。ユーザーが「マクロ３」「簡易山」「山を作る」と言ったときに
  必ずこのスキルを読んで実行する。
disable-model-invocation: true
---

# マクロ３ — 簡易山

## 成功した方式（これだけ使う）

### 簡易山 = 上下 2 ブロック

| 位置 | Three.js ノード名 | ジオメトリ | 役割 |
|------|-------------------|-----------|------|
| **下** | `macro3-simple-mountain-stem` | `CylinderGeometry` | 円柱ステム · 地面側の空洞を埋める |
| **上** | `macro3-simple-mountain-dome` | `SphereGeometry`（上半分のみ） | ドーム · 見た目の山頂 |

1基まとめ: グループ名 `macro3-simple-mountain`

大きい山: `heightMult: 2`（sy をさらに2倍）または `stackLayers: 2`

### 緑コライダー

- ノード名: `macro3-green-collider`
- `CylinderGeometry` + `EdgesGeometry` ワイヤー（色 `#22c55e`）
- 楕円断面（rx/rz）— **箱分割は使わない**（すき間ですり抜けする）
- `MOE_GREEN_COLLIDER_OUTSET = 1.1` で斜坡より外側

### 山カラー選択

- `moe3dMacro3MountainPalette.js`
- `MOE_MACRO3_SLOT_BIOME` — mapSlotId → バイオーム
- `MOE_MACRO3_BIOME_COLORS` — 森=緑/深緑 · 火山=赤茶 · スルト=硫黄黄 など
- 同一タイル内の丘は **交互** に色

## 調整パラメータ（ここだけ触る）

`moe3dMacro3MountainRegistry.js` → `MOE_MACRO3_MOUNTAIN_SPECS_BY_SLOT`

```js
{ id: "dune-b", x: 0.18, z: 0.12, sx: 0.42, sz: 0.28, sy: 2.4, heightMult: 2 }
```

| キー | 意味 |
|------|------|
| x, z | 位置（× tileW / tileD） |
| sx, sz | **広さ** |
| sy | **高さ**基準（×3） |
| heightMult | さらに高く（大きい山） |

## 触るファイル

| ファイル | 役割 |
|----------|------|
| `moe3dMacro3MountainRegistry.js` | 面ごとの山リスト |
| `moe3dMacro3SimpleMountain.js` | ステム+ドーム · 緑線 |
| `moe3dMacro3MountainPalette.js` | 山カラー |
| `moe3dMacro3Constants.js` | ノード名 · 倍率 · OUTSET |
| `moe3dMacro3Apply.js` | L1 タイルへ追加 |
| `moe3dMacro3Colliders.js` | 歩行ブロック（desert_preview） |
| `moe3dColumnColliderMath.js` | 円柱当たり判定 |

## 未実装（マクロ３では触らない）

以下は **将来案** — 今は削除済み・実装しない:

- ~~L6 地面起伏 · groundY 湧き25°~~
- ~~L8 螺旋山道~~

## 1面の手順

1. `MOE_MACRO3_MOUNTAIN_SPECS_BY_SLOT` に丘を追加
2. `MOE_MACRO3_SLOT_BIOME` で色を確認
3. `npm run dev` → 緑線が斜坡の外側を囲むか
4. 歩行ブロック要る面 → `moe3dMacro3Colliders.js` パターンを追加
5. **progress.md** ✅

## 進捗

[progress.md](progress.md)
