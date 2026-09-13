# MOE 開発メモ（落とし穴）

再発しやすい失敗だけ。**1件最大3行**。古くなったら削除してよい。

---

### 地形歩行（レイキャスト方式・撤去済み）
- 不可視円柱 + 頭上判定で砂漠アルター付近が歩行不能になりやすい
- `terrainWalkRef.current.current` は誤り → `.current` 一回だけ
- 歩行ブロックは一旦オフ。Blender/glb コライダー統合時に再設計

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
