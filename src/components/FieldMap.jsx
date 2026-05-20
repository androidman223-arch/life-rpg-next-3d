"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const PLAYER_R = 18;
const SLIME_W = 56;
const SLIME_H = 58;
const TREE_R = 36;
const MOVE_SPEED = 4.2;
const SLIME_DAMAGE = 3;
const SLIME_HP_BASE = 10;
const SLIMES_PER_SCREEN = 3;

function getSlimeStats(level) {
  return {
    hpMax: SLIME_HP_BASE + (level - 1) * 15,
    emoji: level >= 10 ? "🐉" : level >= 7 ? "👹" : level >= 5 ? "🐺" : level >= 3 ? "🐝" : "🦠",
    name: level >= 10 ? "ドラゴン" : level >= 7 ? "オーガ" : level >= 5 ? "ウルフ" : level >= 3 ? "ハチ" : "スライム",
    color: level >= 10 ? "bg-red-600 border-red-400" : level >= 7 ? "bg-purple-600 border-purple-400" : level >= 5 ? "bg-orange-500 border-orange-300" : level >= 3 ? "bg-yellow-500 border-yellow-300" : "bg-lime-500 border-lime-400",
  };
}

function getAreaLevel(sx, sy) {
  // sy: 0(上), 1(中), 2(下) -> 元は2段だったが3段以上に拡張する想定
  // sx: 0(左), 1(中), 2(右)
  if (sy === 3) return 10; // 最上段
  if (sy === 2) return 7;
  if (sy === 1) return 5;
  if (sx === 0 && sy === 0) return 1; // スタート地点（左下）
  return 3;
}

function inRiver(px, py, mapW, mapH) {
  // 各段の間に川を配置
  const screenH = mapH / 4;
  
  // 川の範囲を計算（各セクションの境界付近）
  // セクション1と2の間: screenH * 1
  // セクション2と3の間: screenH * 2
  // セクション3と4の間: screenH * 3
  
  for (let i = 1; i <= 3; i++) {
    const rivCenter = screenH * i;
    const rivTop = rivCenter - screenH * 0.08;
    const rivBot = rivCenter + screenH * 0.08;
    
    if (py >= rivTop && py <= rivBot) {
      // 橋の判定 (中央付近)
      const brW = 120;
      const cx = mapW / 2;
      if (px >= cx - brW / 2 && px <= cx + brW / 2) return false;
      return true;
    }
  }
  
  return false;
}

function inTown(px, py, town) {
  return (
    px >= town.x &&
    px <= town.x + town.w &&
    py >= town.y &&
    py <= town.y + town.h
  );
}

function treeHit(px, py, trees) {
  for (const t of trees) {
    const dx = px - t.x;
    const dy = py - t.y;
    if (dx * dx + dy * dy < (TREE_R + PLAYER_R) ** 2) return true;
  }
  return false;
}

function randomSlimePos(sx, sy, screenW, screenH, mapW, mapH, town, trees) {
  const x0 = sx * screenW;
  const y0 = (3 - sy) * screenH; // sy=0が下、sy=3が上になるように調整
  for (let n = 0; n < 50; n++) {
    const x = x0 + 50 + Math.random() * (screenW - 100);
    const y = y0 + 50 + Math.random() * (screenH - 100);
    if (inTown(x, y, town)) continue;
    if (inRiver(x, y, mapW, mapH)) continue;
    if (treeHit(x, y, trees)) continue;
    return { x, y };
  }
  return { x: x0 + screenW / 2, y: y0 + screenH / 2 };
}

function buildWorld(mapW, mapH) {
  const screenW = mapW / 3;
  const screenH = mapH / 4; // 4段にする
  const town = { x: 0, y: mapH - 150, w: 200, h: 150 };

  const trees = [];
  for (let i = 0; i < 80; i++) {
    const x = 80 + Math.random() * (mapW - 160);
    const y = 80 + Math.random() * (mapH - 160);
    if (inTown(x, y, town)) continue;
    if (inRiver(x, y, mapW, mapH)) continue;
    trees.push({ x, y, id: i });
  }

  const flowers = [];
  for (let i = 0; i < 120; i++) {
    flowers.push({
      x: Math.random() * mapW,
      y: Math.random() * mapH,
      id: i,
      hue: Math.random() > 0.5 ? "pink" : "yellow",
    });
  }

  const slimes = [];
  let id = 0;
  for (let sy = 0; sy < 4; sy++) { // 4段
    for (let sx = 0; sx < 3; sx++) {
      const level = getAreaLevel(sx, sy);
      const stats = getSlimeStats(level);
      for (let k = 0; k < SLIMES_PER_SCREEN; k++) {
        const { x, y } = randomSlimePos(
          sx,
          sy,
          screenW,
          screenH,
          mapW,
          mapH,
          town,
          trees
        );
        slimes.push({
          id: id++,
          x,
          y,
          level,
          hp: stats.hpMax,
          hpMax: stats.hpMax,
          screen: sx + sy * 3,
          ...stats
        });
      }
    }
  }

  return { town, trees, flowers, slimes, screenW, screenH };
}

export default function FieldMap({ onBack, onSlimeDefeat }) {
  const [view, setView] = useState({ w: 1200, h: 720 });
  const mapW = view.w * 3;
  const mapH = view.h * 4; // 4段分

  const [world, setWorld] = useState(null);
  const [slimes, setSlimes] = useState([]);
  const [player, setPlayer] = useState({ x: 300, y: 400 });
  const [toast, setToast] = useState(null);

  const keysRef = useRef({});
  const slimeIdRef = useRef(SLIMES_PER_SCREEN * 12); // 3x4=12画面分
  const townExitRef = useRef(false);

  useEffect(() => {
    const measure = () => {
      setView({
        w: Math.max(360, window.innerWidth),
        h: Math.max(480, window.innerHeight),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const mw = view.w * 3;
    const mh = view.h * 4; // 4段分
    const w = buildWorld(mw, mh);
    setWorld(w);
    setSlimes(w.slimes);
    slimeIdRef.current = w.slimes.length;
    setPlayer({
      x: w.town.x + w.town.w + 80,
      y: w.town.y + w.town.h / 2, // 町の中央右側に配置
    });
    townExitRef.current = false;
  }, [view]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const down = (e) => {
      const k = e.key;
      if (
        k === "ArrowUp" ||
        k === "ArrowDown" ||
        k === "ArrowLeft" ||
        k === "ArrowRight" ||
        k === "w" ||
        k === "a" ||
        k === "s" ||
        k === "d" ||
        k === "W" ||
        k === "A" ||
        k === "S" ||
        k === "D"
      ) {
        e.preventDefault();
        keysRef.current[k] = true;
      }
    };
    const up = (e) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    if (!world) return;

    const { town, trees } = world;
    let raf;

    const loop = () => {
      const k = keysRef.current;
      let dx = 0;
      let dy = 0;
      if (k["ArrowUp"] || k["w"] || k["W"]) dy -= 1;
      if (k["ArrowDown"] || k["s"] || k["S"]) dy += 1;
      if (k["ArrowLeft"] || k["a"] || k["A"]) dx -= 1;
      if (k["ArrowRight"] || k["d"] || k["D"]) dx += 1;
      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy) || 1;
        dx = (dx / len) * MOVE_SPEED;
        dy = (dy / len) * MOVE_SPEED;
      }

      setPlayer((prev) => {
        let nx = prev.x + dx;
        let ny = prev.y + dy;
        nx = Math.max(PLAYER_R, Math.min(mapW - PLAYER_R, nx));
        ny = Math.max(PLAYER_R, Math.min(mapH - PLAYER_R, ny));

        if (inRiver(nx, ny, mapW, mapH)) {
          nx = prev.x;
          ny = prev.y;
        }
        if (treeHit(nx, ny, trees)) {
          nx = prev.x;
          ny = prev.y;
        }

        if (inTown(nx, ny, town)) {
          if (!townExitRef.current) {
            townExitRef.current = true;
            queueMicrotask(() => onBackRef.current?.());
          }
          return prev;
        }

        return { x: nx, y: ny };
      });

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [world, mapW, mapH]);

  const handleSlimeClick = useCallback(
    (e, slimeId) => {
      e.stopPropagation();
      if (!world) return;

      const { town, trees, screenW, screenH } = world;

      setSlimes((prev) =>
        prev.map((s) => {
          if (s.id !== slimeId) return s;
          const hp = s.hp - SLIME_DAMAGE;
          if (hp <= 0) {
            setToast(`${s.name}を討伐！ 経験値 +1`);
            onSlimeDefeat?.();
            const sx = s.screen % 3;
            const sy = Math.floor(s.screen / 3);
            const pos = randomSlimePos(
              sx,
              sy,
              screenW,
              screenH,
              mapW,
              mapH,
              town,
              trees
            );
            slimeIdRef.current += 1;
            return {
              ...s,
              id: slimeIdRef.current,
              x: pos.x,
              y: pos.y,
              hp: s.hpMax,
            };
          }
          return { ...s, hp };
        })
      );
    },
    [world, mapW, mapH, onSlimeDefeat]
  );

  if (!world) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-zinc-900 text-white">
        フィールドを読み込み中…
      </div>
    );
  }

  const { town, trees, flowers } = world;
  const camX = view.w / 2 - player.x;
  const camY = view.h / 2 - player.y;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {toast && (
        <div
          className="absolute left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl border-2 border-amber-300 bg-amber-500/95 px-8 py-3 text-xl font-black text-white shadow-xl"
          role="status"
        >
          {toast}
        </div>
      )}

      <div className="absolute left-3 top-3 z-40 max-w-[min(90vw,22rem)] rounded-lg border border-white/20 bg-black/55 px-3 py-2 text-xs text-white/90 backdrop-blur-sm">
        <p className="font-bold text-emerald-300">フィールド</p>
        <p>WASD / 矢印キーで移動</p>
        <p>敵をクリックで攻撃（1ヒット {SLIME_DAMAGE} ダメージ）</p>
        <p className="font-bold text-pink-300">討伐で経験値 +1（トップ画面に保存）</p>
        <p className="text-amber-200/90">左下の町に触れるとメイン画面へ</p>
      </div>

      <div
        className="absolute will-change-transform"
        style={{
          width: mapW,
          height: mapH,
          transform: `translate(${camX}px, ${camY}px)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                #3d7a46 0px,
                #3d7a46 24px,
                #458a50 24px,
                #458a50 48px
              ),
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 31px,
                rgba(0,0,0,0.06) 31px,
                rgba(0,0,0,0.06) 32px
              )
            `,
            backgroundBlendMode: "normal, multiply",
          }}
        />

        {flowers.map((f) => (
          <div
            key={f.id}
            className="pointer-events-none absolute text-lg opacity-80"
            style={{
              left: f.x,
              top: f.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {f.hue === "pink" ? "🌸" : "🌼"}
          </div>
        ))}

        {[...Array(3)].map((_, i) => (
          <React.Fragment key={i}>
            <div
              className="pointer-events-none absolute left-0 right-0 border-y-4 border-cyan-900/60"
              style={{
                top: (mapH / 4) * (i + 1) - (mapH / 4) * 0.08,
                height: (mapH / 4) * 0.16,
                background:
                  "linear-gradient(180deg, #1e6b8a 0%, #2a8fb8 40%, #1e6b8a 100%)",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)",
              }}
            />
            <div
              className="pointer-events-none absolute left-0 right-0 opacity-40"
              style={{
                top: (mapH / 4) * (i + 1) - (mapH / 4) * 0.08,
                height: (mapH / 4) * 0.16,
                background:
                  "repeating-linear-gradient(90deg, transparent, transparent 14px, rgba(255,255,255,0.12) 14px, rgba(255,255,255,0.12) 28px)",
              }}
            />
            <div
              className="pointer-events-none absolute rounded-md border-4 border-amber-900/80 shadow-lg"
              style={{
                left: mapW / 2 - 60,
                top: (mapH / 4) * (i + 1) - (mapH / 4) * 0.09,
                width: 120,
                height: (mapH / 4) * 0.18,
                background:
                  "repeating-linear-gradient(90deg, #a0703a 0 12px, #8b5a2b 12px 24px)",
                boxShadow: "0 6px 0 rgba(0,0,0,0.35)",
              }}
            />
          </React.Fragment>
        ))}

        {trees.map((t) => (
          <div
            key={t.id}
            className="pointer-events-none absolute select-none"
            style={{
              left: t.x,
              top: t.y,
              transform: "translate(-50%, -60%)",
              fontSize: 44,
              filter: "drop-shadow(2px 4px 2px rgba(0,0,0,0.45))",
            }}
          >
            🌳
          </div>
        ))}

        <div
          className="pointer-events-none absolute flex flex-col items-center justify-end rounded-tr-3xl border-2 border-amber-300/70 bg-gradient-to-t from-amber-900/90 to-amber-700/75 pb-3 shadow-inner"
          style={{
            left: town.x,
            top: town.y,
            width: town.w,
            height: town.h,
          }}
        >
          <span className="text-3xl drop-shadow-md">🏘️</span>
          <span className="mt-1 text-sm font-bold text-amber-100">町</span>
        </div>

        {slimes.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`absolute flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 px-1 py-0.5 text-xl shadow-lg transition hover:scale-110 active:scale-95 ${s.color}`}
            style={{
              left: s.x - SLIME_W / 2,
              top: s.y - SLIME_H / 2,
              width: SLIME_W,
              minHeight: SLIME_H,
            }}
            onClick={(e) => handleSlimeClick(e, s.id)}
            aria-label={`${s.name}を攻撃`}
          >
            <span className="leading-none">{s.emoji}</span>
            <span className="mt-0.5 text-[9px] font-bold leading-tight text-white/90">
              Lv.{s.level} {s.name}
            </span>
            <span className="font-mono text-[10px] font-bold text-white drop-shadow">
              HP {s.hp}
            </span>
          </button>
        ))}

        <div
          className="pointer-events-none absolute flex items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-xl shadow-xl"
          style={{
            left: player.x - PLAYER_R,
            top: player.y - PLAYER_R,
            width: PLAYER_R * 2,
            height: PLAYER_R * 2,
          }}
        >
          🧙
        </div>
      </div>
    </div>
  );
}
