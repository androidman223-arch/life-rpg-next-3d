# MOE 開発メモ（落とし穴）

再発しやすい失敗だけ。**1件最大3行**。古くなったら削除してよい。

---

### 地形歩行（レイキャスト方式・撤去済み）
- 不可視円柱 + 頭上判定で砂漠アルター付近が歩行不能になりやすい
- `terrainWalkRef.current.current` は誤り → `.current` 一回だけ
- 歩行ブロックは一旦オフ。Blender/glb コライダー統合時に再設計

### AGE大陸タイル配置
- `moe3dMacro2AgeTiles` は予約タイル同様 **面中心＝原点**（南西角に置くとスポーンとずれて見えない壁）
- AGE列（iz=4）は **y=0 固定** — `groundY` は iz=3 の飛び出しに吸われてタイルが消えたように見える
- `MoeField3DCanvas` で `addMoe3dMacro2AgeTiles` を呼ぶ（地形ファイルだけでは出ない）
- 歩行は `moe3dClampFieldPlayPosition` — AGE面は `moe3dClampToMapSlotRect`
- ユグ・ソレスとも **マップ消え＝AGEタイル未配線 or y≠0** · 音消え＝面BGM切替失敗を疑う
- L2 `cyl()` が mesh を返さないと `propsSolesValley` で throw → **全AGEタイル読み込み中断**（コンソール `3D map load failed`）
- ビスク中央アルターとプレミアショップが近すぎると転送UIと会話が重なる → `moe3dBiskHubLayout` で南西へ離す · アルター近傍ではショップ会話を出さない
- 湧き tz≈転送スポーン tz だと即ボコられる → `moe3dClearSpawnFromAltarPlayer`（祭壇中心押し出しだけでは足りない）
- ユグ〜ミトヤは **家AGE番地**（敵なし）· `MOE_AGE_HOME_ROW_SLOT_IDS` · 小川·灯り·宅並び
- ミトヤのアルターは巨木中心（0.5,0.5）だと木に埋まって見えない → 東寄り（tx≈0.58）に離す
- AGE列の面判定は `MOE_AGE_ROW_SLOT_ORDER_EAST_FIRST`（ミトヤ先）— 西隣ゲオに吸われない
- アルター `groundY` だけだと隣マクロ地形の飛び出しに吸われて**宙に浮く** → `moe3dAltarGroundY` + `mapTileRootY` で面の歩行高に載せる

### 3D 循環 import（読み込みエラー）
- `moeField3DModels` ↔ `moe3dMonsterMapSpawns` ↔ `moeAltarWarps` ↔ `moe3dWorldLayout` で TDZ → `Cannot access 'MOE_3D_WORLD_MAP_REGISTRY' before initialization`
- タイル定数は **`moe3dLayoutConstants.js` のみ**（他 import 禁止）。`moe3dWorldLayout` は `moeField3DModels` を import しない
- `moe3dMonsterMapSpawns` から `moe3dDesertPreviewTile` を import しない（macro2L1 逆流）。`moe3dBiskHubLayout` から `moeAltarWarps` も禁止

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
- プレイヤー生活改鳳は **リボーンワンス**（死亡3秒後・1回のみ全回復）— `moePhoenixRebirthOnce.js` · ペット生活改鳳には付けない

### 新エルビン渓谷 GLB
- mesh 北端（`maxZ*0.9`）は山頂ではなく谷底 — タイラントは GLB レイキャスト最高床（東山 · z≈17）に湧かせる
- `moe3dElvinKeikokuSummitSpawnNorm` を `moe3dMonsterMapSpawns` 経由で解決（静的 tz だけでは足りない）

### マクロ０（整備）
- **3ファイル以上触った日の終わり**にサイクル0〜3（`.cursor/skills/macro-0/`）
- サイクル0＝diff スキャンのみ · 後回しは `macro-0/BACKLOG.md`
- `import "@/lib/..."` 副作用 import は prefetch 再発の元
