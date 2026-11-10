/**
 * マクロ設定の「コマンド説明」— MoE 公式のコマンドを やさしく説明するデータ
 *
 * しらべたもと（2026-11-10）:
 *   公式 ゲームコマンド一覧 https://moepic.com/database/command.php
 *   公式 代入文字一覧 https://moepic.com/database/substitute.php
 *   公式 FAQ（マクロ E-40〜45） https://moepic.com/faq/faq_ans_e.php
 *   ファンのページ（/pause 1 ≒ 0.1秒 など）… docs/参考メモ_MOE公式マクロ.md
 *
 * game: このゲーム（life-rpg）で
 *   "yes"  = 使える（マクロの行に入れられる）
 *   "no"   = まだ ない（公式の説明だけ）
 */

/** @typedef {{ cmd: string, args?: string, text: string, example?: string, game?: "yes" | "no" }} MoeMacroGuideCommand */
/** @typedef {{ id: string, title: string, icon: string, intro?: string, notes?: string[], commands?: MoeMacroGuideCommand[] }} MoeMacroGuideSection */

/** @type {MoeMacroGuideSection[]} */
export const MOE_MACRO_COMMAND_GUIDE = [
  {
    id: "start",
    title: "はじめに",
    icon: "📖",
    intro:
      "マクロは、いくつかの技や待ちを 1つのボタンに まとめる しくみです。ボタンを押すと、上の行から順に動きます。",
    notes: [
      "このゲームのマクロは 1〜10。1つのマクロは タイトル ＋ 6行（MoE 公式と同じ 6行）。",
      "行に 技を 長押しで ドロップすると「技」の行（公式の /cmd）。",
      "⏸ を押すと「待ち」の行（公式の /pause）。/pause 1 が 約0.1秒です。",
      "待ちの間は、ほかのマクロを うけつけません（公式と同じ）。",
      "動かすのは、縦スキルの技②（マクロ）か、このパネルの「実行」。",
      "公式には 文字で書くコマンドが たくさん あります。このゲームで使えるのは いまは「技」と「待ち」だけ。ほかは おぼえ書きとして のせています（✕ の印）。",
    ],
  },
  {
    id: "pause",
    title: "待ち（/pause）",
    icon: "⏸",
    intro:
      "技と技の あいだに 少し待つと、2つめの技が ちゃんと出ます。間が たりないと、2つめが 出ないことがあります。",
    notes: [
      "/pause 1 ≒ 0.1秒（くわしくは 0.096秒）。",
      "/pause 2 ≒ 0.2秒、/pause 10 ≒ 1秒、/pause 30 ≒ 3秒、/pause 80 ≒ 8秒。",
      "公式の例: /cmd [アタック] → /pause 30 → /cmd [アタック]",
      "公式では スタミナの のこりで 技の間（ディレイ）が かわるので、数は 自分で ためして 合わせます。",
      "このゲームの待ちは 0.1秒〜60秒（/pause 1〜600）。",
    ],
    commands: [
      {
        cmd: "/pause",
        args: "数",
        text: "マクロの中で 待つ。1 ≒ 0.1秒。",
        example: "/pause 2",
        game: "yes",
      },
    ],
  },
  {
    id: "tips",
    title: "コツ・注意",
    icon: "💡",
    notes: [
      "コマンドの はじめは 半角の「/」。スペースも 半角だけ（全角だと うごかない）。",
      "技名は [ ] でかこむ。[*ソード*] のように * をつけると、名前の 一部で えらべる。",
      "押すたびに次の技: /cmd を ならべると、1回目は 1行目の技、技の間に もう1回押すと 2行目の技…と出る。技を 1つのボタンに まとめられる。",
      "先行入力: 最後に入れた技は、技の間が おわると 自動で出てしまう。ふせぐには、最後の行に「使えない技」（/cmd [美容] や /cmd [採掘] など）を入れる。定番の わざ。",
      "連続で出す技（多段技）の とちゅうに /pause や 持ちかえを 入れると、とちゅうで止まることがある。",
      "同じことを ずっと くりかえすと、スキルの上がりが にぶることがある（アンチマクロ）。",
      "マクロが うごかないときは、つづりと 半角スペースを たしかめる → それでもだめなら /pause を入れる（公式 FAQ）。",
    ],
  },
  {
    id: "macro",
    title: "マクロでよく使う",
    icon: "⭐",
    commands: [
      {
        cmd: "/cmd",
        args: "[技・魔法の名前]",
        text: "技や魔法を使う。いちばん よく使う。",
        example: "/cmd [ヒーリング]",
        game: "yes",
      },
      {
        cmd: "/useitem",
        args: "[アイテム名] <相手>",
        text: "アイテムを使う。相手を書かないと、いまのターゲットに使う。",
        example: "/useitem [*バンデージ*]<1>",
        game: "no",
      },
      {
        cmd: "/equipitem",
        args: "[アイテム名] または 番号",
        text: "装備する。うしろに left で左手、tgl で「つける／はずす」を きりかえ。",
        example: "/equipitem [*ソード*]",
        game: "no",
      },
      {
        cmd: "/swapitembox",
        args: "[アイテム名] または 番号",
        text: "アイテムを 手に持つ（カーソルに付ける）。",
        game: "no",
      },
      {
        cmd: "/swapequip",
        args: "",
        text: "手に持っている アイテムを 装備する。",
        game: "no",
      },
      {
        cmd: "/target",
        args: "名前",
        text: "名前で ターゲットする。",
        example: "/target <pet1>",
        game: "no",
      },
      {
        cmd: "/forget",
        args: "",
        text: "カーソルに付いている 技・魔法を はずす。",
        game: "no",
      },
    ],
  },
  {
    id: "target",
    title: "ターゲット",
    icon: "🎯",
    notes: [
      "相手の しるし: <1> = 自分、<2>〜<5> = パーティーの 2〜5人目。",
      "<player>名前 / <pet>名前 / <pet1>（ペット1番）/ <enemy>名前 で、PC・ペット・敵を はっきり えらべる。",
      "例: /target <enemy>Dain Orc（敵の ダイン オークを ねらう）",
    ],
    commands: [
      { cmd: "/target", args: "名前", text: "名前で ターゲット。", game: "no" },
      { cmd: "/targetnear", text: "いちばん近い PC か NPC を ターゲット。", game: "no" },
      { cmd: "/targetpc", text: "いちばん近い PC（プレイヤー）を ターゲット。", game: "no" },
      { cmd: "/targetnpc", text: "いちばん近い NPC を ターゲット。", game: "no" },
      { cmd: "/targetcps", text: "いちばん近い「もの」を ターゲット。", game: "no" },
      {
        cmd: "/assist",
        text: "仲間を ターゲットして 使うと、その仲間が ねらっている相手に きりかわる。",
        game: "no",
      },
      {
        cmd: "/locktarget",
        text: "ロックターゲット（ターゲットを 中心に 見る）の オン／オフ。",
        game: "no",
      },
      { cmd: "/follow", text: "ターゲットに ついていく。", game: "no" },
      { cmd: "/consider", text: "ターゲットの 強さを 見る。", game: "no" },
      { cmd: "/targetcursor", text: "ターゲットの カーソルを 出す。", game: "no" },
    ],
  },
  {
    id: "battle",
    title: "戦闘",
    icon: "⚔",
    commands: [
      { cmd: "/cmd", args: "[技・魔法の名前]", text: "技や魔法を使う。", game: "yes" },
      { cmd: "/autobattle", text: "自動戦闘の オン／オフ。", game: "no" },
      { cmd: "/pause", args: "数", text: "マクロの中で 待つ（1 ≒ 0.1秒）。", game: "yes" },
      { cmd: "/warinfo", text: "War Age の 支配のようすを 見る。", game: "no" },
    ],
  },
  {
    id: "pet",
    title: "ペット",
    icon: "🐾",
    intro: "このゲームは ペットが 主に戦うので、公式の ペットコマンドも のせておきます。",
    commands: [
      { cmd: "/petattack", text: "ペットに 攻撃させる。", game: "no" },
      { cmd: "/petauto", text: "ペットに 自動で 攻撃させる。", game: "no" },
      { cmd: "/petnoauto", text: "ペットの 自動攻撃を やめる。", game: "no" },
      { cmd: "/petstop", text: "ペットを 止める。", game: "no" },
      { cmd: "/petcome", text: "ペットを よぶ。", game: "no" },
      { cmd: "/petsit", text: "ペットを すわらせる。", game: "no" },
      { cmd: "/pettarget", text: "自分の ペットを ターゲット。", game: "no" },
      { cmd: "/petcorpse", text: "ペットの なきがらを 足もとに よせる。", game: "no" },
      { cmd: "/petaway", text: "ペットを はなす（にがす）。", game: "no" },
      {
        cmd: "/petchangename",
        args: "番号 新しい名前",
        text: "ペットの 名前を かえる。",
        game: "no",
      },
    ],
  },
  {
    id: "move",
    title: "移動",
    icon: "🏃",
    commands: [
      { cmd: "/run", text: "走りに かえる。", game: "no" },
      { cmd: "/walk", text: "歩きに かえる。", game: "no" },
      { cmd: "/sit", text: "すわる。", game: "no" },
      { cmd: "/stand", text: "立つ。", game: "no" },
      { cmd: "/automove", text: "自動で 前へ 進む。", game: "no" },
      { cmd: "/fishingstop", text: "つりを やめる。", game: "no" },
    ],
  },
  {
    id: "chat",
    title: "チャット",
    icon: "💬",
    intro: "マクロに 入れると、技と いっしょに 仲間へ 知らせられます。",
    commands: [
      { cmd: "/say", args: "文", text: "近くの人に 話す。", game: "no" },
      { cmd: "/party", args: "文", text: "パーティーの 仲間に 話す。", example: "/party ＭＰ回復中です。残りＭＰは%mpp", game: "no" },
      { cmd: "/shout", args: "文", text: "広い はんいに 話す（/sh でも）。", game: "no" },
      { cmd: "/yell", text: "まわりに 少し大きな声で 話す。", game: "no" },
      { cmd: "/tell", args: "名前 文", text: "その人だけに 話す。", game: "no" },
      { cmd: "/reply", args: "文", text: "さいごに tell してきた人に 返事。", game: "no" },
      { cmd: "/auction", args: "文", text: "同じ ゾーンの 全員に 話す。", game: "no" },
      { cmd: "/fssay", args: "文", text: "フェローシップ（ギルド）に 話す。", game: "no" },
      { cmd: "/chsay", args: "文", text: "入っている チャンネルに 話す。", game: "no" },
      { cmd: "/ch1 /ch2 /ch3", args: "文", text: "チャンネル 1〜3 に 話す。", game: "no" },
      { cmd: "/emote", args: "エモート", text: "エモートを 文字だけで 出す。", game: "no" },
      { cmd: "/chatbar", args: "文", text: "その文を 入れた 状態で チャット欄を ひらく（/chatbar2 は 日本語入力 オフ）。", game: "no" },
      { cmd: "/msgclear", args: "all か 番号", text: "メッセージの 窓を からにする。", game: "no" },
      { cmd: "/chjoin /chleave", args: "番号 名前 パスワード", text: "チャンネルに 入る／出る。", game: "no" },
      { cmd: "/chlist /chinfo", text: "チャンネルの 一覧／入っている人を 見る。", game: "no" },
    ],
  },
  {
    id: "vars",
    title: "代入文字（%）",
    icon: "％",
    intro:
      "チャットや マクロの 文の中に書くと、いまの 数字や 名前に かわります。例: 「残りＭＰは%mpp」→「残りＭＰは45」",
    commands: [
      { cmd: "%hp / %hpp", text: "自分の HP ／ HP の %。", game: "no" },
      { cmd: "%mp / %mpp", text: "自分の MP ／ MP の %。", game: "no" },
      { cmd: "%st / %stp", text: "自分の スタミナ ／ スタミナの %。", game: "no" },
      { cmd: "%t", text: "いま ターゲットしている 相手の 名前。例: 「%t 発動」", game: "no" },
      { cmd: "%lt / %lnt", text: "ひとつ前の ターゲット ／ さいごの 自分以外の ターゲット。", game: "no" },
      { cmd: "%1〜%5", text: "パーティーの 名前（1 = 自分）。", game: "no" },
      { cmd: "%l / %p / %dir", text: "いる 地域の名前 ／ 座標 ／ むいている 方角。", game: "no" },
      { cmd: "%r", text: "さいごに tell してきた人の 名前。", game: "no" },
      { cmd: "%i", text: "アイテムを 持って 書くと、その アイテムの リンクになる。", game: "no" },
    ],
  },
  {
    id: "party",
    title: "パーティー・仲間",
    icon: "👥",
    commands: [
      { cmd: "/invite", text: "パーティーに さそう。", game: "no" },
      { cmd: "/disband", text: "パーティーから ぬける。", game: "no" },
      { cmd: "/changeleader", text: "リーダーを ゆずる。", game: "no" },
      { cmd: "/friend", args: "名前", text: "フレンドに 登録（もう一度で 消す）。名前なしで 一覧。", game: "no" },
      { cmd: "/ignore", args: "名前", text: "その人の 発言を 見えなくする。", game: "no" },
      { cmd: "/fsinvite /fsdisband", text: "フェローシップに さそう ／ ぬける。", game: "no" },
      { cmd: "/afk", text: "「離席中」の しるし オン／オフ。", game: "no" },
      { cmd: "/lfp", text: "「パーティー募集中」の しるし オン／オフ。", game: "no" },
    ],
  },
  {
    id: "info",
    title: "表示・べんり",
    icon: "🧭",
    commands: [
      { cmd: "/loc", text: "いまの 座標を 出す。", game: "no" },
      { cmd: "/zone", text: "いる ゾーンの 名前。", game: "no" },
      { cmd: "/who", text: "同じ ゾーンの プレイヤー。", game: "no" },
      { cmd: "/senseheading", text: "むいている 方角。", game: "no" },
      { cmd: "/sensecorpse", text: "自分の なきがらの 方向。", game: "no" },
      { cmd: "/homepoint", text: "いまの 復帰地点。", game: "no" },
      { cmd: "/dice", args: "（数 数）", text: "サイコロ（ふつうは 0〜1000）。", game: "no" },
      { cmd: "/help", args: "コマンド", text: "コマンドの 説明を 見る。", game: "no" },
      { cmd: "/codelist", text: "コマンドの 一覧を 見る。", game: "no" },
      { cmd: "/motd", text: "ログインの お知らせを もう一度。", game: "no" },
      { cmd: "/viewport", args: "横 縦", text: "画面の 大きさ（reset で もどす）。", game: "no" },
      { cmd: "/gamma", args: "brightness／contrast／gamma 数", text: "明るさ（reset で もどす）。", game: "no" },
      { cmd: "/windowdefault", text: "窓の ならびを 元にもどす。", game: "no" },
      { cmd: "/killmyself", text: "30秒後に たおれる（動くと とりけし）。", game: "no" },
      { cmd: "/logout", text: "ログアウト。", game: "no" },
    ],
  },
  {
    id: "save",
    title: "マクロの保存",
    icon: "💾",
    notes: [
      "このゲームの マクロは、ブラウザに 自動で 保存されます（トップの「全部保存」にも 入る）。",
      "公式では Menu の あいた所に 登録。右クリック → Macro Editor で 書く・[CLEAR] で 消す。",
      "公式では マクロを 左ボタンで 押したまま 動かすと コピー（入れかえ）。",
    ],
    commands: [
      { cmd: "/savemacro", args: "ファイル名", text: "マクロを 全部 ファイルに 保存（公式）。", game: "no" },
      { cmd: "/loadmacro", args: "ファイル名", text: "保存した マクロを 読みこむ（公式）。", game: "no" },
      { cmd: "/restoredefaultmacro", text: "はじめの マクロに もどす（公式）。", game: "no" },
    ],
  },
  {
    id: "examples",
    title: "例",
    icon: "📝",
    intro: "公式の 書きかたの 例です。→ は 次の行。",
    notes: [
      "回復 → 少し待って ヒーリング: /cmd [回復] → /pause 2 → /cmd [ヒーリング]",
      "3回つづけて 収穫: /cmd [収穫(刈る)] → /pause 40 → /cmd [収穫(刈る)] → /pause 40 → /cmd [収穫(刈る)] → /cmd [美容]",
      "盾の技を出して 両手武器に もどす: /equipitem [*カイト シールド*] → /cmd [シールド ガード] → /pause 13 → /equipitem [*グレート ソード*]",
      "魔法の詠唱（1回目で 詠唱、2回目で 発動）: /equipitem [*ブック*] → /cmd [ヒーリング オール] → /pause 1 → /equipitem [*ソード*]",
      "MP回復を 仲間に 知らせる: /cmd [メディテーション] → /party ＭＰ回復中です。残りＭＰは%mpp",
      "技を 1つに まとめる（押すたびに 次）: /cmd [バーサーク] → /cmd [ナイト マインド] → /cmd [カンフー ソウル]",
    ],
  },
];

/** 説明に のっている コマンドの数（重なりは 1つ） */
export function moeMacroGuideCommandCount(guide = MOE_MACRO_COMMAND_GUIDE) {
  const set = new Set();
  for (const sec of guide) {
    for (const c of sec.commands ?? []) set.add(c.cmd);
  }
  return set.size;
}
