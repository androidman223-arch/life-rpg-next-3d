MOE風 3D フィールド RPG（Next.js + Three.js）。

**全体目次（ゲームの流れ・コード構成）:** [`docs/moe-overview.md`](docs/moe-overview.md)

## 更新の記録（Claude Code）

- 2026-11-10 3D フィールドの見た目を よくした（MOE 風・ローポリでも きれいに）。
  - 地面テクスチャ（草・土・石だたみ・岩・色むら）を世界の位置で張る
  - グラデーションの空と遠くの山なみ・遠くだけ かすむ霧
  - 太陽がプレイヤーについてきて、かげが出る
  - くわしくは `docs/3dmoe-game-spec.txt` 22章。前の版は `backup/old_v01`（git には入れない）
- 2026-11-10 地形のすりぬけを へらした（three-mesh-bvh 0.9.16 を入れた）。
  - 地面に「さがす用の目次（BVH）」を作り、光線を 約3倍 速くした
  - プレイヤーが がけ・高いかべ（1.5より高い）で止まり、かべに そって すべる
  - 金斗雲・ワープ・エルビン渓谷では まだ止めない
  - 硫黄の火山（神殿の GLB）も 止まるようにした。床だけ見る（天井を床と まちがえない）・穴へは行かない
  - くわしくは 仕様書 23章。前の版は `backup/old_v02`
- 2026-11-10 マクロを MoE 公式によせた（タイトル＋6行・待ちは /pause と同じ 0.1秒きざみ・待ちの間は ほかのマクロを うけつけない）。
  - しらべたメモは `docs/参考メモ_MoEマクロ.md`。前のマクロは そのまま 6行に うつる
- 2026-11-10 マクロ登録に「📖 コマンド説明」ボタンを足した。MoE 公式のコマンド 85こを 14の項目で やさしく説明（○ 使える／✕ まだ）。
  - データは `src/data/moeMacroCommandGuide.js`。しらべたメモは `docs/参考メモ_MOE公式マクロ.md`
- 2026-11-10 縦のスキルUIでも、カーソルを置くと 説明が出るようにした（ボタンの横に出る）。
- 2026-11-10 マクロの「設定」を押しても 出ないことがあったのを直した。
  - 保存した位置が 画面の外でも、パネルを 画面の中に もどす（うごかせるパネル ぜんぶ・画面の大きさが かわったときも）
  - マクロ登録は ひらいたとき いちばん手前に出して、パネル全体が 画面に入るようにした
- 2026-11-10 「📖 コマンド説明」を 自分で うごかせるパネルにした（上の帯を ドラッグ・位置は おぼえる）。はじめは マクロ登録の 右、入らなければ 左に出る。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
