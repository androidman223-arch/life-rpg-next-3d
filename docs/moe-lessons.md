# MOE 開発メモ（落とし穴）

再発しやすい失敗だけ。**1件最大3行**。古くなったら削除してよい。

---

### 地形歩行（レイキャスト方式・撤去済み）
- 不可視円柱 + 頭上判定で砂漠アルター付近が歩行不能になりやすい
- `terrainWalkRef.current.current` は誤り → `.current` 一回だけ
- 歩行ブロックは一旦オフ。Blender/glb コライダー統合時に再設計

### AGE大陸タイル配置
- `moe3dMacro2AgeTiles` は予約タイル同様 **面中心＝原点**（南西角に置くとスポーンとずれて見えない壁）
- 歩行は `moe3dClampFieldPlayPosition` — AGE面は `moe3dClampToMapSlotRect`

### 簡易山（マクロ３）
- 下 `macro3-simple-mountain-stem`（Cylinder）+ 上 `macro3-simple-mountain-dome`（半球）
- 緑コライダーは楕円円柱 · 箱分割はすき間ですり抜け · `MOE_GREEN_COLLIDER_OUTSET`
- 山色は `moe3dMacro3MountainPalette.js` · リストは `moe3dMacro3MountainRegistry.js`

### ミニマップ敵マーク
- 大きい＋不透明だと地名が隠れる → 小さめ・半透明・近傍のみ、ラベルは最前面

### ペット戦闘「もどれ」
- 攻撃モーション中に戻れ → 3Dの `petCombatPosLock` / 攻撃アニメが残りその場で揺れ続ける
- `endActiveDuel` の `duelCombatSessionRef` で Canvas 側ロックを即解除する

### 敵索敵（プレイヤー検知）
- 視野=前方扇形 · 聴覚=足音（敏感/普通/鈍感）· 検知対象はプレイヤー
- データは `moeEnemyDetection.js` · 扇形/円は `MoeField3DCanvas` · 敵ステでライブ表示

### 敵アクティブ / ノンアクティブ（ヘイトとは別）
- **索敵**（色・ステサーチ「検知」）と **追跡**（`aggro`）は分離。ノンアクティブも範囲内は色変化する
- 一覧は `moeEnemyFieldActive.js` の `MOE_ENEMY_FIELD_NON_ACTIVE_KEYS` · スキル表の「ノンアクティブ」も参照
- プレイヤー先制攻撃はノンアクティブでも可。牛・鹿・亀が勝手に追ってくるのはここを疑う

### 3D 先読み（prefetch）
- `moeFieldPrefetch.js` の **import 時 auto-start** は副作用が散る → `MoeFieldPrefetchBoot` だけが起動
- `import "@/lib/moeFieldPrefetch"` の副作用 import は不要（named import で十分）
- ボタン `disabled` + navigate 前の `await` は入室不能の原因になりやすい

### フィールド BGM
- メニュー曲とフィールド曲は別。pathname で切替 · ボタンイベントは自動再生アンロックのみ
- `fieldAutoRef` が false のとき手動曲選択。ゾーン/戦闘イベントは field 中のみ有効
- 曲 ID は `moeFieldBgmMap.js` に集約（AmbientBgm の LOCAL_TRACKS と id を揃える）

### 外部セーブ
- ブラウザは **フォルダ名のみ**（フルパス不可）。Desktop 等を直接選ぶと表示が分かりやすい
- `showDirectoryPicker({ id })` の id 定数を忘れると ReferenceError
- 読み込みは `<input type="file">` が全ブラウザで確実

### プレイヤー召喚プレスキル（生活改鳳 · 自力整龍）
- **技③** の `jiriki_kaihou` / `jiriki_seiryu` と、ペット技②の `phoenix_habit_ascension`（同名「生活改鳳」）は別物
- プレイヤー生活改鳳に攻撃2倍は付けない → `phoenix_scorching_sky` で別トグル
- 整龍単発ダメは `moePlayerPreSkills.js` の `combatFixedDamage`（現在 333）

### マクロ０（整備）
- **3ファイル以上触った日の終わり**にサイクル0〜3（`.cursor/skills/macro-0/`）
- サイクル0＝diff スキャンのみ · 後回しは `macro-0/BACKLOG.md`
- `import "@/lib/..."` 副作用 import は prefetch 再発の元
