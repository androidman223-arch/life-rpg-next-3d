# マクロ１ 進捗

**方針:** 慌てず公式にていねいに · **10倍以上の時間 OK**

## 第3フェーズ（2026-09-11 · ユーザー指定）

- **指令:** **戦乱時代（`war_age`）以外 · すべてのエリア** に公式敵を追加
- **対象:** 全 **23面**（`MOE_3D_WORLD_MAP_REGISTRY` − `war_age`）
- **状態:** **9/23**（本編9面のみ湧き済み）· 第3フェーズ **未配置**
- **除外:** `war_age` — 敵追加しない
- **次:** Wiki 調査 → 公式湧きどおりに `#10 bisk` から（**他マップ流用禁止**）

### 第3フェーズ 1サイクル目 — ❌ 撤回（2026-09-11）

仮配置（他マップ敵の流用）を **全削除**。ユーザー指摘:

| マップ | 誤り | 公式 |
|--------|------|------|
| エルアン宮殿 | アマゾネス | **白骨·黒骨** など |
| エイシス洞 | ドードルバグ | **スパイダー** |
| 全14面 | 適当な既存敵 | **各マップ Wiki 湧き一覧** |

Wiki メモ: `src/data/moeMacro1Phase3AreaWiki.js` · 湧き: `moeMacro1Phase3Spawns.js`（現在空）

### 第3フェーズ 未着手エリア（14面）

| # | mapSlotId | 名前 | 状態 |
|---|-----------|------|------|
| 10 | bisk | 城下町ビスク | Wiki未 |
| 11 | mainland_connector | 接続道 | Wiki未 |
| 12 | legacy_buffer | 試作区バッファ | Wiki未 |
| 13 | elvin_mountains | エルビン山脈 | Wiki未 |
| 14 | darin_mountain | ダーイン山 | Wiki未 |
| 15 | albeez_forest | アルビーズの森 | Wiki未 |
| 16 | ark_ruins | 箱舟遺跡 | Wiki未 |
| 17 | eisis_cave | エイシス・ケイブ | **スパイダー**（要GLB） |
| 18 | legacy_prototype | 試作マップ | Wiki未 |
| 19 | neoku_mountain | ネオク山 | Wiki未 |
| 20 | neoku_plateau | ネオク高原 | Wiki未 |
| 21 | elan_palace | エルアン宮殿 | **白骨·黒骨**（要GLB） |
| 22 | mutum_catacomb | ムトゥーム地下墓地 | Wiki未 |
| 23 | nubool_village | ヌブールの村 | Wiki未 |

## 第2フェーズ（2026-09-11 · ゆっくり）

- **目標:** **+4サイクル**（サイクル **6〜9**）
- **状態:** **0/4** · **次: 6サイクル目 #1 lexur_hills**
- **ペース:** Wiki調査 → レジストリ → モデル → GLB → 湧き（1匹ずつ）

## 第1フェーズ（完了 ✅）

- **5/5 サイクル完了**（サイクル1〜5）

**公式:** https://wikiwiki.jp/moe-pet/

---

## 6サイクル目（未着手）

| # | エリア | 追加候補（Wiki調査） | 状態 |
|---|--------|---------------------|------|
| 1 | lexur_hills | — | — |
| 2 | meerim_coast | — | — |
| 3 | elvin_valley | — | — |
| 4 | garm_corridor | — | — |
| 5 | ilvana_valley | — | — |
| 6 | desert_preview | — | — |
| 7 | slorim_plain | — | — |
| 8 | ips_canyon | — | — |
| 9 | hatiil_desert | — | — |

---

## 5サイクル目 ✅

| # | エリア | 追加 |
|---|--------|------|
| 1 | lexur_hills | レスクール ハウンド（追加） |
| 2 | meerim_coast | 海ヘビ（追加） |
| 3 | elvin_valley | エルビン バイソン（追加） |
| 4 | garm_corridor | ガルム鹿（追加） |
| 5 | ilvana_valley | イルヴァーナ ウルフ（追加） |
| 6 | desert_preview | 中蠍（追加） |
| 7 | slorim_plain | スローリム ライオン（追加） |
| 8 | ips_canyon | トータス（追加） |
| 9 | hatiil_desert | ストーム パニッシャー B |

## 4サイクル目 ✅

| # | エリア | 追加 |
|---|--------|------|
| 1 | lexur_hills | レスクール アマゾネス（追加） |
| 2 | meerim_coast | ミーリム ラット（追加） |
| 3 | elvin_valley | エルビン ウルフ（追加） |
| 4 | garm_corridor | オーク ギャング（追加） |
| 5 | ilvana_valley | オーク 魔導士（追加） |
| 6 | desert_preview | サンド スコーピオン（追加） |
| 7 | slorim_plain | スローリム ライオン（追加） |
| 8 | ips_canyon | ジャイアント トータス（追加） |
| 9 | hatiil_desert | ドードルバグ（中）B |

## 3サイクル目 ✅

| # | エリア | 追加 |
|---|--------|------|
| 1 | lexur_hills | レスクール ベア（追加） |
| 2 | meerim_coast | ミーリム イーツ（追加） |
| 3 | elvin_valley | エルビン スパイダー（追加） |
| 4 | garm_corridor | オーク ギャング（追加） |
| 5 | ilvana_valley | オーク 魔導士（追加） |
| 6 | desert_preview | サンドワーム（追加） |
| 7 | slorim_plain | ギガース マンモス（追加） |
| 8 | ips_canyon | ジャイアント トータス B |
| 9 | hatiil_desert | ドードルバグ（小）B |

## 2サイクル目 ✅

| # | エリア | 追加 |
|---|--------|------|
| 1 | lexur_hills | レクスール バック B |
| 2 | meerim_coast | ミーリム スネーク（追加） |
| 3 | elvin_valley | エルビン バイソン B |
| 4 | garm_corridor | ガルム鹿 B |
| 5 | ilvana_valley | イルヴァーナ ウルフ B |
| 6 | desert_preview | デザート スコーピオン（中）B |
| 7 | slorim_plain | スローリム ライオン B |
| 8 | ips_canyon | ジャイアント イプス バス B |
| 9 | hatiil_desert | デザート スコーピオン（大）B |

## 1サイクル目 ✅

| # | エリア | 追加敵 | Wiki Lv/HP |
|---|--------|--------|------------|
| 1 | lexur_hills | レクスール バック | 13 / 76 |
| 2 | meerim_coast | ミーリム イーツ | 3 / 27 |
| 3 | elvin_valley | エルビン バイソン 牡 | 40 / 213 |
| 4 | garm_corridor | ガルム鹿 | 13 / 78 |
| 5 | ilvana_valley | イルヴァーナ ウルフ | 32 / 147 |
| 6 | desert_preview | デザート スコーピオン（中） | 74.4 / 745 |
| 7 | slorim_plain | スローリム ライオン | 48 / 243.3 |
| 8 | ips_canyon | ジャイアント イプス バス（大） | 40 / 225.1 |
| 9 | hatiil_desert | デザート スコーピオン（大） | 89.7 / 1235.6 |

---

## スルト鉱山（追加 · 2026-09-12 ✅）

Wiki: [スルト鉱山](https://wikiwiki.jp/moe-pet/エリアガイド/スルト鉱山)

| 敵 | 表示名 | Lv / HP | GLB | 湧き |
|----|--------|---------|-----|------|
| エルアン ナイト（白） | 白骨 | 90.4 / 593.3 | WhiteA/B | 2 |
| エルアン ナイト（黒） | 黒骨 | 108.4 / 853.8 | BlackA/B | 2 |
| サラマンダー | — | 88.3 / 800.0 | SalamanderA/B | 2 |

- `moeSulfurMinePlanned.js` · 公式チェック `moeMacro1OfficialCheck.js` · `npm run smoke` ✅

---

## スルト鉱山（追加 · 2026-09-12 ✅）

Wiki: [スルト鉱山](https://wikiwiki.jp/moe-pet/エリアガイド/スルト鉱山)

| 敵 | 表示名 | Lv / HP | GLB | 湧き |
|----|--------|---------|-----|------|
| エルアン ナイト（白） | 白骨 | 90.4 / 593.3 | WhiteA/B | 2 |
| エルアン ナイト（黒） | 黒骨 | 108.4 / 853.8 | BlackA/B | 2 |
| サラマンダー | — | 88.3 / 800.0 | SalamanderA/B | 2 |

- `moeSulfurMinePlanned.js` · 公式チェック `moeMacro1OfficialCheck.js` · `npm run smoke` ✅
