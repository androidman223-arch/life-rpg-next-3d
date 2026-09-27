<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## MOE フィールド（life-rpg）

### 目次・全体像
- **1枚目次**: `docs/moe-overview.md`（ゲームの流れ・ルート・コード層・サブシステム一覧）
- ファイル索引: `docs/moe-files.md`（どのファイルに何があるか）
- 再発防止の短い記録: `docs/moe-lessons.md`（1件最大3行）

### 現状の課題
- `MoeFieldMap.jsx` がオーケストレーター兼ゲームループ兼 HUD（7000行超）。新機能はまず `src/lib/` に純粋ロジックを切り出す。
- **敵ターゲット** (`targetEnemyId`) / **味方ターゲット** (`allyTarget`) / **ペットフォーカス** (`petFocused`) は別系統。混同しない。
- **敵アクティブ / ノンアクティブ**（先制・追跡）と **ヘイト**（戦闘ターゲット優先）と **`aggro`**（フィールド追跡フラグ）は別系統。`moeEnemyFieldActive.js`。
- プレイヤー **コンデンスマインド** とペット **マナ増幅法** は似ているが条件が違う（プレイヤーは MP% 制限なし）。
- **3D簡易山** — マクロ３（`.cursor/skills/macro-3/`）ステム+ドーム · 緑コライダー · 山色。一覧は `.cursor/skills/MACROS.md`。

### 追加・変更時の手順
1. `src/lib/moe/moeSubsystemGuide.js` で担当サブシステムを確認
2. 永続化キーは `src/lib/moe/moeStorageRegistry.js` に登録
3. 純粋ロジックは `tests/moe/smoke.test.mjs` でカバーできる形にする
4. `npm run smoke` を実行
5. 開発中はコンソール `__MOE_DEV__.guide()` / `__MOE_DEV__.snapshot()` を利用

### 開発用 API（`npm run dev` のみ）
- `window.__MOE_DEV__.guide()` — サブシステム地図
- `window.__MOE_DEV__.fieldNonActive()` — ノンアクティブ敵 key 一覧
- `window.__MOE_DEV__.snapshot()` — フィールド状態スナップショット
- `window.__MOE_DEV__.invariants()` — 状態矛盾チェック
- `window.__MOE_DEV__.storage()` — localStorage 監査
