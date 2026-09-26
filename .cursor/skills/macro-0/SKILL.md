---
name: macro-0
description: >-
  機能追加のあと、バグの芽を摘みつつコード・索引を整備する（新機能は足さない）。
  サイクル0（走らせ方＋スキャン）→ 1コード → 2索引 → 3検証。
  ユーザーが「マクロ０」「マクロ0」「マクロ整備」「マクロ掃除」「マクロ虫取り」
  「整理マクロ」「3サイクル整理」と言ったときに必ずこのスキルを読んで実行する。
  「マクロバグ」はマクロ０の俗称（マクロ自体のバグではない）。
disable-model-invocation: true
---

# マクロ０ — 整備（サイクル0 + 3サイクル）

## 指令

機能を無理に足したあと、土台を整える。**新機能は追加しない。**  
バグ修正 · 死コード削除 · 索引更新 · smoke のみ。

| マクロ | 役割 |
|--------|------|
| **マクロ０** | 土台整理・バグの芽摘み（本スキル） |
| マクロ１ | 敵・モデル・湧き |
| マクロ２ | 地図を磨く |
| マクロ３ | 簡易山を置く |

## 呼び方

- **推奨:** マクロ０ / マクロ0 / マクロ整備
- **OK:** マクロ掃除 / マクロ虫取り / 整理マクロ
- **俗称:** マクロバグ（虫取り。マクロが壊れた意味ではない）

---

## サイクル0 — 走らせ方 ＋ スキャン（A1+B1 統合 · 5分）

**いつ走らせるか（A1）**

- 1セッションで **3ファイル以上** 触った · または **2領域以上**（BGM+prefetch 等）変更した → **終わりにマクロ０**
- マクロ１・２に入る **直前** に軽くサイクル0だけでも可
- ユーザーが「マクロ０」と言ったら **即フル実行**（サイクル0〜3）

**スキャン（B1 · 直さない · リストだけ）**

1. `git diff --stat`（または会話で触ったファイル一覧）
2. 領域ラベルを付ける: `bgm` / `prefetch` / `save` / `summon` / `field` / `docs` …
3. P0 候補をメモ（未定義参照 · 副作用 import · 二重起動）
4. 今回やらないものは [BACKLOG.md](BACKLOG.md) に1行追記

---

## サイクル1 — コード（P0 優先）

1. サイクル0の P0 候補から **先に直す**
2. 死コード: `@deprecated` かつ **参照ゼロ** の export だけ削除
3. 1ファイル1責務: 純粋データ・ラベルは `src/lib/`（`MoeFieldMap` 大分割は **しない**）
4. import 経路統一（labels → `moeExternalSaveLabels.js`、BGM → `moeFieldBgm.js`）

### 領域チェックリスト

| 領域 | ファイル | 疑うこと |
|------|----------|----------|
| BGM | `AmbientBgm.jsx`, `moeFieldBgm*.js` | メニュー vs フィールド曲 · 二重切替 |
| 先読み | `moeFieldPrefetch.js`, `MoeFieldPrefetchBoot.jsx`, `MoeFieldMapGate.jsx` | Boot 以外の副作用 import · disabled+await |
| 外部保存 | `moePetSave.js`, `moeExternalSaveLabels.js` | picker id · file input |
| 召喚 | `scripts/summons/`, `moePlayerSummonModels.js` | GLB 生成コマンドと URL の一致 |
| 巨大 orchestrator | `MoeFieldMap.jsx` | **分割は BACKLOG** |

### 禁止パターン grep（D3 · 毎回）

```bash
# 副作用 import（prefetch 再発防止）
rg 'import "@/lib/' src
```

ヒットしたら **Boot 以外は削除**（named import に統一）。

---

## サイクル2 — 索引・一貫性

1. `src/lib/moe/moeStorageRegistry.js` — 新 localStorage キー（MOE + グローバル BGM 等）
2. `src/lib/moe/moeSubsystemGuide.js` — 新サブシステム
3. `docs/moe-files.md` — ファイル索引
4. `docs/moe-lessons.md` — 落とし穴 **1件最大3行**
5. 純粋ロジックがあれば `tests/moe/smoke.test.mjs` に追加
6. `macro-1/progress.md` の **重複ブロック** があれば削除のみ

---

## サイクル3 — 検証・締め

### 自動

```bash
npm run smoke
```

`npm run dev` 中なら任意:

- `__MOE_DEV__.invariants()`
- `__MOE_DEV__.storage()` — registry 未登録キー

### 手動スモーク（短く）

- [ ] ホーム BGM が鳴る
- [ ] MOE フィールド入室（prefetch 後も入れる）
- [ ] 面 BGM → メニュー戻りでメニュー BGM
- [ ] 外部保存 UI（フォルダ変更で落ちない）
- [ ] 召喚 GLB が `public/assets/models/summon/` に存在（`generate:summons`）

### 終了報告テンプレ（F · 毎回）

```
【マクロ０完了】
· P0: （直した / 残した＋理由）
· 索引: （更新ファイル）
· smoke: （件数） pass
· BACKLOG: （今回積んだ or 消化した1〜3件）
```

---

## BACKLOG（G）

後回しは [.cursor/skills/macro-0/BACKLOG.md](BACKLOG.md) に1行。  
深掘りマクロ０（任意60分）で **1〜2件だけ** 消化。新機能は BACKLOG に書いても **マクロ０では実装しない**。

---

## やらないこと

- 新機能 · 仕様変更 · スキル配線 · 召喚 VFX
- `MoeFieldMap.jsx` 大規模分割（BACKLOG のみ）
- `moePetSave.js` ファイル分割（BACKLOG のみ）
- 無関係リファクタ
- git commit（ユーザー依頼時のみ）

## 完了条件

- サイクル0スキャン済み
- P0 ゼロ（または理由付き残し + BACKLOG）
- smoke 全パス
- 終了報告テンプレ4行をユーザーに送る
